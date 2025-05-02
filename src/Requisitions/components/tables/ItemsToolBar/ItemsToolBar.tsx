import { Alert, AlertColor, Button, Stack, Typography } from "@mui/material";
import ItemActions from "../ItemActions/ItemActions";
import { AlertInterface, Item, RequisitionStatus } from "../../../types";
import { BaseButtonStyles } from "../../../../utilStyles";
import { ItemsContext } from "../../../context/ItemsContext";
import { useContext, useState } from "react";
import { ProductsTableModal } from "../../modals/ProductsTableModal/ProductsTableModal";
import { useParams } from "react-router-dom";
import CreateQuoteModal from "../../modals/CreateQuoteModal/CreateQuoteModal";
import QuoteListModal from "../../modals/QuoteListModal/QuoteListModal";
import { green } from "@mui/material/colors";
import { updateItemToSupplier } from "../../../utils";
import typographyStyles from "../../../utilStyles";
import { GridColDef } from "@mui/x-data-grid";

interface props {
  handleCancelItems: (items: Item[]) => Promise<void>;
  handleActivateItems: (items: Item[]) => Promise<void>;
  handleCopyContent: (selectedItems: Item[]) => Promise<void>;
  handleDelete: (requisitionItems: Item[]) => Promise<void>;
  selectedRows: Item[] | undefined;
  requisitionStatus? : RequisitionStatus;
  setSelectingPrices: React.Dispatch<React.SetStateAction<boolean>>;
  setItemToSupplierMap: React.Dispatch<any>
  selectingPrices: boolean;
  itemToSupplierMap: any;
  getColumns: () => GridColDef[]
  visibleRows? : Item[];
  findQuotedQuantity: (supplier: string, row: any) => any
}

const ItemsToolBar = ({
  handleCancelItems,
  handleActivateItems,
  handleCopyContent,
  handleDelete,
  selectedRows,
  requisitionStatus,
  setSelectingPrices,
  selectingPrices,
  itemToSupplierMap,
  setItemToSupplierMap,
  visibleRows,
  getColumns,
  findQuotedQuantity
}: props) => {
  const { toggleAdding } = useContext(ItemsContext);
  const { id } = useParams();
  const [alert, setAlert] = useState<AlertInterface>();
  const [creatingQuote, setCreatingQuote] = useState<boolean>(false);
  const [quoteListOpen, setQuoteListOpen] = useState<boolean>(false);
  const quoteExists = getColumns().length > 6;

  const calculateTotal = () => {
    if (!visibleRows) return 0;
    return visibleRows.reduce((total, item) => {
      const matchingItemToSupplier = itemToSupplierMap.find((mapItem: any) => mapItem.ID === item.ID);
      if (matchingItemToSupplier) {
        const supplierValue = Number(item[matchingItemToSupplier.supplier as keyof Item] || 0) * findQuotedQuantity(matchingItemToSupplier.supplier, item);
        return total + supplierValue;
      }
      return total;
    }, 0);
  };

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };

  const handleSavePrices = async ( ) => { 
    if(!itemToSupplierMap.length){ 
      displayAlert('warning', 'Nenhum item selecionado');
      return;
    }
    try {
      const updatedItemToSupplier = await updateItemToSupplier(itemToSupplierMap, Number(id));
      setItemToSupplierMap(updatedItemToSupplier);
      setSelectingPrices(false);
    } catch (e) {
      displayAlert('error', 'Erro ao eleger preços da requisição');
    }
  }

  const handleViewQuoteList = () => {
    setQuoteListOpen(true);
  };

  const verifySelectedItems = () => {
    if (!selectedRows?.length) {
      displayAlert("warning", "Selecione os items para gerar a cotação");
      return;
    }
    if(requisitionStatus?.etapa !==  2){ 
        displayAlert('warning', `Só é permitido gerar cotação no Status 'Em cotação'`)
        return;
    }
    setCreatingQuote(true);
  };
  return (
    <Stack
      direction="row"
      sx={{
        height: 46,
        alignItems: "center",
        gap: 2,
        overflowX: "auto",
        "&::-webkit-scrollbar-thumb": {
          display: "none",
          height: "2px",
          backgroundColor: "#888", // Cor da barra de rolagem
          borderRadius: "4px", // Bordas arredondadas
        },
      }}
    >
      {
        <ItemActions
          handleCancelItems={handleCancelItems}
          handleActivateItems={handleActivateItems}
          handleCopyContent={handleCopyContent}
          handleDelete={handleDelete}
          selectedItems={selectedRows}
        />
      }
      <Button
        onClick={() => {
          if (requisitionStatus?.etapa === 0) {
            toggleAdding();
            return;
          }
          displayAlert(
            "warning",
            `Não é permitido adicionar items no status '${requisitionStatus?.nome}'`
          );
        }}
        sx={{ ...BaseButtonStyles, height: 30, minWidth: 150 }}
      >
        Adicionar items
      </Button>

      {requisitionStatus?.etapa === 2 && (
        <Button
          onClick={verifySelectedItems}
          sx={{ ...BaseButtonStyles, height: 30, minWidth: 150 }}
        >
          Gerar Cotação
        </Button>
      )}
      {(quoteExists) && requisitionStatus && requisitionStatus?.etapa >= 2 && (
        <Button
          onClick={handleViewQuoteList}
          sx={{ ...BaseButtonStyles, height: 30, minWidth: 150 }}
        >
          Ver Cotações
        </Button>
      )}

      {quoteExists && !selectingPrices && requisitionStatus?.etapa === 2 && (
          <Button
            onClick={() => {setSelectingPrices(true)}}
            sx={{ ...BaseButtonStyles, height: 30, minWidth: 150 }}
          >
            Selecionar Preços
            </Button>
        )
      }
      { 
        selectingPrices && (
          <Button
            onClick={() => {setSelectingPrices(false)}}
            sx={{ ...BaseButtonStyles, height: 30, minWidth: 150 }}>
            Cancelar Seleção de preços
            </Button>

        )
      }
      {
        selectingPrices && (
          <Button
            onClick={() => handleSavePrices()}
            sx={{
              ...BaseButtonStyles, height: 30, minWidth: 150, backgroundColor: green[800], "&:hover": { backgroundColor: green[500] },
              color: 'white'
            }}>
              Salvar seleção de preços
          </Button>

        )
      }
      { 
         <Stack direction="row" gap={1}>
          <Typography sx={{ ...typographyStyles.heading2, color: 'black' }}>
            {itemToSupplierMap.length === visibleRows?.length ? 'Total: ' : 'Total Parcial: '}
          </Typography>
          <Typography sx={{ ...typographyStyles.heading2, color: green[800] }}>
            {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Typography>
         </Stack>
      }
      <ProductsTableModal requisitionID={Number(id)} />
      {alert && (
        <Alert severity={alert.severity as AlertColor}>{alert.message}</Alert>
      )}
      <CreateQuoteModal
        setCreatingQuote={setCreatingQuote}
        creatingQuote={creatingQuote}
        selectedRows={selectedRows}
        requisitionId={Number(id)}
      />
      <QuoteListModal
        open={quoteListOpen}
        requisitionId={Number(id)}
        onClose={() => setQuoteListOpen(false)}
        setQuoteListOpen={setQuoteListOpen}
      />
    </Stack>
  );
};

export default ItemsToolBar;

import { Alert, AlertColor, Button, Stack, Typography } from "@mui/material";
import ItemActions from "../ItemActions/ItemActions";
import { AlertInterface, Item, QuoteItem, RequisitionStatus } from "../../../types";
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
  getColumns: () => GridColDef[];
  findQuotedQuantity: (supplier: string, row: any) => any;
  quoteItems?: QuoteItem[];
  visibleRows?: Item[];
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
  quoteItems,
  getColumns}: props) => {
  const { toggleAdding } = useContext(ItemsContext);
  const { id } = useParams();
  const [alert, setAlert] = useState<AlertInterface>();
  const [creatingQuote, setCreatingQuote] = useState<boolean>(false);
  const [quoteListOpen, setQuoteListOpen] = useState<boolean>(false);

  const quoteExists = getColumns().length > 6;

  const getItemCost = (item: QuoteItem) => {
      const price = Number(item.preco_unitario);
      const ipiPercentage = Number(item.IPI || 0 ) / 100;
      const stPercentage = Number(item.ST || 0) / 100;
      const ipi = price * ipiPercentage;
      const st = price * stPercentage;
      return price  + ipi + st;
    
  };

  const getItemsTotal = (items: Item[]) => { 0
    const total =  items.reduce((acc : number, item : Item) => {
         if(item.item_cotacao_selecionado){ 
           acc += item?.item_cotacao_selecionado.quantidade_cotada * getItemCost(item.item_cotacao_selecionado);
         }
      return acc;
      }, 0);
      return total;
  }

  const getShippingCost = () => { 
    const pricesBySupplier: { fornecedor: string; valor_frete: number }[] = [];
    if (Array.isArray(itemToSupplierMap)) {
      itemToSupplierMap.forEach((map: any) => {
        const matchingQuoteItem = quoteItems?.find(
          (quoteItem) => quoteItem.fornecedor === map.supplier
        );
        const isOnPricesBySupplier = pricesBySupplier.some(
          (price: any) => price.fornecedor === map.supplier
        );
        if (matchingQuoteItem && !isOnPricesBySupplier) {
          pricesBySupplier.push({
            fornecedor: map.supplier,
            valor_frete: Number(matchingQuoteItem.valor_frete),
          });
        }
      });
    }
    console.log("pricesBySupplier: ", pricesBySupplier);
    return pricesBySupplier.reduce((acc, price) => acc + price.valor_frete, 0);
    
  }

  const calculateTotal = () => { 
    if(visibleRows){ 
      return getItemsTotal(visibleRows) + getShippingCost();
    }

  }

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

      {requisitionStatus?.etapa === 3 && (
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
            {calculateTotal()?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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

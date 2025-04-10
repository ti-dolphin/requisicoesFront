import { Alert, AlertColor, Button, Stack } from "@mui/material";
import ItemActions from "../ItemActions/ItemActions";
import { AlertInterface, Item, RequisitionStatus } from "../../../types";
import { BaseButtonStyles } from "../../../../utilStyles";
import { ItemsContext } from "../../../context/ItemsContext";
import { useContext, useState } from "react";
import { ProductsTableModal } from "../../modals/ProductsTableModal/ProductsTableModal";
import { useParams } from "react-router-dom";
import CreateQuoteModal from "../../modals/CreateQuoteModal/CreateQuoteModal";
import QuoteListModal from "../../modals/QuoteListModal/QuoteListModal";

interface props {
  handleCancelItems: (items: Item[]) => Promise<void>;
  handleActivateItems: (items: Item[]) => Promise<void>;
  handleCopyContent: (selectedItems: Item[]) => Promise<void>;
  handleDelete: (requisitionItems: Item[]) => Promise<void>;
  selectedRows: Item[] | undefined;
  requisitionStatus? : RequisitionStatus
}

const ItemsToolBar = ({
  handleCancelItems,
  handleActivateItems,
  handleCopyContent,
  handleDelete,
  selectedRows,
  requisitionStatus
}: props) => {
  const { toggleAdding } = useContext(ItemsContext);
  const { id } = useParams();
  const [alert, setAlert] = useState<AlertInterface>();
  const [creatingQuote, setCreatingQuote] = useState<boolean>(false);
  const [quoteListOpen, setQuoteListOpen] = useState<boolean>(false);

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };

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
      {requisitionStatus?.etapa === 2 && (
        <Button
          onClick={handleViewQuoteList}
          sx={{ ...BaseButtonStyles, height: 30, minWidth: 150 }}
        >
          Ver Cotações
        </Button>
      )}

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

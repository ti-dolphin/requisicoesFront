import { Modal, Box, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import styles from "./QuoteListModal.styles";
import { CloseModalButton } from "../../../../generalUtilities";
import { AlertInterface } from "../../../types";
import { getQuotesByRequisitionId } from "../../../utils";
import typographyStyles from "../../../utilStyles";

// Interface da cotação
import { Quote } from "../../../types";
import { blue } from "@mui/material/colors";

interface QuoteItem {
  // Defina os campos do QuoteItem conforme necessário
  id: number;
  descricao: string;
  quantidade: number;
  preco: number;
}

interface Props {
  open: boolean;
  requisitionId: number;
  onClose: () => void;
  setQuoteListOpen: Dispatch<SetStateAction<boolean>>;
}

// Componente do item da lista
const Row = ({ index, style, data }: ListChildComponentProps) => {
  const quote: Quote = data[index];
  const handleNavigateToQuote = ( ) => { 
      window.open(`/requisitions/quote/${quote.id_cotacao}`, '_blank')
  };
  return (
    <Box style={style} sx={styles.rowStyle} onClick={handleNavigateToQuote}>
      <Typography
        sx={{ ...typographyStyles.heading2, color: "black" }}
        variant="subtitle1"
      >
        Cotação {quote.id_cotacao}
      </Typography>
      <Typography
        sx={{
          ...typographyStyles.heading2,
          strong: {
            color: blue[900],
          },
        }}
        variant="body2"
      >
        <strong>Fornecedor:</strong> {quote.fornecedor}
      </Typography>
      <Typography
        sx={{
          ...typographyStyles.heading2,
          strong: {
            color: blue[900],
          },
        }}
        variant="body2"
      >
        <strong>Data:</strong>{" "}
        {new Date(quote.data_cotacao).toLocaleDateString()}
      </Typography>
      <Typography
        sx={{
          ...typographyStyles.heading2,
          strong: {
            color: blue[900],
          },
        }}
        variant="body2"
      >
        <strong>Condições de Pagamento:</strong> {quote.condicoes_pagamento}
      </Typography>
      <Typography
        sx={{
          ...typographyStyles.heading2,
          strong: {
            color: blue[900],
          },
        }}
        variant="body2"
      >
        <strong>Descrição:</strong> {quote.descricao}
      </Typography>
      <Typography
        sx={{
          ...typographyStyles.heading2,
          strong: {
            color: blue[900],
          },
        }}
        variant="body2"
      >
        <strong>Observação:</strong> {quote.observacao || "Nenhuma"}
      </Typography>
    </Box>
  );
};

const QuoteListModal = ({
  open,
  requisitionId,
  onClose,
  setQuoteListOpen,
}: Props) => {
  const [quotes, setQuotes] = useState<Quote[]>([]); // Corrigido para array
  const [alert, setAlert] = useState<AlertInterface | undefined>();

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };

  useEffect(() => {
    const fetchQuoteData = async () => {
  
      try {
        const data = await getQuotesByRequisitionId(requisitionId);
        if (data) {
          console.log("data: ", data);
          setQuotes(data); 
        }
      } catch (e: any) {
        displayAlert("error", e.message);
      }
    };
    if (open) {
      fetchQuoteData();
    }
  }, [open, requisitionId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={styles.modalContainer}>
        <CloseModalButton handleClose={() => setQuoteListOpen(false)} />
        <Typography sx={typographyStyles.heading2}>
          Cotações da Requisição Nº{requisitionId}
        </Typography>
        {quotes.length === 0 ? (
          <Typography align="center" color="textSecondary" sx={{ p: 2 }}>
            Nenhuma cotação encontrada
          </Typography>
        ) : (
          <FixedSizeList
            height={600} // Altura da lista
            width="100%"
            itemCount={quotes.length}
            itemSize={250} // Altura fixa de cada item (ajuste conforme necessário)
            itemData={quotes}
            
          >
            {Row}
          </FixedSizeList>
        )}
        {alert && (
          <Box sx={{ mt: 2 }}>
            <Typography color={alert.severity === "error" ? "error" : "info"}>
              {alert.message}
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default QuoteListModal;

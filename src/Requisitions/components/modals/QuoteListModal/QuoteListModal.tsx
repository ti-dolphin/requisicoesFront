import { Modal, Box, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FixedSizeList } from "react-window";
import styles from "./QuoteListModal.styles";
import { CloseModalButton } from "../../../../generalUtilities";
import { AlertInterface } from "../../../types";
import { getQuotesByRequisitionId } from "../../../utils";
import typographyStyles from "../../../utilStyles";
import { Quote } from "../../../types";
import QuoteCard from "../../QuoteCard/QuoteCard";

interface Props {
  open: boolean;
  requisitionId: number;
  onClose: () => void;
  setQuoteListOpen: Dispatch<SetStateAction<boolean>>;
}

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
            itemSize={300} // Altura fixa de cada item (ajuste conforme necessário)
            itemData={quotes}
            
          >
            {({index, style, data}) =>  <QuoteCard index={index} style={style} data={data} />}
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

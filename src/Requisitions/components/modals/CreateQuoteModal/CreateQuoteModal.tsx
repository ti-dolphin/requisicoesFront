import { Modal, Box, Typography, Grid, TextField, Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import { AlertInterface, Item, Quote } from "../../../types";
import styles from "./CreaeteQuoteModal.styles";
import { BaseButtonStyles } from "../../../../utilStyles";
import { green, red } from "@mui/material/colors";
import { createQuote } from "../../../utils";
import { useNavigate } from "react-router-dom";

interface CreateQuoteModalProps {
  setCreatingQuote: React.Dispatch<React.SetStateAction<boolean>>;
  creatingQuote: boolean;
  selectedRows: Item[] | undefined;
  requisitionId: number;
}

const CreateQuoteModal: React.FC<CreateQuoteModalProps> = ({
  setCreatingQuote,
  creatingQuote,
  selectedRows,
  requisitionId,
}) => {
  // Estados para os campos do formulário
  const [fornecedor, setFornecedor] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertInterface>(); 
  console.log(alert);
  const navigate = useNavigate();
  // Função para fechar o modal
  const handleClose = () => {
    setCreatingQuote(false);
    setFornecedor("");
    setDescription("");
  };
  
  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };

  const handleGenerateQuote = async () => {
    console.log({ selectedRows });
    if (selectedRows?.length) {
      try {
        const response = await createQuote(selectedRows, requisitionId, description, fornecedor);
        console.log({response});
        if (response.status === 200) {
          const newQuote: Quote = response.data;
         
          navigate(`/requisitions/quote/${newQuote.id_cotacao}`);
        }
      } catch (e: any) {
        displayAlert("error", e.message);
      }
      return;
    }
    displayAlert(
      "warning",
      "Não há items selecionados, selecione os items para gerar a cotação!"
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await handleGenerateQuote();
    } catch (error) {
      console.error("Erro ao criar cotação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={creatingQuote}
      onClose={handleClose}
      aria-labelledby="create-quote-modal-title"
      aria-describedby="create-quote-modal-description"
    >
      <Box sx={styles.modalContainer}>
        <Typography
          id="create-quote-modal-title"
          variant="h6"
          component="h2"
          sx={styles.modalTitle}
        >
          Criar Nova Cotação
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <TextField
              sx={styles.textField}
              label="Fornecedor"
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              sx={styles.textField}
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
            />
          </Grid>
        </Grid>

        <Box sx={styles.buttonContainer}>
          <Button
            onClick={handleClose}
            sx={{
              ...BaseButtonStyles,
              backgroundColor: red[700],
              "&:hover": {
                backgroundColor: red[500],
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading || !fornecedor}
            sx={{   ...BaseButtonStyles,
              backgroundColor: green[700],
              "&:hover": {
                backgroundColor: green[500],
              }}}
          >
            {isLoading ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateQuoteModal;

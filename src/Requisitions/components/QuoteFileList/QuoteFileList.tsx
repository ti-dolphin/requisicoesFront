import React, { useState } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import {
  Box,
  IconButton,
  Modal,
  Typography,
  Button,
  Paper,
  AlertColor,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { BaseButtonStyles } from "../../../utilStyles";
import { AlertInterface } from "../../types";
import { createQuoteFile, deleteQuoteFile, getFilesByQuoteId } from "../../utils";
import { useEffect } from "react";

// Interface para o tipo QuoteFile
interface QuoteFile {
  id_anexo_cotacao: number;
  id_cotacao: number;
  nome_arquivo: string;
  url: string;
}

// Props do componente
interface QuoteFileListProps {
  quoteId: number;
  height?: number; // Altura da lista
  width?: number | string; // Largura da lista
  itemSize?: number; // Tamanho de cada item na lista
}


const QuoteFileList: React.FC<QuoteFileListProps> = ({
  quoteId,
  height = 400,
  width = "100%",
  itemSize = 60,
}) => {
  // Estado para controlar o modal e o arquivo selecionado
  const [openModal, setOpenModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<QuoteFile | null>(null);
  const [quoteFiles, setQuoteFiles] = useState<QuoteFile[]>();
  const [alert, setAlert] = useState<AlertInterface>();
  const [isLoading, setIsLoading] = useState(false); // State to track loading
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // State for confirmation modal
  const [fileToDelete, setFileToDelete] = useState<QuoteFile | null>(null); // File to delete

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true); // Start loader
      const file = e.target.files?.[0];
      if (!file) {
        throw new Error("Nenhum arquivo selecionado.");
      }

      const formData = new FormData();
      formData.append("file", file);
      const createdFile = await createQuoteFile(quoteId, formData);
      console.log("CREATE FILE: ", createdFile);
      if (createdFile && quoteFiles) {
        setQuoteFiles([...quoteFiles, createdFile]);
        displayAlert(
          "success",
          `Arquivo ${createdFile.nome_arquivo} anexado com sucesso.`
        );
      }
    } catch (e: any) {
      displayAlert("error", e.message);
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };
  // Função para abrir o modal com o arquivo selecionado
  const handleOpenModal = (file: QuoteFile) => {
    setSelectedFile(file);
    setOpenModal(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedFile(null);
  };

  // Função para determinar se o arquivo é um PDF ou uma imagem
  const isPDF = (url: string) => url.toLowerCase().endsWith(".pdf");

  const openConfirmModal = (file: QuoteFile) => {
    setFileToDelete(file);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setFileToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      await handleDelete(fileToDelete);
      closeConfirmModal();
    }
  };

  const handleDelete = async (file: QuoteFile) => {
    try {
      const responseStatus = await deleteQuoteFile(file);
      if (responseStatus === 200) {
        setQuoteFiles((prevFiles) =>
          prevFiles
            ? prevFiles.filter(
                (f) => f.id_anexo_cotacao !== file.id_anexo_cotacao
              )
            : []
        );
        displayAlert(
          "success",
          `Arquivo ${file.nome_arquivo} excluído com sucesso.`
        );
        return;
      }
    } catch (error: any) {
      displayAlert("error", `Erro ao excluir o arquivo: ${error.message}`);
    }
  };

  // Componente de renderização de cada item da lista
  const Row: React.FC<ListChildComponentProps> = ({ index, style }) => {
    let file;
    if (quoteFiles) {
      file = quoteFiles[index];
      console.log("file: ", file.url);
    }
    return (
      <>
        {file && (
          <Box
            style={style}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              borderBottom: "1px solid #e0e0e0",
              backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
              "&:hover": {
                backgroundColor: "#f0f0f0",
                cursor: "pointer",
              },
            }}
            onClick={() => handleOpenModal(file)}
          >
            <Typography
              variant="body1"
              sx={{
                flex: 1,
                overflow: "hidden",
                fontStyle: "italic",
                color: "gray",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file.nome_arquivo}
            </Typography>
            <IconButton
              aria-label="Excluir arquivo"
              onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => {
                event.stopPropagation(); // Prevent row click
                openConfirmModal(file); // Open confirmation modal
              }}
              sx={{
                color: "#d32f2f",
                "&:hover": {
                  color: "#b71c1c",
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </>
    );
  };

  useEffect(() => {
    const fetchQuoteFiles = async () => {
      try {
        setIsLoading(true); // Start loader
        const files = await getFilesByQuoteId(quoteId);
        setQuoteFiles(files);
      } catch (error) {
        displayAlert("error", "Erro ao buscar arquivos da cotação.");
      } finally {
        setIsLoading(false); // Stop loader
      }
    };
    fetchQuoteFiles();
  }, [quoteId]);
  return (
    <Paper
      sx={{
        width: "100%",
        maxWidth: "800px",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}
    >
      {isLoading ? (
        <CircularProgress /> // Show loader when loading
      ) : (
        quoteFiles && (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={quoteFiles.length}
            itemSize={itemSize}
          >
            {Row}
          </FixedSizeList>
        )
      )}

      {/* Modal para visualização do arquivo */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            position: "relative",
            width: { xs: "90%", md: "80%" },
            maxWidth: "1200px",
            height: { xs: "80%", md: "90%" },
            maxHeight: "90vh",
            p: 2,
            borderRadius: "8px",
            backgroundColor: "white",
            overflow: "hidden",
          }}
        >
          {/* Botão de fechar */}
          <IconButton
            aria-label="Fechar modal"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#666",
              "&:hover": {
                color: "#d32f2f",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Título do modal */}
          <Typography
            id="modal-title"
            variant="h6"
            sx={{
              mb: 2,
              textAlign: "center",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Visualizar Arquivo
          </Typography>

          {/* Conteúdo do arquivo (Imagem ou PDF) */}
          {selectedFile && (
            <Box
              sx={{
                width: "100%",
                height: "calc(100% - 64px)", // Ajusta a altura para caber o título e botão
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isPDF(selectedFile.url) ? (
                <iframe
                  src={selectedFile.url}
                  title="Visualizar PDF"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={selectedFile.url}
                  alt="Visualizar Imagem"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </Box>
          )}
        </Paper>
      </Modal>
      <Modal
        open={isConfirmModalOpen}
        onClose={closeConfirmModal}
        aria-labelledby="confirm-delete-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            width: { xs: "90%", md: "400px" },
            p: 3,
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography
            id="confirm-delete-title"
            variant="h6"
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            Confirmar Exclusão
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Tem certeza que deseja excluir o arquivo{" "}
            <strong>{fileToDelete?.nome_arquivo}</strong>?
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            <Button
              onClick={confirmDelete}
              sx={{ ...BaseButtonStyles, backgroundColor: "#d32f2f" }}
            >
              Confirmar
            </Button>
            <Button onClick={closeConfirmModal} sx={BaseButtonStyles}>
              Cancelar
            </Button>
          </Box>
        </Paper>
      </Modal>
      {alert && (
        <Alert severity={alert?.severity as AlertColor}>{alert?.message}</Alert>
      )}
      <Button component="label" sx={{ ...BaseButtonStyles, width: 200 }}>
        Anexar
        <input type="file" hidden onChange={(e) => handleChange(e)} />
      </Button>
    </Paper>
  );
};

export default QuoteFileList;

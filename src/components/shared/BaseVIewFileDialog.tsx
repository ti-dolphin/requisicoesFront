import { Box, Button, Dialog, Typography } from "@mui/material";
import React from "react";

// Define TypeScript interface for props
interface BaseViewFileDialogProps {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  title?: string;
}

// Supported file types
const SUPPORTED_EXTENSIONS = {
  pdf: ["pdf"],
  image: ["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg", ],
  xlsx: ["xlsx", "xls", "xlsm", "xlsb", "xltx", "xltm"],
};

const BaseViewFileDialog: React.FC<BaseViewFileDialogProps> = ({
  open,
  onClose,
  fileUrl,
  title = "Visualizar Arquivo",
}) => {
  // Function to validate file type based on extension
  const getFileType = (
    url: string
  ): "pdf" | "image" | "xlsx" | "unsupported" => {
    const regex = /\.([a-zA-Z0-9]+)(?=\?|$)/;
    const extension = url.match(regex)?.[1] || "";

    if (SUPPORTED_EXTENSIONS.pdf.includes(extension.toLowerCase())) return "pdf";
    if (SUPPORTED_EXTENSIONS.image.includes(extension.toLowerCase()))
      return "image";
    if (SUPPORTED_EXTENSIONS.xlsx.includes(extension.toLowerCase()))
      return "xlsx";
    return "unsupported";
  };

  const fileType = getFileType(fileUrl);

  // Render content based on file type
  const renderFileContent = () => {
    switch (fileType) {
      case "pdf":
        return (
          <Box sx={{ width: "100%", height: "100%" }}>
            <iframe
              src={fileUrl}
              title="PDF Preview"
              style={{ width: "100%", height: "100%", border: "none" }}
              aria-label="Visualização do arquivo PDF"
            />
          </Box>
        );
      case "image":
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <img
              src={fileUrl}
              alt="Imagem selecionada"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        );
      case "xlsx":
        return (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="body1" color="text.secondary" mb={2}>
              Arquivos Excel não podem ser visualizados diretamente no
              navegador.
            </Typography>
          </Box>
        );
      case "unsupported":
      default:
        return (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="body1" color="error.main">
              Tipo de arquivo não suportado ou URL inválida.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="view-file-dialog-title"
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "90vw",
          width: "100%",
          height: "80vh",
          borderRadius: 2,
          p: 3,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 2,
        }}
      >
        {/* Title */}
        <Typography
          id="view-file-dialog-title"
          variant="h6"
          color="primary.main"
          fontWeight={600}
          textAlign="center"
        >
          {title}
        </Typography>

        {/* File Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>{renderFileContent()}</Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            onClick={onClose}
            variant="contained"
            color="error"
            sx={{ minWidth: "100px" }}
            aria-label="Fechar diálogo"
          >
            Fechar
          </Button>
          {fileType === "xlsx" && (
            <Button
              variant="contained"
              color="primary"
              href={fileUrl}
              download
              sx={{ minWidth: "100px" }}
              aria-label="Baixar arquivo Excel"
            >
              Baixar Arquivo
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default BaseViewFileDialog;

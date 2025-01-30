/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Opportunity, OpportunityFile } from "../types";
import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { isPDF } from "../../generalUtilities";
import DeleteIcon from "@mui/icons-material/Delete";
import "@react-pdf-viewer/core/lib/styles/index.css";
import FileViewer from "../modals/FileViewer";

type OpportunityFilesProps = {
  opportunity: Opportunity;
  handleDeleteFile: (file: OpportunityFile) => void;
  handleChangeFiles: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;

};
const OpportunityFiles = ({
  opportunity,
  handleDeleteFile,
  handleChangeFiles,
}: OpportunityFilesProps) => {
  
  const [selectedFile, setSelectedFile] = useState<OpportunityFile>();
  const handleCloseFileViewer =  () =>  {
    setSelectedFile(undefined);
  };
  const handleFileClick = (file: OpportunityFile) => {
    if(isPDF(file.nome_arquivo)){
      window.open(file.arquivo);
      return;
    }
    setSelectedFile(file);
  };
  return (
    <Box sx={{ width: "100%" }}>
      {
        <Button
          component="span"
          sx={{
            height: "20px",
            width: "fit-content",
            padding: "0",
          }}
        >
          <label>
            <input
              type="file"
              id="fileUpload"
              accept="image/*, application/pdf"
              style={{ display: "none" }}
              onChange={(e) => handleChangeFiles(e)}
            />
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Typography fontSize="small">Enviar Arquivo</Typography>
              <CloudUploadIcon sx={{ fontSize: "16px" }} />
            </Stack>
          </label>
        </Button>
      }
      {/* Gallery */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))"
        gap={2}
        mt={2}
      >
        {opportunity.files &&
          opportunity.files.map((file, index) => (
            <Box
              key={index}
              position="relative"
              className="drop-shadow-md"
              sx={{
                height: "150px",
                objectFit: "cover",
                cursor: "pointer",
                padding: 0.5,
              }}
            >
              {/* Botão de excluir */}
              <IconButton
                className="drop-shadow-md"
                sx={{
                  backgroundColor: "white",
                  position: "absolute",
                  right: -1,
                  top: -2,
                  zIndex: 20,
                  "&:hover": { backgroundColor: "white" },
                }}
                onClick={() => handleDeleteFile(file)}
              >
                <DeleteIcon sx={{ color: "#2B3990" }} />
              </IconButton>

              {/* Conteúdo do arquivo */}
              {isPDF(file.nome_arquivo) ? (
                <Box
                  onClick={() => setSelectedFile(file)}
                  sx={{
                    display: "block",
                    height: "150px",
                    width: "100%",
                    textDecoration: "none",
                  }}
                >
                  <Box
                    height="150px"
                    width="100%"
                    component="iframe"
                    src={file.arquivo}
                    sx={{
                      height: "100%",
                      width: "100%",
                      objectFit: "fill", // Força a ocupar a largura total
                      pointerEvents: "none", // Desativa interatividade no preview
                    }}
                  />
                </Box>
              ) : (
                <img
                  onClick={() => handleFileClick(file)}
                  src={file.arquivo}
                  alt={file.nome_arquivo}
                  style={{
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
              )}
            </Box>
          ))}
      </Box>
      <FileViewer
        fileViewerOpen={selectedFile !== undefined}
        fileUrl={selectedFile?.arquivo || ""}
        handleCloseFileViewer={handleCloseFileViewer}
        isPDF={isPDF}
        fileName={selectedFile?.nome_arquivo || ""}
      />
    </Box>
  );
};

OpportunityFiles.displayName = "OpportunityFiles";

export default OpportunityFiles;

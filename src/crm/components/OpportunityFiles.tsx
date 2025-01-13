/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Opportunity, OpportunityFile } from "../types";
import {
  Box,
  Button,
  Stack,
  Typography,
  Modal,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For modal

  return (
    <Box>
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
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleChangeFiles(e)}
            />
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Typography fontSize="small">Carregar nova foto</Typography>
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
        {(
          opportunity.files &&
          opportunity.files.map((file, index) => (
            <Box
              key={index}
              onClick={() => handleDeleteFile(file)}
              position="relative"
            >
              <IconButton
                sx={{
                  position: "absolute",
                  right: 1,
                  top: 0.5,
                }}
              >
                <CloseIcon
                  sx={{ color: "red" }}
                  onClick={() => handleDeleteFile(file)}
                />
              </IconButton>
              <Box
                key={file.id_anexo_os}
                component="img"
                src={file.arquivo}
                alt={file.nome_arquivo}
                sx={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  cursor: "pointer",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
                }}
                onClick={() => setSelectedImage(file.arquivo)} // Open modal
              />
            </Box>
          ))
        )}
      </Box>

      {/* Modal */}
      <Modal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)} // Close modal
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "80%",
            height: "90%",
            objectFit: "contain",
            background: "#fff",
            position: "relative",
            borderRadius: "8px",
            boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Box
            component="img"
            src={selectedImage || ""}
            alt="Selected"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.3)",
            }}
          ></Box>
          <IconButton
            sx={{
              position: "absolute",
              right: 1,
              top: 1,
            }}
            onClick={() => setSelectedImage(null)}
          >
            <CloseIcon sx={{ color: "red" }} />
          </IconButton>{" "}
        </Box>
      </Modal>
    </Box>
  );
};

export default OpportunityFiles;

import React from "react";
import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "@react-pdf-viewer/core/lib/styles/index.css";

interface FileViewerProps {
  fileViewerOpen: boolean;
  fileUrl: string | null;
  fileName: string; // For title of the modal window
  isPDF: (fileName: string) => boolean;
  handleCloseFileViewer: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({
  fileViewerOpen,
  fileUrl,
  fileName,
  isPDF,
  handleCloseFileViewer,
}) => {
  return (
    <Modal
      open={fileViewerOpen}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "90%",
          height: "90%",
          background: "#fff",
          position: "relative",
          borderRadius: "8px",
          boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
      >
        {/* Render image or PDF */}
        {fileUrl && isPDF(fileName) ? (
          <Box
            height="150px"
            width="100%"
            component="object"
            data={fileUrl}
            type="application/pdf"
            sx={{
              height: "100%",
              width: "100%",
              objectFit: "fill", // Força a ocupar a largura total
              pointerEvents: "none", // Desativa interatividade no preview
            }}
          />
        ) : (
          <Box
            component="img"
            src={fileUrl || ""}
            alt="Selected"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#fff",
            }}
          />
        )}

        {/* Close Button */}
        <IconButton
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
          onClick={handleCloseFileViewer}
        >
          <CloseIcon sx={{ color: "red" }} />
        </IconButton>
      </Box>
    </Modal>
  );
};

export default FileViewer;

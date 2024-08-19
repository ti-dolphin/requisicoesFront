import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { PatrimonyFileContext } from "../context/patrimonyFileContext";
import { Stack, Button } from "@mui/material";
import { deletePatrimonyFileModal } from "../utils";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "fit-content",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function DeletePatrimonyFileModal() {
  const {
    toggleDeletingPatrimonyFile,
    deletingPatrimonyFile,
    toggleRefreshPatrimonyFile,
  } = React.useContext(PatrimonyFileContext);
  const handleClose = () => toggleDeletingPatrimonyFile(false);
  
  const handleDelete = async () => {
    console.log("\nhandleDelete");
    if (deletingPatrimonyFile[0] && deletingPatrimonyFile[1]) {
      const response = await deletePatrimonyFileModal(
        deletingPatrimonyFile[1].id_anexo_patrimonio
      );
      if (response && response.status === 200) {
        toggleRefreshPatrimonyFile();
        toggleDeletingPatrimonyFile(false);
        return;
      }
    }
  };

  return (
    <div>
      <Modal
        open={deletingPatrimonyFile[0]}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...style,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Tem certeza que deseja deletar este anexo?
          </Typography>

          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              sx={{ borderColor: "blue", color: "blue" }}
              onClick={handleDelete}
            >
              Sim
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{ borderColor: "red", color: "red" }}
              onClick={handleClose}
            >
              Não
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { MovementationFileContext } from "../context/movementationFileContext";
import { Stack, Button } from "@mui/material";
import { deleteMovementationFileModal } from "../utils";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 'fit-content',
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function DeleteMovimentationFileModal() {
  const {toggleDeletingMovimentationFile, deletingMovimentationFile, toggleRefreshMovementationFile} = React.useContext(MovementationFileContext);
  const handleClose = () => toggleDeletingMovimentationFile(false);
  const handleDelete = async( ) => { 
    if (deletingMovimentationFile[0] && deletingMovimentationFile[1]) {
      const response = await deleteMovementationFileModal(
        deletingMovimentationFile[1].id_anexo_movimentacao
      );
      console.log('response status: ', response?.status)
      if (response && response.status === 200) {
        
        toggleRefreshMovementationFile();
        toggleDeletingMovimentationFile(false);
      }
    }
  }
  return (
    <div>
      <Modal
        open={deletingMovimentationFile[0]}
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
            tem certeza que deseja deletar este anexo?{" "}
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

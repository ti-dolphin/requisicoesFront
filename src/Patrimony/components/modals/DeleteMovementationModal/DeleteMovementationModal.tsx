import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Stack, Button } from "@mui/material";
import { deleteMovementation } from "../../../utils";
import { MovimentationContext } from "../../../context/movementationContext";
import { useContext } from "react";

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

export default function DeleteMovementationModal() {
  const {
    toggleDeletingMovementation,
    deletingMovementation,
    toggleRefreshMovimentation,

  } = useContext(MovimentationContext);

  const handleClose = () => toggleDeletingMovementation();

  const handleDelete = async () => {
    if (deletingMovementation[0] && deletingMovementation[1]) {
      const response = await deleteMovementation(
        deletingMovementation[1].id_movimentacao, deletingMovementation[1].id_patrimonio
      );
      if (response && response.status === 200) {
        toggleRefreshMovimentation();
        toggleDeletingMovementation();
        return;
      }
      alert(response?.data.message);
    }
  };

  return (
    <div>
      <Modal
        open={deletingMovementation[0]}
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
            tem certeza de que deseja deletar esta Movimentação?{" "}
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

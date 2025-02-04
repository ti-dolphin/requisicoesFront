import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useContext, useState } from "react";
import { MovimentationContext } from "../../../context/movementationContext";
import { Button, Stack, TextField } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { updateMovementation } from "../../../utils";
import { userContext } from "../../../../Requisitions/context/userContext";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 'fit-content',
  flexShrink: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function EditMovimentationObservationModal() {
  const {
    editingMovementationObservation,
    togglEditingMovementationObservation,
    toggleRefreshMovimentation,
  } = useContext(MovimentationContext);
  useContext(userContext);
  const [observation, setObservation] = useState<string>(editingMovementationObservation[1]?.observacao || '');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    console.log('value: ', value)
    setObservation(value);
  }

  const handleSave = async () => {
    if (editingMovementationObservation[1]) {
      const response = await updateMovementation({
        ...editingMovementationObservation[1],
        ["observacao"]: observation,
      });
      if (response && response.status === 200) {
        toggleRefreshMovimentation();
        togglEditingMovementationObservation(false);
        return;
      }
    }
    window.alert("Erro ao editar Observação");
  }

  const handleClose = () => togglEditingMovementationObservation(false);

  return (
    <div>
      <Modal
        open={editingMovementationObservation[0]}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Editar observação
          </Typography>
          <TextField
            multiline
            onChange={handleChange}
            defaultValue={editingMovementationObservation[1]?.observacao}
            sx={{ mt: 2 }}
          >
          </TextField>

          {editingMovementationObservation[0] && editingMovementationObservation[1] && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={handleSave}
                sx={{ width: "1rem", marginX: "1rem" }}
              >
                <SaveIcon />
              </Button>

              <Button
                variant="outlined"
                onClick={() => togglEditingMovementationObservation(false)} //refresh to get the default values back
                sx={{
                  width: "1rem",
                  marginX: "1rem",
                  color: "red",
                }}
              >
                <CancelIcon />
              </Button>
            </Stack>
          )}
        </Box>
      </Modal>
    </div>
  );
}

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { DeleteRequisitionModalProps } from "../../../types";
import { Button, Stack } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "90%",
    sm: "80%",
    md: "70%",
    lg: "40%",
    xl: "30%",
  },
  height: "fit-content",
  bgcolor: "background.paper",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
  boxShadow: 24,
  p: 4,
};

const DeleteRequisitionModal: React.FC<DeleteRequisitionModalProps> = ({
  isDeleteRequisitionModalOpen,
  setIsDeleteRequisitionModalOpen,
  handleDelete,
  requisitionId,
}) => {
  const handleClose = () => setIsDeleteRequisitionModalOpen(false);

  return (
    <div>
      <Modal
        open={isDeleteRequisitionModalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...style, gap: "2rem" }}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            align="center"
          >
            Tem certeza que deseja excluir a requisição Nº {requisitionId}?
          </Typography>
          <Stack direction="row" spacing={6}>
            <Button
              onClick={() => handleDelete(requisitionId)}
              variant="outlined"
            >
              Sim
            </Button>
            <Button
              onClick={() => setIsDeleteRequisitionModalOpen(false)}
              color="secondary"
              variant="outlined"
              sx={{
                color: "red",
                border: "1px solid red",
                hover: "color:secondary",
              }}
            >
              Não
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
};
export default DeleteRequisitionModal;

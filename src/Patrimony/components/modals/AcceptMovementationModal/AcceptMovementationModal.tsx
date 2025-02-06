/* eslint-disable @typescript-eslint/no-unused-vars */
import { Modal, Box, IconButton, Stack, Typography, Button, CircularProgress, styled } from '@mui/material';
import React, { useContext, useState } from 'react'
import { MovimentationContext } from '../../../context/movementationContext';
import { acceptMovementation, createMovementationfile } from '../../../utils';
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const acceptModalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "0.5px solid #000",
  boxShadow: 24,
  p: 4,
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const AcceptMovementationModal = () => {

  const { toggleRefreshMovimentation, acceptingMovimentation, toggleAcceptingMovimentation } = useContext(MovimentationContext);
  const [loading, setIsLoading] = useState<boolean>(false);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleUploadFile");
    console.log("e.target.files: ", e.target.files);
    console.log("acceptMovementationModalOpen: ", acceptingMovimentation);
    if (e.target.files && acceptingMovimentation) {
      setIsLoading(true);
      console.log(": ");
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      const response = await createMovementationfile(
        acceptingMovimentation.id_movimentacao,
        formData
      );
      if (response && response.status === 200) {
        const responseAccept = await acceptMovementation(
          acceptingMovimentation.id_movimentacao
        );
        if (responseAccept && responseAccept.status === 200) {
          setIsLoading(false);
          toggleRefreshMovimentation();
          toggleAcceptingMovimentation();
          return;
        }
      }
      window.alert("Erro ao fazer upload!");
    }
  };

  return (
    <Modal
      open={acceptingMovimentation !== undefined}
      // onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={acceptModalStyle}>
        <IconButton
          sx={{
            color: "red",
            position: "absolute",
            right: "1rem",
            top: "1rem",
          }}
          onClick={() => toggleAcceptingMovimentation()}
        >
          <CloseIcon />
        </IconButton>
        <Stack spacing={2}>
          <Typography
            textAlign="center"
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Registre o Recebimento
          </Typography>
          <Typography
            textAlign="center"
            id="modal-modal-description"
            sx={{ mt: 2 }}
          >
            Foto com patrimonio e acessórios
          </Typography>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            Anexar
            <VisuallyHiddenInput
              accept="image/*,application/pdf"
              onChange={handleUploadFile}
              type="file"
            />
          </Button>
          {loading && (
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Enviando...</Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};

export default AcceptMovementationModal
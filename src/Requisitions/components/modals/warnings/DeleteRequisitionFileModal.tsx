import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Stack } from '@mui/material';
import typographyStyles from '../../../utilStyles';
import { BaseButtonStyles } from '../../../../utilStyles';
import { green, red } from "@mui/material/colors";

interface props {
  deleteItemModal: boolean;
  setDeleteItemModal: React.Dispatch<React.SetStateAction<boolean>>;
  setExecuteSelectedAction: React.Dispatch<React.SetStateAction<string>>;
  setIsMenuActionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}


const DeleteRequisitionItemModal = ({
  deleteItemModal,
  setDeleteItemModal,
  setExecuteSelectedAction,
  setIsMenuActionsOpen
}: props) => {

  const handleYes = () => {
    setIsMenuActionsOpen(false);
    setExecuteSelectedAction("delete");
    setDeleteItemModal(false);

  };
  const handleNo = () => {
    setDeleteItemModal(false);
    setIsMenuActionsOpen(false);
  }
  
  return (
    <Modal
      open={deleteItemModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: {
            xs: 300,
            sm: 400,
          },
          bgcolor: "background.paper",
          boxShadow: 24,
          pt: 2,
          px: 4,
          pb: 3,
        }}
      >
        <Typography sx={typographyStyles.heading2}>
          Tem certeza que deseja excluir os items selecionado?
        </Typography>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
          <Button
            sx={{
              ...BaseButtonStyles,
              backgroundColor: green[500],
              ":hover": { backgroundColor: green[900] },
            }}
            onClick={handleYes}
          >
            Sim
          </Button>
          <Button
            sx={{
              ...BaseButtonStyles,
              backgroundColor: red[500],
              ":hover": { backgroundColor: red[900] },
            }}
            onClick={handleNo}
            variant="outlined"
          >
            Não
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};
export default DeleteRequisitionItemModal;



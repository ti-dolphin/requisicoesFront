import { Modal, Box, IconButton, Typography, Stack, Button } from '@mui/material';
import { useContext } from 'react'
import { OpportunityInfoContext } from '../../../context/OpportunityInfoContext';
import CloseIcon from "@mui/icons-material/Close";
import { BaseButtonStyles } from '../../../../utilStyles';
import { green, red } from '@mui/material/colors';

interface AdicionalChoiceProps {
  isAdicionalChoiceOpen: boolean;
  handleClose: () => void;
  handleAdicionalChoice: (choice: boolean) => void;
}
const AdicionalChoice = ({
  isAdicionalChoiceOpen,
  handleClose,
  handleAdicionalChoice,
}: AdicionalChoiceProps) => {
  const { currentOppIdSelected, creatingOpportunity } = useContext(
    OpportunityInfoContext
  );

  return (
    <Modal
      open={
        isAdicionalChoiceOpen &&
        creatingOpportunity &&
        !(currentOppIdSelected > 0)
      }
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          boxShadow: 24,
          height: 150,
          overFlow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          p: 2,
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            right: 1,
            top: 1,
          }}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>{" "}
        <Typography>A proposta é um adicional?</Typography>
        <Stack direction="row" gap={1}>
          <Button
            onClick={() => handleAdicionalChoice(true)}
            sx={{
              ...BaseButtonStyles,
              backgroundColor: green[500],
              "&:hover": { backgroundColor: green[800] },
            }}
          >
            Sim
          </Button>
          <Button
            onClick={() => handleAdicionalChoice(false)}
            sx={{
              ...BaseButtonStyles,
              backgroundColor: red[500],
              "&:hover": { backgroundColor: red[800] },
            }}
          >
            Não
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};
AdicionalChoice.displayName = "AdicionalChoice";
export default AdicionalChoice
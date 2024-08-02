import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import AddCircle from "@mui/icons-material/AddCircle";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Typography } from "@mui/material";
import AddRequisitionForm from "../../pages/requisitionHome/components/AddRequisitionForm";
import CloseIcon from "@mui/icons-material/Close";
import { ItemsContextProvider } from "../../context/ItemsContext";
import { useContext } from "react";
import { RequisitionContext } from "../../context/RequisitionContext";


const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};


const NestedModal: React.FC = () => {

  const {creating, toggleCreating } = useContext(RequisitionContext);


  const handleOpen = () => {
    toggleCreating();
  };
  const handleClose = () => {
    toggleCreating();
  };

  return (
    <div>
      <Button
       sx={{ gap: "0.5rem",
            height: '4rem'
        }} 

       onClick={handleOpen}>
        <AddCircle />
        <Typography sx={{ 
          display: { 
            xs : 'none',
            lg: 'block'
          }
        }}>
          Nova Requisição
        </Typography>
      </Button>

      <Modal
        sx={{ border: "none" }}
        open={creating}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box
          sx={{
            ...style,
            width: { 
              xs: 300,
              lg: 400
            },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid gray",
          }}
        >
          <Button onClick={handleClose} sx={{ position: 'absolute', top: '10px', right: '0' }}>
            <CloseIcon />
          </Button>
              <Typography variant="h6" id="parent-modal-title">
                Nova Requisição
              </Typography>
            <ItemsContextProvider>
                <AddRequisitionForm />
            </ItemsContextProvider>
        </Box>
      </Modal>
    </div>
  );
}
export default NestedModal;

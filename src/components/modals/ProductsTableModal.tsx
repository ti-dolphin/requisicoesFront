import { Box, Button, Modal, Stack } from "@mui/material";
import { ProductsTableModalProps } from "../../types";
import ProductsTable from "../tables/ProductsTable";
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 1,
  px: 1,
  pb: 2,
};

export const ProductsTableModal: React.FC<ProductsTableModalProps> = ({
  isOpen,
  setIsOpen,
  requisitionID,
  setIsCreating
}) => {
  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: "95vw", height: "98vh" }}>
          <Button
            sx={{color: 'red', position: 'absolute', right: '2rem', top: '1rem', zIndex: 2}}
            onClick={() => setIsCreating(false)}><CloseIcon  />
            </Button>
          <Stack sx={{ border: '1px solid', height: '100%', overflowY : 'auto', width: '100%'}} direction="column">
              <ProductsTable ID_REQUISICAO={requisitionID} setIsCreating={setIsCreating}/>
          </Stack>
        </Box>
      </Modal>
    </>
  )
};

export { ProductsTable };

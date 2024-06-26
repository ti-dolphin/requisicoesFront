import { Box, Button, Modal, Stack } from "@mui/material";
import { ProductsTableModalProps } from "../../types";
import ProductsTable from "../tables/ProductsTable";
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: '25px',
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
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
        <Box sx={{ ...style, border: "1px solid black", width: "95vw", height: "98vh" }}>
          <Button
            sx={{color: 'red', position: 'absolute', right: '2rem', top: '1rem', zIndex: 2}}
            onClick={() => setIsCreating(false)}><CloseIcon  />
            </Button>
          <Stack direction="column">
              <ProductsTable ID_REQUISICAO={requisitionID} setIsCreating={setIsCreating}/>
          </Stack>
        </Box>
      </Modal>
    </>
  )
};

export { ProductsTable };

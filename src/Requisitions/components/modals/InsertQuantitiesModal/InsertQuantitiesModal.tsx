import { Box, Modal, Stack, Typography } from '@mui/material';
import { Item, Product } from '../../../types';
import { useParams } from 'react-router-dom';
import RequisitionItemsTable from '../../tables/RequisitionItemsTable/RequisitionItemsTable';
import typographyStyles from '../../../utilStyles';
import { CloseModalButton } from '../../../../generalUtilities';
import { Dispatch, SetStateAction, useContext } from 'react';
import { ItemsContext } from '../../../context/ItemsContext';
interface props {
  addedItems: Item[];
  isInsertingQuantity: boolean;
  setIsInsertingQuantity: Dispatch<SetStateAction<boolean>>;
  setAddedItems: Dispatch<SetStateAction<Item[]>>;
  setSelectedProducts: Dispatch<SetStateAction<Product[]>>;
  reqID?: number
}

const InsertQuantitiesModal = ({
  addedItems,
  isInsertingQuantity,
  setIsInsertingQuantity,
  setAddedItems,
  setSelectedProducts,
  reqID,
}: props) => {
  console.log("addedItems: ", addedItems);
  const { id } = useParams();
  const { toggleAdding } = useContext(ItemsContext);

  const handleClose = () => {
    setIsInsertingQuantity(false);
    setAddedItems([]);
    setSelectedProducts([]);
    toggleAdding();
  };
  return (
    <Modal open={isInsertingQuantity}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          height: "90%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 1,
        }}
      >
        <CloseModalButton handleClose={handleClose} />
        <Stack gap={2} sx={{ height: "100%" }}>
          <Typography sx={typographyStyles.heading2}>
            Insira as quantidades dos produtos adicionados!
          </Typography>
          <Box sx={{ height: "80%" }}>
            <RequisitionItemsTable
              requisitionId={id ? Number(id) : reqID || 0}
              isInsertingQuantity={isInsertingQuantity}
              setIsInsertingQuantity={setIsInsertingQuantity}
              addedItems={addedItems}
            />
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default InsertQuantitiesModal
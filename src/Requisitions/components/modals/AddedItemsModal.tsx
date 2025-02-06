import { AddedItemsModalProps } from "../../types";
import { useState } from "react";
import RequisitionItemsTable from "../tables/RequisitionItemsTable";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

const AddedItemsModal: React.FC<AddedItemsModalProps> = ({ addedItems }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        sx={{
          color: "#8dc6ff",
          "&:hover": { backgroundColor: "#f1b963" },
          backgroundColor: "#F7941E",
        }}
      >
        <Typography fontSize="small" textTransform="capitalize" color="white">
          Items Adicionados
        </Typography>
      </Button>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 2,
            padding: 2,
            backgroundColor: "#f8f8f8",
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <span>Items Adicionados</span>
            <IconButton onClick={handleClose} sx={{ color: "red" }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "70vh", overflowY: "auto" }}>
          {addedItems && (
            <RequisitionItemsTable
               requisitionId={addedItems[0].ID_REQUISICAO}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddedItemsModal;

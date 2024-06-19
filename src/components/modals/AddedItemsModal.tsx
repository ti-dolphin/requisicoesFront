import { AnimatePresence, motion } from "framer-motion";
import { AddedItemsModalProps } from "../../types";
import AddedItemsTable from "../tables/AddedItemsTable";
import { Backdrop, Button, Box, Fade, Modal, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { style } from "../tables/ProductsTable";
import CloseIcon from '@mui/icons-material/Close';

const AddedItemsModal: React.FC<AddedItemsModalProps> = ({
  addedItems,
  handleOpen,
  handleClose,
  handleQuantityChange,
  handleDelete,
  currentSelectedItem,
  motionVariants,
  setIsCreating
}) => {

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white
         bg-[#f96d00]
           hover:bg-[#ff9340]
           tracking-wide
             font-medium rounded-full text-sm px-5 py-2 text-center me-2 mb-2"
      >
        Items Adicionados
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.7 }}
            exit={{ x: 300, opacity: 0 }}
            variants={motionVariants}
            className="rounded-xl p-4 flex flex-row absolute bg-[#f8f8f8] border shadow-lg top-[5rem]  h-[80vh] w-[60vw] z-20"
          > 
            <Button onClick={() => setIsOpen(false)} sx={{position:'absolute', top:'0.5rem', left:'0.5rem', margin:''}}><CloseIcon /></Button>
            <AddedItemsTable setIsCreating={setIsCreating} handleDelete={handleDelete} addedItems={addedItems} handleOpen={handleOpen}/>
            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              open={false}
              onClose={handleClose}
              closeAfterTransition
              slots={{ backdrop: Backdrop }}
              slotProps={{
                backdrop: {
                  timeout: 500,
                },
              }}
            >
              <Fade in={false}>
                <Box sx={{...style, overflowY:'scroll'}}>
                  <Stack direction="column" spacing={2}>
                    <Typography
                      id="transition-modal-title"
                      variant="h6"
                      component="h2"
                    >
                      Insira a quantidade desejada
                    </Typography>
                    <input
                      type="text"
                      autoFocus
                      onChange={handleQuantityChange}
                      id={String(currentSelectedItem?.ID_PRODUTO)}
                      className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={handleClose}
                    />
                  </Stack>
                </Box>
              </Fade>
            </Modal>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default AddedItemsModal;
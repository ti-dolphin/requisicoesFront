import { AnimatePresence, motion } from "framer-motion";
import { AddedItemsModalProps } from "../../types";
import { useState } from "react";
import RequisitionItemsTable from "../tables/RequisitionItemsTable";
import CloseIcon from '@mui/icons-material/Close';
import { Stack } from "@mui/material";
const AddedItemsModal: React.FC<AddedItemsModalProps> = ({
  motionVariants,
  addedItems,
  refreshToggler,
  setRefreshToggler
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
            <Stack direction="column" spacing={4} sx={{width: '90%'}}>
              <button onClick={() => setIsOpen(false)}> 
                <CloseIcon
                 sx={{ color: 'red', position: 'absolute', top: '0.5rem', left: '10px' }} /></button>
                  {addedItems &&
                    <RequisitionItemsTable
                      items={addedItems}
                      refreshToggler={refreshToggler}
                      setRefreshToggler={setRefreshToggler} />}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default AddedItemsModal;
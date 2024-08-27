import { AnimatePresence, motion } from "framer-motion";
import { AddedItemsModalProps } from "../../types";
import { useState } from "react";
import RequisitionItemsTable from "../tables/RequisitionItemsTable";
import CloseIcon from "@mui/icons-material/Close";
import { Button, Stack } from "@mui/material";
const AddedItemsModal: React.FC<AddedItemsModalProps> = ({
  motionVariants,
  addedItems,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        sx={{ color: "#8dc6ff", "&:hover": { color: "white" } }}
      >
        Items Adicionados
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "50%", opacity: 0 }}
            animate={{ x: "50%", opacity: 1 }}
            // transition={{ ease: "easeInOut", duration: 0.7 }}
            // exit={{ x: 0, opacity: 0 }}
            variants={motionVariants}
            className="p-4 flex flex-row absolute bg-[#f8f8f8] border shadow-lg top-[5rem] h-[80vh] 
            z-20 overflow-auto max-h-[70vh]"
          >
            <Stack direction="column" spacing={4} sx={{ width: "90%" }}>
              <button onClick={() => setIsOpen(false)}>
                <CloseIcon
                  sx={{
                    color: "red",
                    position: "absolute",
                    top: "0.5rem",
                    left: "10px",
                  }}
                />
              </button>
              {addedItems && <RequisitionItemsTable currentStatus="Em edição" items={addedItems} />}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default AddedItemsModal;

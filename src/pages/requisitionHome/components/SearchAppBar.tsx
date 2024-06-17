import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";
import AddedItemsTable from "./AddedItemsTable";
import { Backdrop, Button, Fade, Modal, Stack, Typography } from "@mui/material";
import { style } from "./ItemsTable";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { Item } from "../../../utils";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

interface SearchAppBarProps {
  addedItems: Item[];
  caller: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOpen: (
    e: React.MouseEvent<HTMLButtonElement>,
    quantities: Item[],
    nome: string
  ) => void;
  handleClose: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleQuantityChange: ( e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement> ) => void;
  handleDelete :  ( e : React.MouseEvent<HTMLButtonElement>) => void;
  currentSelectedItem: Item | undefined;
  openQuantityInput?: boolean;
  setIsCreating: (value : boolean) => void;
}
const motionItemsVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: "-100%" },
};
interface PositionMenuProps {
  addedItems: Item[];
  handleOpen: (
    e: React.MouseEvent<HTMLButtonElement>,
    quantities: Item[],
    nome: string
  ) => void;
  handleClose: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleQuantityChange: ( e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement> ) => void;
  handleDelete :  ( e : React.MouseEvent<HTMLButtonElement>) => void;
  currentSelectedItem: Item | undefined;
  openQuantityInput?: boolean;
  motionVariants: typeof motionItemsVariants;
  setIsCreating : (value : boolean ) => void;
}

const MotionItems: React.FC<PositionMenuProps> = ({
  addedItems,
  handleOpen,
  handleClose,
  handleQuantityChange,
  handleDelete,
  currentSelectedItem,
  openQuantityInput,
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
              open={openQuantityInput}
              onClose={handleClose}
              closeAfterTransition
              slots={{ backdrop: Backdrop }}
              slotProps={{
                backdrop: {
                  timeout: 500,
                },
              }}
            >
              <Fade in={openQuantityInput}>
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

const SearchAppBar: React.FC<SearchAppBarProps> = ({
  addedItems,
  caller,
  handleSearch,
  handleOpen,
  handleClose,
  handleDelete,
  openQuantityInput,
  handleQuantityChange,
  currentSelectedItem,
  setIsCreating
}) => {
  return (
    <Box sx={{ flexGrow: 1, width: "100%" }}>
      <AppBar sx={{ backgroundColor: "#00204a" }} position="static">
        <Toolbar sx={{marginX:'auto'}}>
          {caller == "ItemsTable" && (
            <MotionItems
              handleOpen={handleOpen}
              addedItems={addedItems}
              handleClose={handleClose}
              openQuantityInput={openQuantityInput}
              handleQuantityChange={handleQuantityChange}
              currentSelectedItem={currentSelectedItem}
              motionVariants={motionItemsVariants}
              handleDelete={handleDelete}
              setIsCreating={setIsCreating}
            />
          )}
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Pesquisar..."
              inputProps={{ "aria-label": "search" }}
              onChange={handleSearch}
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default SearchAppBar;

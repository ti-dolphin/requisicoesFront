import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";
import { SearchAppBarProps, motionItemsVariants } from "../../../types";
import AddedItemsModal from "../../../components/modals/AddedItemsModal";

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

const SearchAppBar: React.FC<SearchAppBarProps> = ({
  caller,
  handleSearch,
  addedItems,
  refreshToggler,
  setRefreshTooggler
}) => {
  return (
    <Box sx={{ flexGrow: 1, width: "100%" }}>
      <AppBar sx={{ backgroundColor: "#00204a" }} position="static">
        <Toolbar sx={{marginX:'auto'}}>
          {caller == "ItemsTable" && (
            <AddedItemsModal
              motionVariants={motionItemsVariants}
              addedItems={addedItems} refreshToggler={refreshToggler} setRefreshToggler={setRefreshTooggler}  />
          )}
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Pesquisar..."
              inputProps={{ "aria-label": "search" }}
              onKeyDown={handleSearch}
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default SearchAppBar;

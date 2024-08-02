import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import React, { useContext, useEffect, useState } from "react";
import { SearchAppBarProps, motionItemsVariants } from "../../../types";
import AddedItemsModal from "../../../components/modals/AddedItemsModal";
import { Chip, Stack } from "@mui/material";
import { RequisitionContext } from "../../../context/RequisitionContext";
import { userContext } from "../../../context/userContext";
//HELPER Components
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
const filterAvailableByUser = {
  purchaser: [
   'A Fazer',
   'Fazendo',
   'Concluído',
   'Tudo'
  ],
 nonPurchaser : [
  'Backlog',
  'Acompanhamento',
  'Tudo'
 ]
};

const SearchAppBar: React.FC<SearchAppBarProps> = ({
  caller,
  handleSearch,
  addedItems,
  refreshToggler,
  setRefreshTooggler
}) => {
  const {currentKanbanFilter, changeKanbanFilter } = useContext(RequisitionContext);
  const { user } = useContext(userContext);
  const [availableKanbanFilters, setAvailableKanbanFilter ] = useState<string[]>([]);
  const defineAvailableKanbanFilters = ( ) =>  {
    console.log('user: ', user)
    if( user?.PERM_COMPRADOR && user?.PERM_COMPRADOR > 0){ 
      setAvailableKanbanFilter([...filterAvailableByUser.purchaser]);
      return;
    }
    setAvailableKanbanFilter([...filterAvailableByUser.nonPurchaser])
  }

  useEffect(() => {
    defineAvailableKanbanFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeKanbanFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
      changeKanbanFilter({label: e.currentTarget.id});
  } 
  
  return (
    <Box sx={{ flexGrow: 1, width: "100%" }}>
      <AppBar
        sx={{
          backgroundColor: "#00204a",
          height: "fit-content",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "8px",
        }}
        position="static"
      >
        <Toolbar
          sx={{
          
            marginX: "auto",
            width: "80%",
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "column",
            },
            alignItems: {
              xs: "start",
            },
            gap: "1rem",
          }}
        >
          <Search
            sx={{
              border: "1px solid white",
              width: {
                xs: "100%",
                sm: "90%",
                md: "60%",
              },
            }}
          >
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Pesquisar..."
              inputProps={{ "aria-label": "search" }}
              onKeyDown={handleSearch}
            />
          </Search>

          {caller == "ItemsTable" && (
            <AddedItemsModal
              motionVariants={motionItemsVariants}
              addedItems={addedItems}
              refreshToggler={refreshToggler}
              setRefreshToggler={setRefreshTooggler}
            />
          )}
          {caller !== "ItemsTable" && (
            <Stack
              sx={{
                flexDirection: {
                  xs: "column",
                  md: "row",
                },
                gap: "0.5rem",
              }}
            >
              {availableKanbanFilters.map((kanbanFilter) => (
                <button onClick={handleChangeKanbanFilter} id={kanbanFilter}>
                  <Chip
                    color={
                      currentKanbanFilter?.label === kanbanFilter
                        ? "success"
                        : "primary"
                    }
                    label={kanbanFilter}
                  />
                </button>
              ))}
            </Stack>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default SearchAppBar;

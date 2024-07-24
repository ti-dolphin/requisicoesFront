import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import React, { useContext } from "react";
import { SearchAppBarProps, motionItemsVariants } from "../../../types";
import AddedItemsModal from "../../../components/modals/AddedItemsModal";
import { Chip, Stack } from "@mui/material";
import { RequisitionContext } from "../../../context/RequisitionContext";
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

//MAIN COMPONENT
const SearchAppBar: React.FC<SearchAppBarProps> = ({
  caller,
  handleSearch,
  addedItems,
  refreshToggler,
  setRefreshTooggler
}) => {
  const {currentKanbanFilter, changeKanbanFilter } = useContext(RequisitionContext);

  const handleChangeKanbanFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { id } = e.currentTarget;
    let searchTerm = '';
    switch (id) {
      case 'Backlog': {
        searchTerm = 'Em edição'
        changeKanbanFilter({ label: 'Backlog', status: searchTerm });
        break;
      }
      case 'A Fazer': {
        searchTerm = 'Requisitado';
        changeKanbanFilter({ label: 'A Fazer', status: searchTerm })
        break;

      }
      case 'Fazendo': {
        searchTerm = 'Em cotação';
        changeKanbanFilter({ label: 'Fazendo', status: 'Em cotação' })
        break;
      }
      case 'Concluído': {
        searchTerm = 'Concluído';
        changeKanbanFilter({ label: 'Concluído', status: 'Concluído' })
        break;
      }
    }
  } 
  
  return (
    <Box sx={{ flexGrow: 1, width: "100%" }}>
      <AppBar sx={{ backgroundColor: "#00204a", height: 'fit-content',
      display: 'flex', justifyContent: 'center' ,
      alignItems: 'center',
      padding: '10px'}}
       position="static">
        <Toolbar sx={
          {
  
            padding: '1rem',
            marginX: 'auto',
            width: '80%',
            top: '1rem',
            display: 'flex',
            flexDirection: {
              xs: 'column',
              sm: 'column',
           },
           alignItems: { 
              xs: 'start'
           },
           gap : '1rem'
          }
        }>

          <Search sx={{
              border: '1px solid white',
                width: {
                  xs: '100%',
                  sm: '90%',
                  md: '60%'
                }
              }}  >
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
              addedItems={addedItems} refreshToggler={refreshToggler} setRefreshToggler={setRefreshTooggler} />
          )}
          { 
            caller !== 'ItemsTable' && ( 
              <Stack 
                      sx={{ 
                        flexDirection : { 
                          xs: 'column',
                          md: 'row'
                        },
                        gap: '0.5rem'

                      }}
                      >
                      <button
                        onClick={handleChangeKanbanFilter}
                        id="Backlog">
                        <Chip
                          color={currentKanbanFilter?.label === 'Backlog' ? 'success' : 'primary'}
                          label="Backlog" />
                      </button>
                      <button
                        onClick={handleChangeKanbanFilter}
                        id="A Fazer">
                        <Chip
                          color={currentKanbanFilter?.label === 'A Fazer' ? 'success' : 'primary'}
                          label="A Fazer" />
                      </button>
                      <button
                        onClick={handleChangeKanbanFilter}
                        id="Fazendo">
                        <Chip
                          color={currentKanbanFilter?.label === 'Fazendo' ? 'success' : 'primary'}
                          label="Fazendo" />
                      </button>
                      <button
                        onClick={handleChangeKanbanFilter}
                        id="Concluído">
                        <Chip
                          color={currentKanbanFilter?.label === 'Concluído' ? 'success' : 'primary'}
                          label="Concluído" />
                      </button>
              </Stack>
            )
          }
        
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default SearchAppBar;

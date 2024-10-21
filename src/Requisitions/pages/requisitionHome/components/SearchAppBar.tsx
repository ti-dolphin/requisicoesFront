/* eslint-disable @typescript-eslint/no-unused-vars */
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import React, { useContext, useEffect, useState } from "react";
import {  SearchAppBarProps, motionItemsVariants } from "../../../types";
import AddedItemsModal from "../../../components/modals/AddedItemsModal";
import { Button, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { RequisitionContext } from "../../../context/RequisitionContext";
import { userContext } from "../../../context/userContext";
import AddRequisitionModal from "../../../components/modals/AddRequisitionModal";
import FilterAltIcon from "@mui/icons-material/FilterAlt";





const SearchAppBar: React.FC<SearchAppBarProps> = ({
  caller,
  handleSearch,
  addedItems,
  refreshToggler,
  setRefreshTooggler,
}) => {
  const { currentKanbanFilter, changeKanbanFilter, changeSubFilter, currentSubFilter } = useContext(RequisitionContext);
  const { user } = useContext(userContext);
  const [availableKanbanFilters, setAvailableKanbanFilter] = useState<string[]>(
    []
  );
    const subFilters = [ 
      'Minhas',
      'Todas'
    ];
   
    const [filterMenu, setFilterMenu] = React.useState<null | HTMLElement>(
      null
    );
  const filterMenuOpen = Boolean(filterMenu);
  const { innerWidth: width } = window;

  
  const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenu(event.currentTarget);
  };
  
  const handleCloseFilter = () => {
    setFilterMenu(null);
  };
  
  const handleSelectFilter = async (filter: string) => {
    changeSubFilter({label : filter});
  };


  const defineAvailableKanbanFilters = () => {
    console.log("user: ", user);
    if (user?.PERM_COMPRADOR && user?.PERM_COMPRADOR > 0) {
      setAvailableKanbanFilter([...filterAvailableByUser.purchaser]);
      return;
    }
    setAvailableKanbanFilter([...filterAvailableByUser.nonPurchaser]);
  };



  useEffect(() => {
    defineAvailableKanbanFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKanbanFilter]);

  const handleChangeKanbanFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    changeKanbanFilter({ label: e.currentTarget.id });
  };

  return (
    <Box sx={{ flexGrow: 1, width: "100%" }}>
      <AppBar
        sx={{
          backgroundColor: "#2B3990", //  className="text-gray-[#2B3990]"
          height: "fit-content",
          display: "flex",
          // justifyContent: "center",
          // alignItems: "center",
          padding: "8px",
          boxShadow: "none",
        }}
        position="static"
      >
        <Toolbar>
          <Stack
            direction="row"
            flexWrap="wrap"
            width="100%"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            className="space-y-2"
          >
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

            {caller == "ItemsTable" && width > 600 && (
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
                  alignItems: "start",
                  gap: "0.5rem",
                }}
              >
                {availableKanbanFilters.map((kanbanFilter) => (
                  <Button
                    sx={{
                      backgroundColor:
                        currentKanbanFilter?.label === kanbanFilter
                          ? "#f1b963"
                          : "#F7941E",

                      "&:hover": {
                        backgroundColor: "#f1b963",
                      },
                      padding: "0.4rem",
                      borderRadius: "5px",
                    }}
                    onClick={handleChangeKanbanFilter}
                    id={kanbanFilter}
                  >
                    <Typography
                      color="white"
                      sx={{ textTransform: "underline" }}
                      fontSize="small"
                    >
                      {kanbanFilter}
                    </Typography>
                  </Button>
                ))}
                <Button
                  id="basic-button"
                  aria-controls={filterMenuOpen ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={filterMenuOpen ? "true" : undefined}
                  onClick={handleClickFilter}
                  sx={{
                    color: "white",
                    backgroundColor: "#F7941E",
                    "&:hover": {
                      backgroundColor: "#f1b963",
                    },
                  }}
                >
                  <Typography textTransform="capitalize">Filtros</Typography>
                  <FilterAltIcon sx={{ color: "white" }} />
                </Button>
                <Menu
                  id="basic-menu"
                  anchorEl={filterMenu}
                  open={filterMenuOpen}
                  onClose={handleCloseFilter}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  {subFilters.map((filter) => (
                    <MenuItem
                      key={filter}
                      sx={{ 
                        backgroundColor: filter === currentSubFilter?.label ? '#e3e3e3' : 'white'
                      }}
                      onClick={() => handleSelectFilter(filter)}
                    >
                      {filter}
                    </MenuItem>
                  ))}
                </Menu>
              </Stack>
            )}
            {caller !== "ItemsTable" && <AddRequisitionModal />}
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default SearchAppBar;

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
  purchaser: ["A Fazer", "Fazendo", "Concluído", "Tudo"],
  nonPurchaser: ["Backlog", "Acompanhamento", "Tudo"],
};

/* eslint-disable @typescript-eslint/no-unused-vars */

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import React, { useContext, useEffect, useState } from "react";
import { Button, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { RequisitionContext } from "../../../context/RequisitionContext";
import { userContext } from "../../../context/userContext";
import AddRequisitionModal from "../../../components/modals/AddRequisitionModal";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { BaseButtonStyles, buttonStylesMobile } from "../../../../utilStyles";
import { orange } from "@mui/material/colors";
import typographyStyles from "../../../utilStyles";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { useNavigate } from "react-router-dom";


const SearchAppBar: React.FC = () => {
  const { currentKanbanFilter, changeKanbanFilter, changeSubFilter, currentSubFilter } = useContext(RequisitionContext);
  const { user } = useContext(userContext);
  const [availableKanbanFilters, setAvailableKanbanFilter] = useState<string[]>(
    []
  );
  const navigate = useNavigate();
    const subFilters = [ 
      'Minhas',
      'Todas'
    ];
   
    const [filterMenu, setFilterMenu] = React.useState<null | HTMLElement>(
      null
    );
  const filterMenuOpen = Boolean(filterMenu);
  
  const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenu(event.currentTarget);
  };
  
  const handleCloseFilter = () => {
    setFilterMenu(null);
  };
  
  const handleSelectFilter = async (filter: string) => {
    localStorage.setItem('currentSubFilter', JSON.stringify({ label: filter}));
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
    localStorage.setItem(
      "currentKanbanFilter",
      JSON.stringify({ label: e.currentTarget.id })
    );
    changeKanbanFilter({ label: e.currentTarget.id });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <AppBar
        sx={{
          backgroundColor: "#2B3990", //  className="text-gray-[#2B3990]"
          height: "fit-content",
          display: "flex",
          boxShadow: "none",
          padding: 1,
        }}
        position="static"
      >
        {" "}
        <IconButton onClick={( ) => navigate(`/home`)}  sx={{ position: "absolute" }}>
          <ArrowCircleLeftIcon sx={{ color: "white" }} />
        </IconButton>
        <Typography sx={{ ...typographyStyles.heading2, marginX: 6, color: "white" }}>
          Requisições de Materiais / Serviços
        </Typography>
        <Toolbar sx={{ padding: 0, marginX: 2 }}>
          <Stack direction="row" width="100%" gap={1} alignItems="center">
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "end",
                overflow: "scroll",
                padding: 1,
                borderRight: {
                  xs: "1px solid white",
                  md: "none",
                },
                gap: "0.5rem",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {availableKanbanFilters.map((kanbanFilter) => (
                <Button
                  sx={{
                    ...BaseButtonStyles,
                    minWidth: 80,
                    "&:hover": {
                      backgroundColor: orange[200],
                    },
                    backgroundColor:
                      currentKanbanFilter?.label === kanbanFilter
                        ? orange[200]
                        : "orange",
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
              <IconButton
                id="basic-button"
                aria-controls={filterMenuOpen ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={filterMenuOpen ? "true" : undefined}
                onClick={handleClickFilter}
                sx={{
                  ...buttonStylesMobile,
                }}
              >
                <FilterAltIcon sx={{ color: "white" }} />
              </IconButton>
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
                      backgroundColor:
                        filter === currentSubFilter?.label
                          ? "#e3e3e3"
                          : "white",
                    }}
                    onClick={() => handleSelectFilter(filter)}
                  >
                    {filter}
                  </MenuItem>
                ))}
              </Menu>
            </Stack>
            <AddRequisitionModal />
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default SearchAppBar;


const filterAvailableByUser = {
  purchaser: ["A Fazer", "Fazendo", "Concluído", "Tudo"],
  nonPurchaser: ["Backlog", "Acompanhamento", "Tudo"],
};

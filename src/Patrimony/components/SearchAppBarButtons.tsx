// PatrimonySearchAppBar.js
import {
  Stack,
  Button,
  Menu,
  MenuItem,
  Typography,
  Badge,
} from "@mui/material";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { buttonStylesMobile, BaseButtonStyles } from "../../utilStyles";
import React from "react";


const PatrimonySearchAppBarButtons = React.memo(
  ({
    user,
    isMobile,
    actionsMenuOpen,
    actionsMenu,
    handleClickAction,
    handleCloseActions,
    handleOpenActionModal,
    filterMenuOpen,
    filterMenu,
    handleClickFilter,
    handleCloseFilter,
    handleSelectFilter,
    currentFilter,
    handleOpenChecklistTasks,
    notifications,
  }) => {
    console.log("renderizou SerachAppBarButtons");
    // Array to define the buttons and their configurations
    const PatrimonyAppBarButtons = [
      {
        condition: user?.PERM_ADMINISTRADOR,
        render: () => (
          <>
            <Button
              id="basic-button"
              aria-controls={actionsMenuOpen ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={actionsMenuOpen ? "true" : undefined}
              onClick={handleClickAction}
              sx={
                isMobile ? { ...buttonStylesMobile } : { ...BaseButtonStyles }
              }
            >
              {!isMobile && (
                <Typography textTransform="capitalize">Ações</Typography>
              )}
              <ArrowDropDownCircleIcon />
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={actionsMenu}
              open={actionsMenuOpen}
              onClose={handleCloseActions}
              MenuListProps={{ "aria-labelledby": "basic-button" }}
            >
              {["Inativar", "Ativar", "Excluir"].map((action) => (
                <MenuItem
                  key={action}
                  onClick={() => handleOpenActionModal(action)}
                >
                  {action}
                </MenuItem>
              ))}
            </Menu>
          </>
        ),
      },
      {
        render: () => (
          <>
            <Button
              id="basic-button"
              aria-controls={filterMenuOpen ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={filterMenuOpen ? "true" : undefined}
              onClick={handleClickFilter}
              sx={
                isMobile ? { ...buttonStylesMobile } : { ...BaseButtonStyles }
              }
            >
              {!isMobile && (
                <Typography textTransform="capitalize">Filtros</Typography>
              )}
              <FilterAltIcon />
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={filterMenu}
              open={filterMenuOpen}
              onClose={handleCloseFilter}
              MenuListProps={{ "aria-labelledby": "basic-button" }}
            >
              {["Meus", "Todos"].map((filter) => (
                <MenuItem
                  key={filter}
                  onClick={() => handleSelectFilter(filter)}
                  sx={{
                    backgroundColor:
                      currentFilter === filter ? "whitesmoke" : "white",
                  }}
                >
                  {filter}
                </MenuItem>
              ))}
            </Menu>
          </>
        ),
      },
      {
        render: () => (
          <Button
            id="basic-button"
            aria-controls={filterMenuOpen ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={filterMenuOpen ? "true" : undefined}
            onClick={handleOpenChecklistTasks}
            sx={isMobile ? { ...buttonStylesMobile } : { ...BaseButtonStyles }}
          >
            {!isMobile && (
              <Typography textTransform="capitalize">Checklists</Typography>
            )}
            <Badge badgeContent={notifications?.length} color="primary">
              <NotificationsIcon />
            </Badge>
          </Button>
        ),
      },
    ];

    return (
      <Stack
        className="MenuList"
        flexWrap="wrap"
        justifyContent="start"
        direction="row"
        alignItems="center"
        gap={2}
      >
        {PatrimonyAppBarButtons.map((buttonConfig, index) =>
          buttonConfig.condition !== undefined
            ? buttonConfig.condition && buttonConfig.render()
            : buttonConfig.render()
        )}
      </Stack>
    );
  }
);

export default PatrimonySearchAppBarButtons;

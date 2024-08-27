import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import { Dispatch, SetStateAction, useContext } from "react";
import { PatrimonyInfoContext } from "../context/patrimonyInfoContext";
import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import CreatePatrimonyInfoModal from "../modals/CreatePatrimonyInfoModal";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import React from "react";
import { PatrimonyInfo } from "../types";
import { deleteMultiplePatrimonies, updateMultiplePatrimonies } from "../utils";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

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

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface SearchAppBarProps {
  handleSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  selectedItems: PatrimonyInfo[];
  setSelectedItems: Dispatch<SetStateAction<PatrimonyInfo[]>>;
  setFilteredRows?: Dispatch<SetStateAction<PatrimonyInfo[] | undefined>>;
}

export default function SearchAppBar({
  handleSearch,
  selectedItems,
  setSelectedItems,
}: SearchAppBarProps) {
  const {
    toggleCreatingPatrimonyInfo,
    toggleRefreshPatrimonyInfo,
    setCurrentFilter,
  } = useContext(PatrimonyInfoContext);

  const [actionsMenu, setActionsMenu] = React.useState<null | HTMLElement>(
    null
  );
  const actionsMenuOpen = Boolean(actionsMenu);
  const [filterMenu, setFilterMenu] = React.useState<null | HTMLElement>(null);
  const filterMenuOpen = Boolean(filterMenu);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [openInactivateModal, setOpenInactivateModal] = React.useState(false);
  const [openActivateModal, setOpenActivateModal] = React.useState(false);

  const handleOpenActivateModal = () => setOpenActivateModal(true);
  const handleCloseActivateModal = () => setOpenActivateModal(false);

  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);

  const handleOpenInactivateModal = () => setOpenInactivateModal(true);
  const handleCloseInactivateModal = () => setOpenInactivateModal(false);

  const handleClickAction = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActionsMenu(event.currentTarget);
  };

  const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenu(event.currentTarget);
  };

  const handleOpenActionModal = (action: string) => {
    if (action === "Excluir" && selectedItems?.length) {
      handleOpenDeleteModal();
    } else if (action === "Inativar" && selectedItems?.length) {
      handleOpenInactivateModal();
    } else if (action === "Ativar" && selectedItems?.length) {
      handleOpenActivateModal();
    } else {
      alert("Selecione pelo menos um item");
    }
  };

  const handleSelectFilter = async (filter: string) => {
    handleCloseFilter();
    setCurrentFilter(filter);
  };

  const handleCloseFilter = () => {
    setFilterMenu(null);
  };

  const handleCloseActions = () => {
    setActionsMenu(null);
  };

  const handleDeletePatrimony = async () => {
    if (selectedItems) {
      await deleteMultiplePatrimonies(selectedItems);
      setSelectedItems([]);
      toggleRefreshPatrimonyInfo();
      handleCloseDeleteModal();
      handleCloseActions();
    }
  };

  const handleActivatePatrimony = async () => {
    if (selectedItems) {
      const response = await updateMultiplePatrimonies(selectedItems, {
        active: true,
      });
      if (response?.status === 200) {
        setSelectedItems([]);
        toggleRefreshPatrimonyInfo();
        handleCloseActivateModal();
        handleCloseActions();
      }
    }
  };

  const handleInactivatePatrimony = async () => {
    if (selectedItems) {
      const response = await updateMultiplePatrimonies(selectedItems);
      if (response?.status === 200) {
        setSelectedItems([]);
        toggleRefreshPatrimonyInfo();
        handleCloseInactivateModal();
        handleCloseActions();
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#2B3990",
          display: "flex",
          justifyContent: "center",
          padding: "0.4rem",
        }}
      >
        <Toolbar>
          <CreatePatrimonyInfoModal />
          <Stack
            direction="row"
            width="100%"
            flexWrap="wrap"
            justifyContent="space-between"
          >
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                onKeyDown={handleSearch}
              />
            </Search>

            <Stack
              className="MenuList"
              flexWrap="wrap"
              justifyContent="end"
              direction="row"
              spacing={2}
            >
              <Button
                id="basic-button"
                aria-controls={actionsMenuOpen ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={actionsMenuOpen ? "true" : undefined}
                onClick={handleClickAction}
                sx={{
                  color: "white",
                  backgroundColor: "#F7941E",
                  "&:hover": {
                    backgroundColor: "#f1b963",
                  },
                }}
              >
                <Typography textTransform="capitalize">Ações</Typography>
                <ArrowDropDownCircleIcon sx={{ color: "white" }} />
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={actionsMenu}
                open={actionsMenuOpen}
                onClose={handleCloseActions}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
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
                {["Ativos", "Inativos"].map((filter) => (
                  <MenuItem
                    key={filter}
                    onClick={() => handleSelectFilter(filter)}
                  >
                    {filter}
                  </MenuItem>
                ))}
              </Menu>
            </Stack>

            <IconButton
              onClick={toggleCreatingPatrimonyInfo}
              sx={{
                backgroundColor: "#F7941E",
                color: "white",
                "&:hover": { backgroundColor: "#f1b963" },
              }}
            >
              <AddIcon sx={{ color: "#2B3990" }} />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Tem certeza que deseja excluir os registros selecionados?
          </Typography>
          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              sx={{ borderColor: "blue", color: "blue" }}
              onClick={handleDeletePatrimony}
            >
              Sim
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{ borderColor: "red", color: "red" }}
              onClick={handleCloseDeleteModal}
            >
              Não
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={openInactivateModal}
        onClose={handleCloseInactivateModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Tem certeza que deseja inativar os registros selecionados?
          </Typography>
          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              sx={{ borderColor: "blue", color: "blue" }}
              onClick={handleInactivatePatrimony}
            >
              Sim
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{ borderColor: "red", color: "red" }}
              onClick={handleCloseInactivateModal}
            >
              Não
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={openActivateModal}
        onClose={handleCloseActivateModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Tem certeza que deseja ativar os registros selecionados?
          </Typography>
          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              sx={{ borderColor: "blue", color: "blue" }}
              onClick={handleActivatePatrimony}
            >
              Sim
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{ borderColor: "red", color: "red" }}
              onClick={handleCloseActivateModal}
            >
              Não
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}

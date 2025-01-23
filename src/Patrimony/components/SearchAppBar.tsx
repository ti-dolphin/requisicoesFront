/* eslint-disable @typescript-eslint/no-unused-vars */
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { PatrimonyInfoContext } from "../context/patrimonyInfoContext";
import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CreatePatrimonyInfoModal from "../modals/CreatePatrimonyInfoModal";
import React from "react";
import { MovementationChecklist, PatrimonyInfo } from "../types";
import { deleteMultiplePatrimonies, getPatrimonyNotifications, updateMultiplePatrimonies } from "../utils";
import { userContext } from "../../Requisitions/context/userContext";
import { checklistContext } from "../context/checklistContext";
import { useNavigate } from "react-router-dom";
import PatrimonySearchAppBarButtons from "./SearchAppBarButtons";



interface SearchAppBarProps {
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedItems: PatrimonyInfo[];
  setSelectedItems: Dispatch<SetStateAction<PatrimonyInfo[]>>;
  setFilteredRows?: Dispatch<SetStateAction<PatrimonyInfo[] | undefined>>;
}

const SearchAppBar = React.memo(
  ({ handleSearch, selectedItems, setSelectedItems }: SearchAppBarProps) => {
    console.log("renderizou SearchAppbar");
    const {
      toggleCreatingPatrimonyInfo,
      toggleRefreshPatrimonyInfo,
      setCurrentFilter,
      currentFilter,
    } = useContext(PatrimonyInfoContext);
    const navigate = useNavigate();
    const { toggleChecklistOpen } = useContext(checklistContext);
    const { user } = useContext(userContext);
    const [actionsMenu, setActionsMenu] = React.useState<null | HTMLElement>(
      null
    );
    const actionsMenuOpen = Boolean(actionsMenu);

    const [filterMenu, setFilterMenu] = React.useState<null | HTMLElement>(
      null
    );
    const filterMenuOpen = Boolean(filterMenu);

    const [notificationsMenu, setNotificationsMenu] =
      React.useState<null | HTMLElement>(null);
    const notificationsMenuOpen = Boolean(notificationsMenu);

    const [notifications, setNotifications] =
      useState<MovementationChecklist[]>();

    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
    const [openInactivateModal, setOpenInactivateModal] = React.useState(false);
    const [openActivateModal, setOpenActivateModal] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    // Funções de abertura e fechamento dos modais
    const handleOpenActivateModal = React.useCallback(
      () => setOpenActivateModal(true),
      []
    );
    const handleCloseActivateModal = React.useCallback(
      () => setOpenActivateModal(false),
      []
    );
    const handleOpenDeleteModal = React.useCallback(
      () => setOpenDeleteModal(true),
      []
    );
    const handleCloseDeleteModal = React.useCallback(
      () => setOpenDeleteModal(false),
      []
    );
    const handleOpenInactivateModal = React.useCallback(
      () => setOpenInactivateModal(true),
      []
    );
    const handleCloseInactivateModal = React.useCallback(
      () => setOpenInactivateModal(false),
      []
    );

    // Funções de abertura e fechamento dos menus
    const handleClickAction = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        setActionsMenu(event.currentTarget);
      },
      []
    );
    const handleCloseActions = React.useCallback(
      () => setActionsMenu(null),
      []
    );

    const handleClickFilter = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        setFilterMenu(event.currentTarget);
      },
      []
    );
    const handleCloseFilter = React.useCallback(() => setFilterMenu(null), []);

    const handleCloseNotificationsMenu = React.useCallback(
      () => setNotificationsMenu(null),
      []
    );

    // Funções relacionadas às ações do patrimônio
    const handleOpenActionModal = React.useCallback(
      (action: string) => {
        if (action === "Excluir" && selectedItems?.length) {
          handleOpenDeleteModal();
        } else if (action === "Inativar" && selectedItems?.length) {
          handleOpenInactivateModal();
        } else if (action === "Ativar" && selectedItems?.length) {
          handleOpenActivateModal();
        } else {
          alert("Selecione pelo menos um item");
        }
      },
      [
        selectedItems,
        handleOpenDeleteModal,
        handleOpenInactivateModal,
        handleOpenActivateModal,
      ]
    );

    const handleSelectFilter = React.useCallback(
      async (filter: string) => {
        handleCloseFilter();
        setCurrentFilter(filter);
      },
      [handleCloseFilter, setCurrentFilter]
    );

    const handleDeletePatrimony = React.useCallback(async () => {
      if (selectedItems) {
        await deleteMultiplePatrimonies(selectedItems);
        setSelectedItems([]);
        toggleRefreshPatrimonyInfo();
        handleCloseDeleteModal();
        handleCloseActions();
      }
    }, [selectedItems, setSelectedItems, toggleRefreshPatrimonyInfo, handleCloseDeleteModal, handleCloseActions]);

    const handleActivatePatrimony = React.useCallback(async () => {
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
    }, [selectedItems, setSelectedItems, toggleRefreshPatrimonyInfo, handleCloseActivateModal, handleCloseActions]);

    const handleInactivatePatrimony = React.useCallback(async () => {
      if (selectedItems) {
        const response = await updateMultiplePatrimonies(selectedItems);
        if (response?.status === 200) {
          setSelectedItems([]);
          toggleRefreshPatrimonyInfo();
          handleCloseInactivateModal();
          handleCloseActions();
        }
      }
    }, [selectedItems, setSelectedItems, toggleRefreshPatrimonyInfo, handleCloseInactivateModal, handleCloseActions]);

    // Funções relacionadas às notificações
    const handleSelectNotification = React.useCallback(
      (checklist: MovementationChecklist) => {
        toggleChecklistOpen(checklist);
        navigate(`checklist/${checklist.id_patrimonio}`);
      },
      [toggleChecklistOpen, navigate]
    );

    const getNotifications = React.useCallback(async () => {
      console.log("getNotifications");
      if (user) {
        const notifications = await getPatrimonyNotifications(user, "todos");
        setNotifications(notifications);
      }
    }, [user]);

    // Função para abrir tarefas de checklist
    const handleOpenChecklistTasks = React.useCallback(() => {
      navigate(`/tasks`);
    }, [navigate]);

    // useEffect para configurações iniciais
    useEffect(() => {
      setIsMobile(window.innerWidth <= 768);
      getNotifications();
    }, [user, getNotifications]);

    return (
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <AppBar
          position="static"
          sx={{
            backgroundColor: "#2B3990",
            display: "flex",
            justifyContent: "center",
            padding: "0.2rem",
          }}
        >
          <Toolbar>
            <CreatePatrimonyInfoModal />
            <Stack
              direction="row"
              width="100%"
              flexWrap="wrap"
              justifyContent="space-between"
              gap={1}
            >
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
                  onChange={handleSearch}
                />
              </Search>
              {user && notifications && (
                <PatrimonySearchAppBarButtons
                  user={user}
                  isMobile={isMobile}
                  actionsMenuOpen={actionsMenuOpen}
                  actionsMenu={actionsMenu}
                  handleClickAction={handleClickAction}
                  handleCloseActions={handleCloseActions}
                  handleOpenActionModal={handleOpenActionModal}
                  filterMenuOpen={filterMenuOpen}
                  filterMenu={filterMenu}
                  handleClickFilter={handleClickFilter}
                  handleCloseFilter={handleCloseFilter}
                  handleSelectFilter={handleSelectFilter}
                  currentFilter={currentFilter}
                  handleOpenChecklistTasks={handleOpenChecklistTasks}
                  notifications={notifications}
                />
              )}
              <Stack direction="row" alignItems="center" gap={2}>
                {user?.PERM_CADASTRAR_PAT && (
                  <Tooltip title="Novo Patrimônio">
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
                  </Tooltip>
                )}
              </Stack>
              <Menu
                id="basic-menu"
                anchorEl={notificationsMenu}
                open={notificationsMenuOpen}
                onClose={handleCloseNotificationsMenu}
                sx={{
                  marginTop: "0.4rem",
                  whiteSpace: "normal", // Permite que o texto quebre
                  display: "block", // Garante que o conteúdo fique em bloco no menu
                  width: "100%", // Garante que o item ocupe toda a largura disponível
                }}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                {notifications &&
                  notifications.map((notification) => (
                    <MenuItem
                      onClick={() => handleSelectNotification(notification)}
                      key={notification.id_checklist_movimentacao}
                      sx={{ overFlowX: "scroll" }}
                    >
                      <Typography
                        fontSize="small"
                        sx={{
                          maxWidth: "100%",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        Você deve verificar ou realizar o checklist do
                        patrimônio {notification.nome}
                      </Typography>
                    </MenuItem>
                  ))}
              </Menu>
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
);

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
export default SearchAppBar;



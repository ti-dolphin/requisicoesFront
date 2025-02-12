/* eslint-disable @typescript-eslint/no-unused-vars */

import { Box, AppBar, Toolbar, Stack, Tooltip, IconButton, Menu, MenuItem, Typography, Modal, Button } from "@mui/material";
import React, { Dispatch, SetStateAction, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../../Requisitions/context/userContext";
import { basicAppbarStyles } from "../../../utilStyles";
import { checklistContext } from "../../context/checklistContext";
import { PatrimonyInfoContext } from "../../context/patrimonyInfoContext";
import { PatrimonyInfo, MovementationChecklist } from "../../types";
import { deleteMultiplePatrimonies, updateMultiplePatrimonies, getPatrimonyNotifications, SearchIconWrapper, Search, StyledInputBase } from "../../utils";
import CreatePatrimonyInfoModal from "../modals/CreatePatrimonyAccessoryModal/CreatePatrimonyInfoModal";
import PatrimonySearchAppBarButtons from "../SearchAppBarButtons/SearchAppBarButtons";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';


interface SearchAppBarProps {
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedItems: PatrimonyInfo[];
  isCardViewActive: boolean;
  setSelectedItems: Dispatch<SetStateAction<PatrimonyInfo[]>>;
  setFilteredRows?: Dispatch<SetStateAction<PatrimonyInfo[] | undefined>>;
  setIsCardViewActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchAppBar = React.memo(
  ({
    handleSearch,
    selectedItems,
    setSelectedItems,
    isCardViewActive,
    setIsCardViewActive,
  }: SearchAppBarProps) => {

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
    }, [
      selectedItems,
      setSelectedItems,
      toggleRefreshPatrimonyInfo,
      handleCloseDeleteModal,
      handleCloseActions,
    ]);

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
    }, [
      selectedItems,
      setSelectedItems,
      toggleRefreshPatrimonyInfo,
      handleCloseActivateModal,
      handleCloseActions,
    ]);

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
    }, [
      selectedItems,
      setSelectedItems,
      toggleRefreshPatrimonyInfo,
      handleCloseInactivateModal,
      handleCloseActions,
    ]);

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
      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <AppBar position="static" sx={{ ...basicAppbarStyles }}>
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
                  placeholder="Buscar..."
                  inputProps={{ "aria-label": "search" }}
                  onChange={handleSearch}
                />
              </Search>
                      {user && notifications && (
                        <PatrimonySearchAppBarButtons
                          setIsCardViewActive={setIsCardViewActive}
                          isCardViewActive={isCardViewActive}
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



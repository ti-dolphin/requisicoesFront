import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { UserService } from "../../services/UserService";
import { User } from "../../models/User";
import UpperNavigation from "../../components/shared/UpperNavigation";
import BaseSearchInput from "../../components/shared/BaseSearchInput";
import BaseDataTable from "../../components/shared/BaseDataTable";
import BaseDeleteDialog from "../../components/shared/BaseDeleteDialog";
import UserEditModal from "../../components/admin/UserEditModal";

const UserManagementPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loggedUser = useSelector((state: RootState) => state.user.user);
  const isAdmin = Number(loggedUser?.PERM_ADMINISTRADOR) === 1;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await UserService.getAllForAdmin();
      setUsers(data);
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: err?.response?.data?.error || "Erro ao carregar usuários",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleSearch = useMemo(
    () =>
      debounce((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
      }, 300),
    []
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((u) =>
      [u.NOME, u.LOGIN, u.EMAIL]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [users, search]);

  const handleToggleActive = async () => {
    if (!confirmTarget) return;
    const target = confirmTarget;
    try {
      await UserService.setActive(target.CODPESSOA, !target.ATIVO);
      dispatch(
        setFeedback({
          message: target.ATIVO ? "Usuário desativado" : "Usuário reativado",
          type: "success",
        })
      );
      setConfirmTarget(null);
      loadUsers();
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: err?.response?.data?.error || "Erro ao alterar status do usuário",
          type: "error",
        })
      );
      setConfirmTarget(null);
    }
  };

  const columns: GridColDef[] = [
    { field: "NOME", headerName: "Nome", flex: 1.5, minWidth: 180 },
    { field: "LOGIN", headerName: "Login", flex: 1, minWidth: 120 },
    { field: "EMAIL", headerName: "E-mail", flex: 1.5, minWidth: 180 },
    {
      field: "ATIVO",
      headerName: "Status",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.ATIVO ? "Ativo" : "Inativo"}
          color={params.row.ATIVO ? "success" : "default"}
          variant={params.row.ATIVO ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "PERM_ADMINISTRADOR",
      headerName: "Admin",
      width: 90,
      sortable: false,
      renderCell: (params) =>
        Number(params.row.PERM_ADMINISTRADOR) === 1 ? "Sim" : "—",
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row as User;
        const isSelf = row.CODPESSOA === loggedUser?.CODPESSOA;
        return (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                color="primary"
                onClick={() => setEditUser(row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={row.ATIVO ? "Desativar" : "Reativar"}>
              <span>
                <IconButton
                  size="small"
                  color={row.ATIVO ? "error" : "success"}
                  disabled={isSelf}
                  onClick={() => setConfirmTarget(row)}
                >
                  {row.ATIVO ? (
                    <BlockIcon fontSize="small" />
                  ) : (
                    <CheckCircleIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  if (!isAdmin) {
    return (
      <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", p: 3 }}>
        <UpperNavigation handleBack={() => navigate("/gestao-adm")} />
        <Alert severity="error" sx={{ mt: 3 }}>
          Você não tem permissão para acessar esta tela.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <UpperNavigation handleBack={() => navigate("/gestao-adm")} />

      <Box sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={2}
        >
          <Typography variant="h5" fontWeight={600}>
            Gerenciar Usuários
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
            <BaseSearchInput
              onChange={handleSearch}
              showIcon
              placeholder="Buscar por nome, login ou e-mail"
            />
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate("/admin/usuarios/novo")}
            >
              Novo Usuário
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ height: "calc(100vh - 180px)", backgroundColor: "#fff" }}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
              <CircularProgress />
            </Stack>
          ) : (
            <BaseDataTable
              rows={filteredUsers}
              columns={columns}
              getRowId={(row: any) => row.CODPESSOA}
              disableRowSelectionOnClick
              disableColumnMenu
              rowHeight={44}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              theme={theme}
            />
          )}
        </Box>
      </Box>

      <UserEditModal
        open={Boolean(editUser)}
        user={editUser}
        onClose={() => setEditUser(null)}
        onSaved={loadUsers}
      />

      <BaseDeleteDialog
        open={Boolean(confirmTarget)}
        title={confirmTarget?.ATIVO ? "Desativar usuário" : "Reativar usuário"}
        message={
          confirmTarget?.ATIVO
            ? `Desativar "${confirmTarget?.NOME}"? Ele perderá o acesso ao sistema, mas o histórico é mantido.`
            : `Reativar "${confirmTarget?.NOME}"? Ele voltará a ter acesso conforme suas permissões.`
        }
        onConfirm={handleToggleActive}
        onCancel={() => setConfirmTarget(null)}
      />
    </Box>
  );
};

export default UserManagementPage;

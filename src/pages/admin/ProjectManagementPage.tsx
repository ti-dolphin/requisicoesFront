import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { ProjectService } from "../../services/ProjectService";
import { UserService } from "../../services/UserService";
import { Project } from "../../models/Project";
import { User } from "../../models/User";
import UpperNavigation from "../../components/shared/UpperNavigation";
import BaseSearchInput from "../../components/shared/BaseSearchInput";
import BaseDataTable from "../../components/shared/BaseDataTable";
import ProjectEditModal from "../../components/admin/ProjectEditModal";

const ProjectManagementPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loggedUser = useSelector((state: RootState) => state.user.user);
  const isAdmin = Number(loggedUser?.PERM_ADMINISTRADOR) === 1;

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editProject, setEditProject] = useState<Project | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData] = await Promise.all([
        ProjectService.getAllForAdmin(),
        UserService.getAllForAdmin(),
      ]);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: err?.response?.data?.error || "Erro ao carregar projetos",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const userByCodPessoa = useMemo(() => {
    const map = new Map<number, User>();
    users.forEach((user) => map.set(user.CODPESSOA, user));
    return map;
  }, [users]);

  const handleSearch = useMemo(
    () =>
      debounce((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
      }, 300),
    []
  );

  const rows = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        responsavel_nome:
          userByCodPessoa.get(Number(project.ID_RESPONSAVEL))?.NOME ?? "",
      })),
    [projects, userByCodPessoa]
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      [row.ID, row.DESCRICAO, row.responsavel_nome]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [rows, search]);

  const columns: GridColDef[] = [
    { field: "ID", headerName: "ID", width: 90 },
    { field: "DESCRICAO", headerName: "Projeto", flex: 2, minWidth: 220 },
    {
      field: "responsavel_nome",
      headerName: "Responsável",
      flex: 1.5,
      minWidth: 180,
      renderCell: (params) => params.row.responsavel_nome || "—",
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
            Gerenciar Projetos
          </Typography>
          <BaseSearchInput
            onChange={handleSearch}
            showIcon
            placeholder="Buscar por projeto ou responsável"
            styles={{ width: 320 }}
          />
        </Stack>

        <Box sx={{ height: "calc(100vh - 180px)", backgroundColor: "#fff" }}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
              <CircularProgress />
            </Stack>
          ) : (
            <BaseDataTable
              rows={filteredRows}
              columns={columns}
              getRowId={(row: any) => row.ID}
              onRowClick={(params: any) => setEditProject(params.row)}
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

      <ProjectEditModal
        open={Boolean(editProject)}
        project={editProject}
        users={users}
        onClose={() => setEditProject(null)}
        onSaved={loadData}
      />
    </Box>
  );
};

export default ProjectManagementPage;

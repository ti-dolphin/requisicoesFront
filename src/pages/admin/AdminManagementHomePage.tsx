import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import UpperNavigation from "../../components/shared/UpperNavigation";

const cardStyle = {
  borderRadius: 3,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
  minHeight: 170,
};

const AdminManagementHomePage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = Number(user?.PERM_ADMINISTRADOR) === 1;

  if (!isAdmin) {
    return (
      <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", p: 3 }}>
        <UpperNavigation handleBack={() => navigate("/")} />
        <Alert severity="error" sx={{ mt: 3 }}>
          Você não tem permissão para acessar esta tela.
        </Alert>
      </Box>
    );
  }

  const options = [
    {
      title: "Gerenciar Usuários",
      description:
        "Listar, cadastrar, editar permissões e ativar/desativar usuários do sistema.",
      icon: <ManageAccountsIcon color="primary" fontSize="large" />,
      action: () => navigate("/admin/usuarios"),
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <UpperNavigation handleBack={() => navigate("/")} />

      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Gestão Adm
        </Typography>

        <Grid container spacing={3}>
          {options.map((option) => (
            <Grid item xs={12} md={4} key={option.title}>
              <Card sx={cardStyle}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {option.icon}
                    <Typography variant="h6">{option.title}</Typography>
                  </Stack>
                  <Typography color="text.secondary" mt={1} sx={{ minHeight: 40 }}>
                    {option.description}
                  </Typography>
                  <Box mt={2}>
                    <Button variant="contained" fullWidth onClick={option.action}>
                      Abrir
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminManagementHomePage;

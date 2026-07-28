import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { UserService } from "../../services/UserService";
import UpperNavigation from "../../components/shared/UpperNavigation";
import {
  baseUserPermissionsPayload,
  initialUserCreationFormState,
  UserCreationFormState,
} from "../../models/admin/UserCreation";

const UserCreationPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  const [form, setForm] = useState<UserCreationFormState>(
    initialUserCreationFormState
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = useMemo(
    () => Number(user?.PERM_ADMINISTRADOR) === 1,
    [user?.PERM_ADMINISTRADOR]
  );

  const handleBack = () => {
    navigate("/admin/usuarios");
  };

  const handleChange =
    (field: keyof UserCreationFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;

      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const validate = () => {
    if (!form.NOME.trim()) {
      return "Nome é obrigatório";
    }

    if (!form.LOGIN.trim()) {
      return "Login é obrigatório";
    }

    if (!form.SENHA) {
      return "Senha é obrigatória";
    }

    if (form.SENHA.length < 6) {
      return "A senha deve ter no mínimo 6 caracteres";
    }

    if (form.SENHA !== form.confirmarSenha) {
      return "Senha e confirmação não conferem";
    }

    return "";
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!isAdmin) {
      setError("Apenas administradores podem cadastrar usuários");
      return;
    }

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const rhPermissions = form.PERM_RH
      ? {
          PERM_APONT: true,
          PERM_STATUS_APONT: true,
          PERM_GESTAO_PESSOAS: true,
          PERM_CONTROLE_RECESSO: true,
          PERM_PONTO: true,
          PERM_APONTAMENTO_PONTO: true,
          PERM_APONTAMENTO_PONTO_JUSTIFICATIVA: true,
          PERM_BANCO_HORAS: true,
          PERM_FOLGA: true,
        }
      : {};

    try {
      setLoading(true);
      await UserService.createByAdmin({
        ...baseUserPermissionsPayload,
        ...rhPermissions,
        NOME: form.NOME,
        LOGIN: form.LOGIN,
        EMAIL: form.EMAIL || undefined,
        SENHA: form.SENHA,
        ATIVO: form.ATIVO,
        PERM_LOGIN: form.PERM_LOGIN,
        PERM_REQUISITAR: form.PERM_REQUISITAR ? 1 : 0,
        PERM_COMERCIAL: form.PERM_COMERCIAL ? 1 : 0,
        PERM_COMPRADOR: form.PERM_COMPRADOR ? 1 : 0,
        PERM_ADMINISTRADOR: form.PERM_ADMINISTRADOR ? 1 : 0,
      });

      setSuccess("Usuário cadastrado com sucesso");
      setForm(initialUserCreationFormState);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Erro ao cadastrar usuário");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", p: 3 }}>
        <UpperNavigation handleBack={handleBack} />
        <Alert severity="error" sx={{ mt: 3 }}>
          Você não tem permissão para acessar esta tela.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <UpperNavigation handleBack={handleBack} />

      <Box sx={{ p: 3, maxWidth: 900, margin: "0 auto" }}>
        <Typography variant="h5" fontWeight={600} mb={2}>
          Cadastro de Usuário
        </Typography>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Nome"
                    value={form.NOME}
                    onChange={handleChange("NOME")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Login"
                    value={form.LOGIN}
                    onChange={handleChange("LOGIN")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="E-mail"
                    value={form.EMAIL}
                    onChange={handleChange("EMAIL")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="password"
                    label="Senha"
                    value={form.SENHA}
                    onChange={handleChange("SENHA")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="password"
                    label="Confirmar senha"
                    value={form.confirmarSenha}
                    onChange={handleChange("confirmarSenha")}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle1" fontWeight={600}>
                Permissões principais
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.ATIVO}
                        onChange={handleChange("ATIVO")}
                      />
                    }
                    label="Usuário ativo"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.PERM_LOGIN}
                        onChange={handleChange("PERM_LOGIN")}
                      />
                    }
                    label="Permitir login"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.PERM_REQUISITAR}
                        onChange={handleChange("PERM_REQUISITAR")}
                      />
                    }
                    label="Requisitar"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.PERM_COMERCIAL}
                        onChange={handleChange("PERM_COMERCIAL")}
                      />
                    }
                    label="Comercial"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.PERM_COMPRADOR}
                        onChange={handleChange("PERM_COMPRADOR")}
                      />
                    }
                    label="Comprador"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.PERM_RH}
                        onChange={handleChange("PERM_RH")}
                      />
                    }
                    label="RH (Gestão de Pessoas)"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.PERM_ADMINISTRADOR}
                        onChange={handleChange("PERM_ADMINISTRADOR")}
                      />
                    }
                    label="Administrador"
                  />
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Cadastrar usuário"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UserCreationPage;

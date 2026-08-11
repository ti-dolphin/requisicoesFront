import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { UserService } from "../../services/UserService";
import { User } from "../../models/User";
import {
  UserEditFormState,
  buildEditPayload,
  mapUserToEditForm,
} from "../../models/admin/UserEdit";

interface UserEditModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

const permissionFields: { key: keyof UserEditFormState; label: string }[] = [
  { key: "ATIVO", label: "Usuário ativo" },
  { key: "PERM_LOGIN", label: "Permitir login" },
  { key: "PERM_REQUISITAR", label: "Requisitar" },
  { key: "PERM_COMERCIAL", label: "Comercial" },
  { key: "PERM_COMPRADOR", label: "Comprador" },
  { key: "PERM_RH", label: "RH (Gestão de Pessoas)" },
  { key: "PERM_ADMINISTRADOR", label: "Administrador" },
];

const UserEditModal = ({ open, user, onClose, onSaved }: UserEditModalProps) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState<UserEditFormState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(mapUserToEditForm(user));
      setError("");
      setSenha("");
      setConfirmarSenha("");
      setShowSenha(false);
    }
  }, [user]);

  if (!user || !form) return null;

  const handleText =
    (field: "NOME" | "EMAIL") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => (prev ? { ...prev, [field]: event.target.value } : prev));
    };

  const handleCheckbox =
    (field: keyof UserEditFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) =>
        prev ? { ...prev, [field]: event.target.checked } : prev
      );
    };

  const handleSubmit = async () => {
    setError("");

    if (!form.NOME.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    const alterandoSenha = Boolean(senha || confirmarSenha);

    if (alterandoSenha) {
      if (senha.length < 6) {
        setError("A senha deve ter no mínimo 6 caracteres");
        return;
      }

      if (senha !== confirmarSenha) {
        setError("Senha e confirmação não conferem");
        return;
      }
    }

    try {
      setLoading(true);
      await UserService.updateByAdmin(user.CODPESSOA, buildEditPayload(form));

      if (alterandoSenha) {
        await UserService.resetPasswordByAdmin(user.CODPESSOA, senha);
      }

      dispatch(
        setFeedback({
          message: alterandoSenha
            ? "Usuário e senha atualizados com sucesso"
            : "Usuário atualizado com sucesso",
          type: "success",
        })
      );
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Erro ao atualizar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "primary.main",
          fontWeight: 600,
        }}
      >
        Editar usuário
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Nome"
                value={form.NOME}
                onChange={handleText("NOME")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                disabled
                label="Login"
                value={user.LOGIN ?? ""}
                helperText="O login não pode ser alterado"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-mail"
                value={form.EMAIL}
                onChange={handleText("EMAIL")}
              />
            </Grid>
          </Grid>

          <Divider />

          <Typography variant="subtitle1" fontWeight={600}>
            Senha
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type={showSenha ? "text" : "password"}
                label="Nova senha"
                value={senha}
                autoComplete="new-password"
                onChange={(event) => setSenha(event.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowSenha((prev) => !prev)}
                        aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showSenha ? (
                          <VisibilityOffIcon fontSize="small" />
                        ) : (
                          <VisibilityIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type={showSenha ? "text" : "password"}
                label="Confirmar nova senha"
                value={confirmarSenha}
                autoComplete="new-password"
                onChange={(event) => setConfirmarSenha(event.target.value)}
              />
            </Grid>
          </Grid>

          <Divider />

          <Typography variant="subtitle1" fontWeight={600}>
            Permissões
          </Typography>

          <Grid container spacing={1}>
            {permissionFields.map(({ key, label }) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(form[key])}
                      onChange={handleCheckbox(key)}
                    />
                  }
                  label={label}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button variant="contained" color="error" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserEditModal;

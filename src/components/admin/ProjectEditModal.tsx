import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { ProjectService } from "../../services/ProjectService";
import { User } from "../../models/User";
import { ProjectEditModalProps } from "../../models/admin/ProjectEditModal";

const ProjectEditModal = ({
  open,
  project,
  users,
  onClose,
  onSaved,
}: ProjectEditModalProps) => {
  const dispatch = useDispatch();
  const [responsavel, setResponsavel] = useState<User | null>(null);
  const [gerente, setGerente] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const responsavelOptions = useMemo(
    () => users.filter((user) => user.ATIVO),
    [users]
  );

  const gerenteOptions = useMemo(
    () => users.filter((user) => user.CODGERENTE !== null && user.ATIVO),
    [users]
  );

  useEffect(() => {
    if (!project) return;
    setResponsavel(
      users.find((user) => user.CODPESSOA === project.ID_RESPONSAVEL) ?? null
    );
    setGerente(
      users.find(
        (user) =>
          user.CODGERENTE !== null && user.CODGERENTE === project.CODGERENTE
      ) ?? null
    );
    setError("");
  }, [project, users]);

  if (!project) return null;

  const handleSubmit = async () => {
    setError("");
    try {
      setLoading(true);
      await ProjectService.updateResponsaveisByAdmin(project.ID, {
        CODGERENTE: gerente?.CODGERENTE ?? null,
        ID_RESPONSAVEL: responsavel?.CODPESSOA ?? null,
      });
      dispatch(
        setFeedback({
          message: "Projeto atualizado com sucesso",
          type: "success",
        })
      );
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Erro ao atualizar projeto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "primary.main",
          fontWeight: 600,
        }}
      >
        Editar projeto
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            disabled
            label="Projeto"
            value={project.DESCRICAO ?? `Projeto sem descrição - ${project.ID}`}
          />

          <Autocomplete
            options={responsavelOptions}
            value={responsavel}
            onChange={(_, value) => setResponsavel(value)}
            getOptionLabel={(option) => option.NOME}
            isOptionEqualToValue={(option, value) =>
              option.CODPESSOA === value.CODPESSOA
            }
            renderInput={(params) => (
              <TextField {...params} label="Responsável" />
            )}
          />

          <Autocomplete
            options={gerenteOptions}
            value={gerente}
            onChange={(_, value) => setGerente(value)}
            getOptionLabel={(option) => option.NOME}
            isOptionEqualToValue={(option, value) =>
              option.CODGERENTE === value.CODGERENTE
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Gerente"
              />
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="contained"
          color="error"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectEditModal;

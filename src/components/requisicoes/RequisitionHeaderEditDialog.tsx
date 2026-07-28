import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import {
  setRefreshRequisition,
  updateRequisitionField,
} from "../../redux/slices/requisicoes/requisitionSlice";
import RequisitionService from "../../services/requisicoes/RequisitionService";
import { useProjectOptions } from "../../hooks/projectOptionsHook";
import { Requisition } from "../../models/requisicoes/Requisition";
import { Option } from "../../types";

interface RequisitionHeaderEditDialogProps {
  open: boolean;
  onClose: () => void;
  requisition: Requisition;
  initialFocus?: "description" | "project";
}

const RequisitionHeaderEditDialog = ({
  open,
  onClose,
  requisition,
  initialFocus = "description",
}: RequisitionHeaderEditDialogProps) => {
  const dispatch = useDispatch();
  const refreshRequisition = useSelector(
    (state: RootState) => state.requisition.refreshRequisition
  );
  const { projectOptions } = useProjectOptions();

  const [description, setDescription] = useState(requisition.DESCRIPTION ?? "");
  const [selectedProject, setSelectedProject] = useState<Option | null>(
    requisition.ID_PROJETO
      ? {
          id: requisition.ID_PROJETO,
          name: requisition.projeto?.DESCRICAO ?? `Projeto ${requisition.ID_PROJETO}`,
        }
      : null
  );
  const [saving, setSaving] = useState(false);

  const trimmedDescription = description.trim();
  const descriptionError = trimmedDescription.length === 0;

  const handleSave = async () => {
    if (descriptionError) {
      return;
    }

    const payload: Record<string, any> = {};
    if (trimmedDescription !== (requisition.DESCRIPTION ?? "").trim()) {
      payload.DESCRIPTION = trimmedDescription;
    }
    if (
      selectedProject &&
      Number(selectedProject.id) !== Number(requisition.ID_PROJETO)
    ) {
      payload.ID_PROJETO = Number(selectedProject.id);
    }

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      await RequisitionService.update(requisition.ID_REQUISICAO, payload);

      if (payload.DESCRIPTION !== undefined) {
        dispatch(
          updateRequisitionField({
            field: "DESCRIPTION",
            value: payload.DESCRIPTION,
          })
        );
      }
      if (payload.ID_PROJETO !== undefined) {
        dispatch(
          updateRequisitionField({
            field: "ID_PROJETO",
            value: payload.ID_PROJETO,
          })
        );
        dispatch(
          updateRequisitionField({
            field: "projeto",
            value: {
              ...(requisition.projeto as any),
              ID: payload.ID_PROJETO,
              DESCRICAO: selectedProject?.name,
            },
          })
        );
      }

      dispatch(setRefreshRequisition(!refreshRequisition));
      dispatch(
        setFeedback({
          message: "Requisição atualizada com sucesso",
          type: "success",
        })
      );
      onClose();
    } catch (error) {
      dispatch(
        setFeedback({
          message: "Erro ao atualizar requisição",
          type: "error",
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle color="primary.main" fontWeight={600}>
        Editar Requisição {requisition.ID_REQUISICAO}
      </DialogTitle>
      <IconButton
        onClick={onClose}
        color="error"
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5 }}>
          <TextField
            label="Descrição"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            autoFocus={initialFocus !== "project"}
            fullWidth
            multiline
            minRows={2}
            inputProps={{ maxLength: 100 }}
            error={descriptionError}
            helperText={
              descriptionError
                ? "A descrição não pode ficar vazia"
                : `${description.length}/100`
            }
          />
          <Autocomplete
            options={projectOptions}
            value={selectedProject}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) =>
              Number(option.id) === Number(value.id)
            }
            onChange={(_, newValue) => setSelectedProject(newValue)}
            noOptionsText="Nenhum projeto encontrado"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Projeto"
                placeholder="Selecione o projeto"
                autoFocus={initialFocus === "project"}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={saving || descriptionError}
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequisitionHeaderEditDialog;

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import NotesService from "../../services/NotesService";
import { Note } from "../../models/Note";

interface CentroCusto {
  CODCUSTO: string;
  NOME: string;
  CODREDUZIDO: string;
  ATIVO: boolean;
}

interface StatusApontamento {
  CODSTATUSAPONT: string;
  DESCRICAO: string;
}

interface Lider {
  CODPESSOA: number;
  NOME: string;
}

interface ApontarDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCodaponts: number[];
  onSuccess: () => void;
  userName?: string;
  selectedNote?: Note;
  selectedNotes?: Note[];
}

const ApontarDialog: React.FC<ApontarDialogProps> = ({
  open,
  onClose,
  selectedCodaponts,
  onSuccess,
  userName,
  selectedNote,
  selectedNotes,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Options
  const [centroCustos, setCentroCustos] = useState<CentroCusto[]>([]);
  const [statusList, setStatusList] = useState<StatusApontamento[]>([]);
  const [lideres, setLideres] = useState<Lider[]>([]);

  // Form values
  const [selectedCentroCusto, setSelectedCentroCusto] = useState<CentroCusto | null>(null);
  const [selectedLider, setSelectedLider] = useState<Lider | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusApontamento | null>(null);

  // Checkboxes
  const [updateOnlyEmptyCentroCusto, setUpdateOnlyEmptyCentroCusto] = useState(false);
  const [centrosCustoAtivos, setCentrosCustoAtivos] = useState(true);
  const [updateOnlyEmptyLider, setUpdateOnlyEmptyLider] = useState(false);
  const [updateOnlyEmptyStatus, setUpdateOnlyEmptyStatus] = useState(false);

  useEffect(() => {
    if (open) {
      loadOptions();
    }
  }, [open, centrosCustoAtivos]);

  // Preencher campos com dados do apontamento selecionado (se houver apenas 1)
  useEffect(() => {
    if (open && selectedNote && selectedCodaponts.length === 1) {
      // Aguardar o carregamento das opções
      if (centroCustos.length === 0 || statusList.length === 0 || lideres.length === 0) {
        return;
      }

      // Preencher Centro de Custo se existir
      if (selectedNote.CODCCUSTO) {
        const centroCusto = centroCustos.find(
          (cc) => cc.CODCUSTO === selectedNote.CODCCUSTO
        );
        if (centroCusto) {
          setSelectedCentroCusto(centroCusto);
        }
      }

      // Preencher Líder se existir
      if (selectedNote.CODPESSOA_LIDER) {
        const lider = lideres.find(
          (l) => l.CODPESSOA === selectedNote.CODPESSOA_LIDER
        );
        if (lider) {
          setSelectedLider(lider);
        }
      }

      // Preencher Status se existir
      if (selectedNote.CODSTATUSAPONT) {
        const status = statusList.find(
          (s) => s.CODSTATUSAPONT === selectedNote.CODSTATUSAPONT
        );
        if (status) {
          setSelectedStatus(status);
        }
      }
    }
  }, [open, selectedNote, selectedCodaponts, centroCustos, statusList, lideres]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const [centroCustosData, statusData, lideresData] = await Promise.all([
        NotesService.getCentroCustos(centrosCustoAtivos),
        NotesService.getStatusApontamento(),
        NotesService.getLideres(),
      ]);
      setCentroCustos(centroCustosData);
      setStatusList(statusData);
      setLideres(lideresData);
    } catch (error: any) {
      dispatch(
        setFeedback({
          message: error.message || "Erro ao carregar opções",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCentroCusto && !selectedLider && !selectedStatus) {
      dispatch(
        setFeedback({
          message: "Selecione pelo menos uma opção para atualizar",
          type: "error",
        })
      );
      return;
    }

    setSaving(true);
    try {
      await NotesService.updateBatch(selectedCodaponts, {
        CODCCUSTO: selectedCentroCusto?.CODCUSTO,
        CODLIDER: selectedLider?.CODPESSOA,
        CODSTATUSAPONT: selectedStatus?.CODSTATUSAPONT,
        MODIFICADOPOR: userName || "SISTEMA",
        updateOnlyEmptyCentroCusto,
        updateOnlyEmptyLider,
        updateOnlyEmptyStatus,
        apontamentosInfo: (selectedNotes || []).map((note) => ({
          CODAPONT: note.CODAPONT,
          DATA: note.DATA,
          CHAPA: note.CHAPA,
        })),
      });

      dispatch(
        setFeedback({
          message: `${selectedCodaponts.length} apontamento(s) atualizado(s) com sucesso`,
          type: "success",
        })
      );

      handleClose();
      onSuccess();
    } catch (error: any) {
      dispatch(
        setFeedback({
          message: error.message || "Erro ao atualizar apontamentos",
          type: "error",
        })
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedCentroCusto(null);
    setSelectedLider(null);
    setSelectedStatus(null);
    setUpdateOnlyEmptyCentroCusto(false);
    setUpdateOnlyEmptyLider(false);
    setUpdateOnlyEmptyStatus(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Apontar Colaborador</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box sx={{ fontSize: 12, color: "gray", mb: 1 }}>
              {selectedCodaponts.length} apontamento(s) selecionado(s)
            </Box>

            {/* Centro de Custo */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  size="small"
                  label="Código"
                  value={selectedCentroCusto?.CODREDUZIDO || ""}
                  disabled
                  sx={{ width: 100 }}
                />
                <Autocomplete
                  size="small"
                  options={centroCustos}
                  getOptionLabel={(option) =>
                    `${option.CODCUSTO} - ${option.NOME}`
                  }
                  value={selectedCentroCusto}
                  onChange={(_, newValue) => setSelectedCentroCusto(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Centro de Custo" />
                  )}
                  sx={{ flex: 1 }}
                  isOptionEqualToValue={(option, value) =>
                    option.CODCUSTO === value.CODCUSTO
                  }
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={updateOnlyEmptyCentroCusto}
                      onChange={(e) =>
                        setUpdateOnlyEmptyCentroCusto(e.target.checked)
                      }
                    />
                  }
                  label="Atualizar somente centro de custo não preenchido"
                  sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={centrosCustoAtivos}
                      onChange={(e) => setCentrosCustoAtivos(e.target.checked)}
                    />
                  }
                  label="Centros de custo ativos"
                  sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }}
                />
              </Box>
            </Box>

            {/* Líder */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Autocomplete
                size="small"
                options={lideres}
                getOptionLabel={(option) => option.NOME}
                value={selectedLider}
                onChange={(_, newValue) => setSelectedLider(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Líder" />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.CODPESSOA === value.CODPESSOA
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={updateOnlyEmptyLider}
                    onChange={(e) => setUpdateOnlyEmptyLider(e.target.checked)}
                  />
                }
                label="Atualizar somente líder não preenchido"
                sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }}
              />
            </Box>

            {/* Status */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Autocomplete
                size="small"
                options={statusList}
                getOptionLabel={(option) => option.DESCRICAO}
                value={selectedStatus}
                onChange={(_, newValue) => setSelectedStatus(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Status" />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.CODSTATUSAPONT === value.CODSTATUSAPONT
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={updateOnlyEmptyStatus}
                    onChange={(e) => setUpdateOnlyEmptyStatus(e.target.checked)}
                  />
                }
                label="Atualizar somente status não preenchido"
                sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? <CircularProgress size={20} /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApontarDialog;

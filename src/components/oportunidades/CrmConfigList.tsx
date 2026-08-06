import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { AlinhamentoConfigService } from "../../services/oportunidades/AlinhamentoConfigService";
import { AlinhamentoConfigPessoa } from "../../models/oportunidades/AlinhamentoConfig";
import { AlinhamentoItem } from "../../models/oportunidades/OpportunityAlinhamento";
import BaseDeleteDialog from "../shared/BaseDeleteDialog";

const CrmConfigList = () => {
  const dispatch = useDispatch();
  const [pessoas, setPessoas] = useState<AlinhamentoConfigPessoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingItemFor, setAddingItemFor] = useState<AlinhamentoConfigPessoa | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [itemToDelete, setItemToDelete] = useState<{ pessoaConfig: AlinhamentoConfigPessoa; item: AlinhamentoItem } | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AlinhamentoConfigService.getConfig();
      setPessoas(data);
    } catch {
      dispatch(setFeedback({ message: "Erro ao carregar configuração de alinhamento", type: "error" }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleAddItem = async () => {
    if (!addingItemFor) return;
    const descricao = newItemText.trim();
    if (!descricao) return;
    const ordem = addingItemFor.itens.length > 0 ? Math.max(...addingItemFor.itens.map((i) => i.ordem)) + 1 : 1;
    try {
      const item = await AlinhamentoConfigService.createItem(addingItemFor.pessoa.CODPESSOA, { descricao, ordem });
      setPessoas((prev) =>
        prev.map((p) =>
          p.pessoa.CODPESSOA === addingItemFor.pessoa.CODPESSOA
            ? { ...p, id_alinhamento: item.id_alinhamento, itens: [...p.itens, item] }
            : p
        )
      );
      setNewItemText("");
      setAddingItemFor(null);
    } catch {
      dispatch(setFeedback({ message: "Erro ao adicionar item", type: "error" }));
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await AlinhamentoConfigService.deleteItem(itemToDelete.item.id_item);
      setPessoas((prev) =>
        prev.map((p) =>
          p.pessoa.CODPESSOA === itemToDelete.pessoaConfig.pessoa.CODPESSOA
            ? { ...p, itens: p.itens.filter((i) => i.id_item !== itemToDelete.item.id_item) }
            : p
        )
      );
    } catch {
      dispatch(setFeedback({ message: "Erro ao excluir item", type: "error" }));
    } finally {
      setItemToDelete(null);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const codPessoa = Number(source.droppableId);
    const pessoaConfig = pessoas.find((p) => p.pessoa.CODPESSOA === codPessoa);
    if (!pessoaConfig) return;

    const reordered = Array.from(pessoaConfig.itens);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    const comOrdem = reordered.map((item, index) => ({ ...item, ordem: index + 1 }));

    setPessoas((prev) =>
      prev.map((p) => (p.pessoa.CODPESSOA === codPessoa ? { ...p, itens: comOrdem } : p))
    );

    try {
      await AlinhamentoConfigService.reordenar(
        comOrdem.map((item) => ({ id_item: item.id_item, ordem: item.ordem }))
      );
    } catch {
      dispatch(setFeedback({ message: "Erro ao reordenar itens", type: "error" }));
      fetchConfig();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container direction={{ xs: "column", md: "row" }} gap={1} wrap="wrap">
          {pessoas.map((pessoaConfig) => (
            <Grid item xs={12} md={3} key={pessoaConfig.pessoa.CODPESSOA}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
                    {pessoaConfig.pessoa.NOME}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setAddingItemFor(pessoaConfig)}
                    sx={{
                      backgroundColor: "primary.main",
                      color: "white",
                      height: 24,
                      width: 24,
                      "&:hover": { backgroundColor: "primary.dark" },
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Droppable droppableId={String(pessoaConfig.pessoa.CODPESSOA)}>
                  {(provided) => (
                    <Box ref={provided.innerRef} {...provided.droppableProps}>
                      {pessoaConfig.itens.map((item, index) => (
                        <Draggable key={item.id_item} draggableId={String(item.id_item)} index={index}>
                          {(dragProvided) => (
                            <Stack
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              direction="row"
                              alignItems="center"
                              sx={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 1, mb: 0.5, pr: 1 }}
                            >
                              <Box {...dragProvided.dragHandleProps} sx={{ display: "flex", color: "text.secondary", pl: 0.5 }}>
                                <DragIndicatorIcon fontSize="small" />
                              </Box>
                              <Typography variant="body2" sx={{ flex: 1, py: 0.5 }}>
                                {item.descricao}
                              </Typography>
                              <IconButton size="small" onClick={() => setItemToDelete({ pessoaConfig, item })}>
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>

      <Dialog open={!!addingItemFor} onClose={() => setAddingItemFor(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Adicionar item {addingItemFor ? `- ${addingItemFor.pessoa.NOME}` : ""}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            size="small"
            placeholder="Descrição do item"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddItem();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddingItemFor(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddItem}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <BaseDeleteDialog
        open={!!itemToDelete}
        onConfirm={handleDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </Box>
  );
};

export default CrmConfigList;

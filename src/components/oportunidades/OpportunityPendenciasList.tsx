import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  LinearProgress,
  Checkbox,
  TextField,
  IconButton,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { OpportunityPendenciaService } from "../../services/oportunidades/OpportunityPendenciaService";
import { OpportunityPendencia } from "../../models/oportunidades/OpportunityPendencia";

interface OpportunityPendenciasListProps {
  CODOS: number;
}

const OpportunityPendenciasList = ({ CODOS }: OpportunityPendenciasListProps) => {
  const dispatch = useDispatch();
  const [itens, setItens] = useState<OpportunityPendencia[]>([]);
  const [novoItem, setNovoItem] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await OpportunityPendenciaService.getMany(CODOS);
      setItens(data);
    } catch {
      dispatch(setFeedback({ type: "error", message: "Erro ao carregar pendências" }));
    }
  }, [dispatch, CODOS]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const total = itens.length;
  const done = itens.filter((i) => i.concluido).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleToggle = async (item: OpportunityPendencia) => {
    try {
      const updated = await OpportunityPendenciaService.update(item.id_pendencia, {
        concluido: !item.concluido,
      });
      setItens((prev) => prev.map((i) => (i.id_pendencia === item.id_pendencia ? updated : i)));
    } catch {
      dispatch(setFeedback({ type: "error", message: "Erro ao atualizar item" }));
    }
  };

  const handleAdd = async () => {
    const descricao = novoItem.trim();
    if (!descricao) return;
    const ordem = itens.length > 0 ? Math.max(...itens.map((i) => i.ordem)) + 1 : 1;
    try {
      const item = await OpportunityPendenciaService.create({ CODOS, descricao, ordem });
      setItens((prev) => [...prev, item]);
      setNovoItem("");
      setAddingItem(false);
    } catch {
      dispatch(setFeedback({ type: "error", message: "Erro ao adicionar item" }));
    }
  };

  const handleDelete = async (item: OpportunityPendencia) => {
    try {
      await OpportunityPendenciaService.delete(item.id_pendencia);
      setItens((prev) => prev.filter((i) => i.id_pendencia !== item.id_pendencia));
    } catch {
      dispatch(setFeedback({ type: "error", message: "Erro ao excluir item" }));
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const reordered = Array.from(itens);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    const comOrdem = reordered.map((item, index) => ({ ...item, ordem: index + 1 }));

    setItens(comOrdem);

    try {
      await OpportunityPendenciaService.reordenar(
        comOrdem.map((item) => ({ id_pendencia: item.id_pendencia, ordem: item.ordem }))
      );
    } catch {
      dispatch(setFeedback({ type: "error", message: "Erro ao reordenar itens" }));
      fetchData();
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1, flexShrink: 0 }}>
        <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
          Pendências
        </Typography>
        <IconButton
          size="small"
          onClick={() => setAddingItem(true)}
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

      {total > 0 && (
        <Box sx={{ mb: 1.5, flexShrink: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {done}/{total} concluídos
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              {pct}%
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      <Box sx={{ flex: "1 1 0", minHeight: 0, overflowY: "auto" }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="pendencias">
            {(provided) => (
              <Box ref={provided.innerRef} {...provided.droppableProps}>
                {itens.map((item, index) => (
                  <Draggable key={item.id_pendencia} draggableId={String(item.id_pendencia)} index={index}>
                    {(dragProvided) => (
                      <Stack
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        direction="row"
                        alignItems="center"
                        sx={{ backgroundColor: "white", borderRadius: 1, mb: 0.5, pr: 1 }}
                      >
                        <Box {...dragProvided.dragHandleProps} sx={{ display: "flex", color: "text.secondary" }}>
                          <DragIndicatorIcon fontSize="small" />
                        </Box>
                        <Checkbox size="small" checked={item.concluido} onChange={() => handleToggle(item)} />
                        <Typography
                          variant="body2"
                          sx={{
                            flex: 1,
                            textDecoration: item.concluido ? "line-through" : "none",
                            color: item.concluido ? "text.secondary" : "text.primary",
                          }}
                        >
                          {item.descricao}
                        </Typography>
                        <IconButton size="small" onClick={() => handleDelete(item)}>
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
        </DragDropContext>
      </Box>

      <Dialog open={addingItem} onClose={() => setAddingItem(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Adicionar item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            size="small"
            placeholder="Descrição do item"
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddingItem(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAdd}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OpportunityPendenciasList;

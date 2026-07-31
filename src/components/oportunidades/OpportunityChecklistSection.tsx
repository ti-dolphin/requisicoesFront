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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { KanbanChecklistService } from "../../services/oportunidades/KanbanChecklistService";
import { KanbanChecklistItemService } from "../../services/oportunidades/KanbanChecklistItemService";
import { KanbanChecklist } from "../../models/oportunidades/KanbanChecklist";
import { KanbanChecklistItem } from "../../models/oportunidades/KanbanChecklistItem";
import BaseDeleteDialog from "../shared/BaseDeleteDialog";

interface OpportunityChecklistSectionProps {
  CODOS: number;
}

const OpportunityChecklistSection = ({ CODOS }: OpportunityChecklistSectionProps) => {
  const dispatch = useDispatch();
  const [checklists, setChecklists] = useState<KanbanChecklist[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [itemToDelete, setItemToDelete] = useState<{ checklist: KanbanChecklist; item: KanbanChecklistItem } | null>(null);

  const fetchChecklists = useCallback(async () => {
    if (!CODOS) return;
    setLoading(true);
    try {
      const data = await KanbanChecklistService.aplicarModelo(CODOS);
      setChecklists(data);
    } catch {
      dispatch(setFeedback({ message: "Erro ao carregar checklists", type: "error" }));
    } finally {
      setLoading(false);
    }
  }, [CODOS, dispatch]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const allItems = checklists.flatMap((c) => c.itens);
  const total = allItems.length;
  const done = allItems.filter((i) => i.concluido).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleToggleItem = async (checklist: KanbanChecklist, item: KanbanChecklistItem) => {
    try {
      const updated = await KanbanChecklistItemService.update(item.id_item, {
        concluido: !item.concluido,
      });
      setChecklists((prev) =>
        prev.map((c) =>
          c.id_checklist === checklist.id_checklist
            ? { ...c, itens: c.itens.map((i) => (i.id_item === item.id_item ? updated : i)) }
            : c
        )
      );
    } catch {
      dispatch(setFeedback({ message: "Erro ao atualizar item", type: "error" }));
    }
  };

  const handleAddItem = async () => {
    const checklist = checklists[0];
    if (!checklist) return;
    const descricao = newItemText.trim();
    if (!descricao) return;
    const ordem = checklist.itens.length > 0 ? Math.max(...checklist.itens.map((i) => i.ordem)) + 1 : 1;
    try {
      const item = await KanbanChecklistItemService.create({
        id_checklist: checklist.id_checklist,
        descricao,
        ordem,
      });
      setChecklists((prev) =>
        prev.map((c) =>
          c.id_checklist === checklist.id_checklist ? { ...c, itens: [...c.itens, item] } : c
        )
      );
      setNewItemText("");
      setAddingItem(false);
    } catch {
      dispatch(setFeedback({ message: "Erro ao adicionar item", type: "error" }));
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await KanbanChecklistItemService.delete(itemToDelete.item.id_item);
      setChecklists((prev) =>
        prev.map((c) =>
          c.id_checklist === itemToDelete.checklist.id_checklist
            ? { ...c, itens: c.itens.filter((i) => i.id_item !== itemToDelete.item.id_item) }
            : c
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
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) return;
    if (source.index === destination.index) return;

    const checklistId = Number(source.droppableId);
    const checklist = checklists.find((c) => c.id_checklist === checklistId);
    if (!checklist) return;

    const reordered = Array.from(checklist.itens);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    const comOrdem = reordered.map((item, index) => ({ ...item, ordem: index + 1 }));

    setChecklists((prev) =>
      prev.map((c) => (c.id_checklist === checklistId ? { ...c, itens: comOrdem } : c))
    );

    try {
      await KanbanChecklistItemService.reordenar(
        comOrdem.map((item) => ({ id_item: item.id_item, ordem: item.ordem }))
      );
    } catch {
      dispatch(setFeedback({ message: "Erro ao reordenar itens", type: "error" }));
      fetchChecklists();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
          Checklists
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
        <Box sx={{ mb: 2, flexShrink: 0 }}>
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

      <Box>
        <DragDropContext onDragEnd={handleDragEnd}>
          {checklists.map((checklist) => (
            <Box key={checklist.id_checklist} sx={{ mb: 2 }}>
              <Droppable droppableId={String(checklist.id_checklist)}>
                {(provided) => (
                  <Box ref={provided.innerRef} {...provided.droppableProps}>
                    {checklist.itens.map((item, index) => (
                      <Draggable key={item.id_item} draggableId={String(item.id_item)} index={index}>
                        {(dragProvided) => (
                          <Stack
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            direction="row"
                            alignItems="center"
                            sx={{
                              backgroundColor: "white",
                              borderRadius: 1,
                              mb: 0.5,
                              pr: 1,
                            }}
                          >
                            <Box {...dragProvided.dragHandleProps} sx={{ display: "flex", color: "text.secondary" }}>
                              <DragIndicatorIcon fontSize="small" />
                            </Box>
                            <Checkbox
                              size="small"
                              checked={item.concluido}
                              onChange={() => handleToggleItem(checklist, item)}
                            />
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
                            <IconButton
                              size="small"
                              onClick={() => setItemToDelete({ checklist, item })}
                            >
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
            </Box>
          ))}
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
          <Button onClick={() => setAddingItem(false)}>Cancelar</Button>
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

export default OpportunityChecklistSection;

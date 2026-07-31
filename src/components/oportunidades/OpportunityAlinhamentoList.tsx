import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Typography, LinearProgress, Checkbox, Stack } from "@mui/material";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { OpportunityAlinhamentoService } from "../../services/oportunidades/OpportunityAlinhamentoService";
import { AlinhamentoChecklist } from "../../models/oportunidades/OpportunityAlinhamento";

interface OpportunityAlinhamentoListProps {
  CODOS: number;
}

const OpportunityAlinhamentoList = ({ CODOS }: OpportunityAlinhamentoListProps) => {
  const dispatch = useDispatch();
  const [checklists, setChecklists] = useState<AlinhamentoChecklist[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const data = await OpportunityAlinhamentoService.getMany(CODOS);
      setChecklists(data);
    } catch {
      dispatch(setFeedback({ type: "error", message: "Erro ao carregar alinhamento" }));
    }
  }, [dispatch, CODOS]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allItems = checklists.flatMap((c) => c.itens);
  const total = allItems.length;
  const done = allItems.filter((i) => i.concluido).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleToggle = async (checklist: AlinhamentoChecklist, itemId: number, concluido: boolean) => {
    try {
      const updated = await OpportunityAlinhamentoService.updateItem(itemId, { concluido: !concluido });
      setChecklists((prev) =>
        prev.map((c) =>
          c.id_alinhamento === checklist.id_alinhamento
            ? { ...c, itens: c.itens.map((i) => (i.id_item === itemId ? updated : i)) }
            : c
        )
      );
    } catch {
      dispatch(setFeedback({ type: "error", message: "Erro ao atualizar item" }));
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) return;
    if (source.index === destination.index) return;

    const idAlinhamento = Number(source.droppableId);
    const checklist = checklists.find((c) => c.id_alinhamento === idAlinhamento);
    if (!checklist) return;

    const reordered = Array.from(checklist.itens);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    const comOrdem = reordered.map((item, index) => ({ ...item, ordem: index + 1 }));

    setChecklists((prev) =>
      prev.map((c) => (c.id_alinhamento === idAlinhamento ? { ...c, itens: comOrdem } : c))
    );

    try {
      await OpportunityAlinhamentoService.reordenar(
        comOrdem.map((item) => ({ id_item: item.id_item, ordem: item.ordem }))
      );
    } catch {
      dispatch(setFeedback({ type: "error", message: "Erro ao reordenar itens" }));
      fetchData();
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="subtitle1" color="primary.main" fontWeight="bold" sx={{ mb: 1 }}>
        Alinhamento
      </Typography>

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

      <Box>
        <DragDropContext onDragEnd={handleDragEnd}>
          {checklists.map((checklist) => (
            <Box key={checklist.id_alinhamento} sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 0.5 }}>
                {checklist.pessoa.NOME}
              </Typography>
              <Droppable droppableId={String(checklist.id_alinhamento)}>
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
                            sx={{ backgroundColor: "white", borderRadius: 1, mb: 0.5, pr: 1 }}
                          >
                            <Box {...dragProvided.dragHandleProps} sx={{ display: "flex", color: "text.secondary" }}>
                              <DragIndicatorIcon fontSize="small" />
                            </Box>
                            <Checkbox
                              size="small"
                              checked={item.concluido}
                              onChange={() => handleToggle(checklist, item.id_item, item.concluido)}
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
    </Box>
  );
};

export default OpportunityAlinhamentoList;

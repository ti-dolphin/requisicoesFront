import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Typography, LinearProgress, Checkbox, TextField, IconButton, Stack } from "@mui/material";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { OpportunityAlinhamentoService } from "../../services/oportunidades/OpportunityAlinhamentoService";
import { OpportunityAlinhamento } from "../../models/oportunidades/OpportunityAlinhamento";

interface OpportunityAlinhamentoListProps {
  CODOS: number;
}

const OpportunityAlinhamentoList = ({ CODOS }: OpportunityAlinhamentoListProps) => {
  const dispatch = useDispatch();
  const [itens, setItens] = useState<OpportunityAlinhamento[]>([]);
  const [novoItem, setNovoItem] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const data = await OpportunityAlinhamentoService.getMany(CODOS);
      setItens(data);
    } catch {
      dispatch(setFeedback({ type: "error", message: "Erro ao carregar alinhamento" }));
    }
  }, [dispatch, CODOS]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const total = itens.length;
  const done = itens.filter((i) => i.concluido).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleToggle = async (item: OpportunityAlinhamento) => {
    try {
      const updated = await OpportunityAlinhamentoService.update(item.id_alinhamento, {
        concluido: !item.concluido,
      });
      setItens((prev) => prev.map((i) => (i.id_alinhamento === item.id_alinhamento ? updated : i)));
    } catch {
      dispatch(setFeedback({ type: "error", message: "Erro ao atualizar item" }));
    }
  };

  const handleAdd = async () => {
    const descricao = novoItem.trim();
    if (!descricao) return;
    const ordem = itens.length > 0 ? Math.max(...itens.map((i) => i.ordem)) + 1 : 1;
    try {
      const item = await OpportunityAlinhamentoService.create({ CODOS, descricao, ordem });
      setItens((prev) => [...prev, item]);
      setNovoItem("");
    } catch {
      dispatch(setFeedback({ type: "error", message: "Erro ao adicionar item" }));
    }
  };

  const handleDelete = async (item: OpportunityAlinhamento) => {
    try {
      await OpportunityAlinhamentoService.delete(item.id_alinhamento);
      setItens((prev) => prev.filter((i) => i.id_alinhamento !== item.id_alinhamento));
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
      await OpportunityAlinhamentoService.reordenar(
        comOrdem.map((item) => ({ id_alinhamento: item.id_alinhamento, ordem: item.ordem }))
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
        <Box sx={{ mb: 1.5 }}>
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="alinhamento">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {itens.map((item, index) => (
                <Draggable key={item.id_alinhamento} draggableId={String(item.id_alinhamento)} index={index}>
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

      <TextField
        fullWidth
        placeholder="Adicionar item..."
        size="small"
        value={novoItem}
        onChange={(e) => setNovoItem(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        }}
        sx={{ mt: 1, "& .MuiInputBase-root": { fontSize: 13 } }}
      />
    </Box>
  );
};

export default OpportunityAlinhamentoList;

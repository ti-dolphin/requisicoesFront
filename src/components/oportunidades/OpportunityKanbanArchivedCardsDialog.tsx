import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Stack,
  Box,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import { OpportunityKanbanArchivedCardsDialogProps } from "../../models/oportunidades/Opportunity"
import { ArchivedOpportunity, OpportunityKanbanColumn } from "../../models/oportunidades/OpportunityKanbanColumn"
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import OpportunityKanbanService from "../../services/oportunidades/OpportunityKanbanService";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import OpportunityCard from "./OpportunityCard"
import BaseDeleteDialog from "../shared/BaseDeleteDialog"
import { DELETED_COLUMN_ID } from "../../utils/kanbanFlowRules"

const OpportunityKanbanArchivedCardsDialog = ({ open, board, onClose, onUnarchive }: OpportunityKanbanArchivedCardsDialogProps) => {
  const [cards, setCards] = useState<ArchivedOpportunity[]>([]);
  const [columns, setColumns] = useState<OpportunityKanbanColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [unarchivingCard, setUnarchivingCard] = useState<ArchivedOpportunity | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<number | "">("");
  const [cardToDelete, setCardToDelete] = useState<ArchivedOpportunity | null>(null);
  const dispatch = useDispatch()

  useEffect(() => {
    if (!open) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [cardsData, columnsData] = await Promise.all([
          OpportunityKanbanService.getArchivedCards(),
          OpportunityKanbanService.getColumns(board),
        ])
        setCards(cardsData)
        setColumns(columnsData)
      } catch (error) {
        dispatch(setFeedback({ message: "Erro ao carregar cards arquivados.", type: "error" }))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [open, board])

  const handleConfirmUnarchive = async () => {
    if (!unarchivingCard || targetColumnId === "") return
    try {
      await OpportunityKanbanService.unarchiveCard(unarchivingCard.CODOS, board, Number(targetColumnId))
      setUnarchivingCard(null)
      setTargetColumnId("")
      dispatch(setFeedback({ message: "Oportunidade desarquivada com sucesso", type: "success" }))
      onUnarchive()
    } catch (error: any) {
      dispatch(setFeedback({ message: error?.response?.data?.error || "Erro ao desarquivar oportunidade", type: "error" }))
    }
  }

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return
    try {
      await OpportunityKanbanService.updateCardColumn(cardToDelete.CODOS, board, DELETED_COLUMN_ID)
      setCards((prev) => prev.filter((card) => card.CODOS !== cardToDelete.CODOS))
      setCardToDelete(null)
      dispatch(setFeedback({ message: "Oportunidade excluída com sucesso", type: "success" }))
    } catch (error: any) {
      setCardToDelete(null)
      dispatch(setFeedback({ message: error?.response?.data?.error || "Erro ao excluir oportunidade", type: "error" }))
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ pr: 6 }}>
          <Typography
            component="div"
            variant="subtitle1"
            color="primary.main"
            fontWeight="bold"
          >
            Cards Arquivados
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : cards.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              Nenhuma oportunidade arquivada.
            </Typography>
          ) : (
            <Stack gap={1}>
              {cards.map((card) => (
                <OpportunityCard
                  key={card.CODOS}
                  row={card}
                  styles={{ width: "100%", minHeight: "auto", maxHeight: "none", margin: "0 0 8px 0" }}
                  actions={
                    <Stack direction="row" gap={1} sx={{ width: "100%", px: 1, pb: 1 }}>
                      <Button size="small" variant="outlined" onClick={() => setUnarchivingCard(card)}>
                        Desarquivar
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => setCardToDelete(card)}>
                        Excluir
                      </Button>
                    </Stack>
                  }
                />
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!unarchivingCard} onClose={() => setUnarchivingCard(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Desarquivar oportunidade</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Coluna</InputLabel>
            <Select
              label="Coluna"
              value={targetColumnId}
              onChange={(e) => setTargetColumnId(Number(e.target.value))}
            >
              {columns.map((column) => (
                <MenuItem key={column.id} value={column.id}>{column.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" gap={1} justifyContent="flex-end">
            <Button onClick={() => setUnarchivingCard(null)}>Cancelar</Button>
            <Button variant="contained" disabled={targetColumnId === ""} onClick={handleConfirmUnarchive}>
              Confirmar
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <BaseDeleteDialog
        open={!!cardToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCardToDelete(null)}
        message="Tem certeza de que deseja excluir essa oportunidade?"
      />
    </>
  )
}
export default OpportunityKanbanArchivedCardsDialog

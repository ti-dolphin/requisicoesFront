import { Box, Chip, CircularProgress, IconButton, TextField, Tooltip, Typography, Button, } from "@mui/material"
import Grid from '@mui/material/Grid';
import AddIcon from "@mui/icons-material/Add"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import { useCallback, useEffect, useState } from "react"
import { ControlledBoard, Column as KanbanColumn, KanbanBoard, OnDragEndNotification, moveCard } from '@caldwell619/react-kanban'
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import { setFeedback } from "../../redux/slices/feedBackSlice"
import OpportunityService from "../../services/oportunidades/OpportunityService"
import OpportunityKanbanService from "../../services/oportunidades/OpportunityKanbanService"
import { Opportunity } from "../../models/oportunidades/Opportunity"
import { OpportunityKanbanCardData } from "../../models/oportunidades/OpportunityKanbanColumn"
import OpportunityCard from "./OpportunityCard"
import BaseDeleteDialog from "../shared/BaseDeleteDialog"
import OpportunityKanbanCardDialog from "./OpportunityKanbanCardDialog"
import OpportunityKanbanArchivedCardsDialog from "./OpportunityKanbanArchivedCardsDialog";
import { kanbanGlobalStyles, KANBAN_COLUMN_WIDTH } from "../../styles/oportunidades/kanbanGlobalStyles"
import { KanbanBoardName, isManualMoveAllowed } from "../../utils/kanbanFlowRules"
import { useKanbanEdgeAutoScroll } from "../../hooks/oportunidades/useKanbanEdgeAutoScroll"

interface OpportunityKanbanComponentProps {
  board: KanbanBoardName
}

const formatDateInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const getDefaultDateFrom = () => `${new Date().getFullYear()}-01-01`
const getDefaultDateTo = () => formatDateInput(new Date())

const OpportunityKanbanComponent = ({ board }: OpportunityKanbanComponentProps) => {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user.user)
  const columnField = board === "Comercial" ? "kanban_column_id" : "kanban_column_id_orcamento"
  const [kanbanBoardData, setKanbanBoardData] = useState<KanbanBoard<OpportunityKanbanCardData>>({ columns: [] })
  const [loading, setLoading] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom())
  const [dateTo, setDateTo] = useState(getDefaultDateTo())
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [columnToDelete, setColumnToDelete] = useState<KanbanColumn<OpportunityKanbanCardData> | null>(null)
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null)
  const [editingColumnName, setEditingColumnName] = useState("")
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false)

  useKanbanEdgeAutoScroll(".react-kanban-board")

  const fetchBoard = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [columns, { opps }] = await Promise.all([
        OpportunityKanbanService.getColumns(board),
        OpportunityService.getMany({
          user,
          searchTerm: "",
          filters: {
            DATASOLICITACAO_FROM: dateFrom ? `${dateFrom}T00:00:00.000Z` : null,
            DATASOLICITACAO_TO: dateTo ? `${dateTo}T23:59:59.999Z` : null,
          },
          finalizados: false,
        }),
      ])
      setKanbanBoardData({
        columns: columns.map((column) => ({
          id: column.id,
          title: column.name,
          cards: opps
            .filter((opportunity: Opportunity) => opportunity[columnField] === column.id)
            .map((opportunity: Opportunity) => ({
              id: opportunity.CODOS,
              opportunity,
            })),
        })),
      })
    } catch (error) {
      dispatch(setFeedback({ message: "Erro ao carregar o kanban de oportunidades", type: "error" }))
    } finally {
      setLoading(false)
    }
  }, [user, dispatch, dateFrom, dateTo, board, columnField])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  const handleCardDragEnd: OnDragEndNotification<OpportunityKanbanCardData> = async (card, source, destination) => {
    if (!source || !destination || destination.toColumnId === undefined) return
    const targetColumnId = Number(destination.toColumnId)
    if (destination.toColumnId !== source.fromColumnId) {
      const moveCheck = isManualMoveAllowed(targetColumnId, card.opportunity)
      if (!moveCheck.allowed) {
        dispatch(setFeedback({ message: moveCheck.message, type: "error" }))
        return
      }
    }
    setKanbanBoardData((previousBoard) => moveCard(previousBoard, source, destination))
    if (destination.toColumnId !== source.fromColumnId) {
      try {
        await OpportunityKanbanService.updateCardColumn(card.id, board, targetColumnId)
      } catch (error: any) {
        dispatch(setFeedback({ message: error?.response?.data?.error || "Erro ao mover oportunidade", type: "error" }))
        fetchBoard()
      }
    }
  }

  const handleCreateColumn = async () => {
    const trimmedName = newColumnName.trim()
    if (!trimmedName) return
    try {
      await OpportunityKanbanService.createColumn(trimmedName, board)
      setNewColumnName("")
      setIsAddingColumn(false)
      fetchBoard()
    } catch (error: any) {
      dispatch(setFeedback({ message: error?.response?.data?.error || "Erro ao criar coluna", type: "error" }))
    }
  }

  const handleCancelCreateColumn = () => {
    setNewColumnName("")
    setIsAddingColumn(false)
  }

  const handleStartEditColumn = (column: KanbanColumn<OpportunityKanbanCardData>) => {
    setEditingColumnId(Number(column.id))
    setEditingColumnName(column.title)
  }

  const handleCancelEditColumn = () => {
    setEditingColumnId(null)
    setEditingColumnName("")
  }

  const handleConfirmRenameColumn = async () => {
    const trimmedName = editingColumnName.trim()
    if (!trimmedName || editingColumnId === null) {
      handleCancelEditColumn()
      return
    }
    try {
      await OpportunityKanbanService.renameColumn(editingColumnId, trimmedName)
      handleCancelEditColumn()
      fetchBoard()
    } catch (error: any) {
      dispatch(setFeedback({ message: error?.response?.data?.error || "Erro ao renomear coluna", type: "error" }))
    }
  }

  const handleConfirmDeleteColumn = async () => {
    if (!columnToDelete) return
    try {
      await OpportunityKanbanService.deleteColumn(Number(columnToDelete.id))
      setColumnToDelete(null)
      fetchBoard()
    } catch (error: any) {
      setColumnToDelete(null)
      dispatch(setFeedback({ message: error?.response?.data?.error || "Erro ao remover coluna", type: "error" }))
    }
  }

  return (
    <Box sx={{ flex: '1 1 0', minHeight: 0, width: '100%', backgroundColor: '#e7eaf6', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {kanbanGlobalStyles}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '10px 16px',
          backgroundColor: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <Grid container >
          <Grid xs={11}>
            <TextField
              size="small"
              label="De"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 160, '& .MuiOutlinedInput-root': { height: 32, fontSize: 12 }, '& .MuiInputLabel-root': { fontSize: 12 } }}
            />
            <TextField
              size="small"
              label="Até"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 160, '& .MuiOutlinedInput-root': { height: 32, fontSize: 12 }, '& .MuiInputLabel-root': { fontSize: 12 } }}
            />
          </Grid>
          {board === "Comercial" && (
            <Grid xs={1}>
              <Button
                variant="outlined"
                onClick={() => setOpenArchiveDialog(true)}
              >
                Arquivados
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>
      <Box sx={{ flex: '1 1 0', minHeight: 0 }}>
      {loading ? (
        <Box sx={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <ControlledBoard
          disableColumnDrag
          allowAddColumn
          allowAddCard={false}
          allowRemoveCard={false}
          onCardDragEnd={handleCardDragEnd}
          renderColumnHeader={(column) => (
            <Box
              sx={{
                flexShrink: 0,
                backgroundColor: '#ffffff',
                borderRadius: '8px 8px 0 0',
                padding: '8px 8px 8px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              {editingColumnId === Number(column.id) ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
                  <TextField
                    size="small"
                    autoFocus
                    value={editingColumnName}
                    onChange={(e) => setEditingColumnName(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        e.stopPropagation()
                        handleConfirmRenameColumn()
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault()
                        e.stopPropagation()
                        handleCancelEditColumn()
                      }
                    }}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { height: 30, fontSize: 13 } }}
                  />
                  <IconButton size="small" onClick={handleConfirmRenameColumn} sx={{ color: 'primary.main' }}>
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={handleCancelEditColumn}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  onClick={() => handleStartEditColumn(column)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', overflow: 'hidden' }}
                >
                  <Typography variant="subtitle2" noWrap sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {column.title}
                  </Typography>
                  <EditOutlinedIcon sx={{ fontSize: 14, color: 'primary.main', opacity: 0.4, flexShrink: 0 }} />
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <Chip
                  size="small"
                  label={column.cards.length}
                  sx={{ backgroundColor: 'primary.light', color: 'primary.main', fontWeight: 700 }}
                />
                <Tooltip title={column.cards.length > 0 ? "Mova as oportunidades pra outra coluna antes de excluir" : "Remover coluna"}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={column.cards.length > 0}
                      onClick={() => setColumnToDelete(column)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          )}
          renderColumnAdder={() => (
            <Box
              sx={{
                width: KANBAN_COLUMN_WIDTH,
                minWidth: KANBAN_COLUMN_WIDTH,
                maxWidth: KANBAN_COLUMN_WIDTH,
                height: 'fit-content',
                backgroundColor: 'rgba(255,255,255,0.6)',
                borderRadius: 3,
                boxSizing: 'border-box',
                padding: 1.5,
              }}
            >
              {isAddingColumn ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TextField
                    size="small"
                    autoFocus
                    placeholder="Nome da coluna"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        e.stopPropagation()
                        handleCreateColumn()
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault()
                        e.stopPropagation()
                        handleCancelCreateColumn()
                      }
                    }}
                    sx={{ backgroundColor: 'white', borderRadius: 1, flex: 1, '& .MuiOutlinedInput-root': { height: 36, fontSize: 13 } }}
                  />
                  <IconButton size="small" onClick={handleCreateColumn} sx={{ color: 'primary.main' }}>
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={handleCancelCreateColumn}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  onClick={() => setIsAddingColumn(true)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
                  }}
                >
                  <AddIcon fontSize="small" /> Adicionar coluna
                </Box>
              )}
            </Box>
          )}
          renderCard={(card) => (
            <OpportunityCard
              row={card.opportunity}
              onClick={() => setSelectedOpportunity(card.opportunity)}
              styles={{ width: KANBAN_COLUMN_WIDTH - 24, minHeight: 'auto', maxHeight: 'none', margin: '0 12px 12px 12px' }}
            />
          )}
        >
          {kanbanBoardData}
        </ControlledBoard>
      )}
      </Box>
      <BaseDeleteDialog
        open={!!columnToDelete}
        onConfirm={handleConfirmDeleteColumn}
        onCancel={() => setColumnToDelete(null)}
        title="Remover coluna"
        message={`Tem certeza de que deseja remover a coluna "${columnToDelete?.title}"?`}
      />
      <OpportunityKanbanCardDialog
        open={!!selectedOpportunity}
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
      {board === "Comercial" && (
        <OpportunityKanbanArchivedCardsDialog
          open={openArchiveDialog}
          onClose={() => setOpenArchiveDialog(false)}
        />
      )}
    </Box>
  )
}

export default OpportunityKanbanComponent

import { Dialog, DialogTitle, IconButton, Typography } from "@mui/material"
import { OpportunityKanbanArchivedCardsDialogProps } from "../../models/oportunidades/Opportunity"
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import OpportunityService from "../../services/oportunidades/OpportunityService";
import OpportunityKanbanService from "../../services/oportunidades/OpportunityKanbanService";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";

const OpportunityKanbanArchivedCardsDialog = ({ open, onClose }: OpportunityKanbanArchivedCardsDialogProps) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()


  useEffect(() => {
    if (!open) return

    const fetchCards = async () => {
      setLoading(true)

      try {
        const data = await OpportunityKanbanService.getArchivedCards()
        setCards(data)
        console.log(data)
      } catch (error) {
        dispatch(setFeedback({message: "Erro ao carregar cards arquivados.", type: "error"}))
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [open])



  return (
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
    </Dialog>
  )
}
export default OpportunityKanbanArchivedCardsDialog
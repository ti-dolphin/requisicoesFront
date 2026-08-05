import { Dialog, DialogTitle, IconButton, Typography } from "@mui/material"
import { OpportunityKanbanArchivedCardsDialogProps } from "../../models/oportunidades/Opportunity"
import CloseIcon from "@mui/icons-material/Close";

const OpportunityKanbanArchivedCardsDialog = ({ open, onClose }: OpportunityKanbanArchivedCardsDialogProps) => {
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
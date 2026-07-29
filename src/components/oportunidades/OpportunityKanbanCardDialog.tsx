import { Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography, Divider, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Opportunity } from "../../models/oportunidades/Opportunity";
import OpportunityFollowerList from "./OpportunityFollowerList";
import OpportunityChecklistSection from "./OpportunityChecklistSection";
import OpportunityAlinhamentoList from "./OpportunityAlinhamentoList";
import OpportunityPendenciasList from "./OpportunityPendenciasList";

interface OpportunityKanbanCardDialogProps {
  open: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
}

const OpportunityKanbanCardDialog = ({ open, opportunity, onClose }: OpportunityKanbanCardDialogProps) => {
  if (!opportunity) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        <Typography component="div" variant="subtitle1" color="primary.main" fontWeight="bold">
          {`${opportunity.projeto?.ID}.${opportunity.adicional?.NUMERO} - ${opportunity.cliente?.NOMEFANTASIA}`}
        </Typography>
        <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack gap={3}>
          <OpportunityFollowerList CODOS={opportunity.CODOS} />

          <Divider />

          <Box>
            <OpportunityChecklistSection CODOS={opportunity.CODOS} />
          </Box>

          <Divider />

          <OpportunityAlinhamentoList CODOS={opportunity.CODOS} />

          <Divider />

          <OpportunityPendenciasList CODOS={opportunity.CODOS} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityKanbanCardDialog;

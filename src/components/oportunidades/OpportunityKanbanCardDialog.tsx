import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography, Divider, Box, Tooltip, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { OpportunityKanbanCardDialogProps } from "../../models/oportunidades/Opportunity";
import OpportunityService from "../../services/oportunidades/OpportunityService";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { formatDateStringtoISOstring, getDateInputValue } from "../../utils";
import OpportunityFollowerList from "./OpportunityFollowerList";
import OpportunityChecklistSection from "./OpportunityChecklistSection";
import OpportunityAlinhamentoList from "./OpportunityAlinhamentoList";
import OpportunityPendenciasList from "./OpportunityPendenciasList";

const OpportunityKanbanCardDialog = ({ open, opportunity, onClose }: OpportunityKanbanCardDialogProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [dataPlanejada, setDataPlanejada] = useState(getDateInputValue(opportunity?.data_planejada));

  useEffect(() => {
    setDataPlanejada(getDateInputValue(opportunity?.data_planejada));
  }, [opportunity?.CODOS, opportunity?.data_planejada]);

  if (!opportunity) return null;

  const handleChangeDataPlanejada = async (value: string) => {
    setDataPlanejada(value);
    try {
      await OpportunityService.update(opportunity.CODOS, {
        data_planejada: value ? formatDateStringtoISOstring(value) : null,
      });
    } catch {
      dispatch(setFeedback({ message: "Erro ao salvar data planejada", type: "error" }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pr: 10 }}>
        <Typography component="div" variant="subtitle1" color="primary.main" fontWeight="bold">
          {`${opportunity.projeto?.ID}.${opportunity.adicional?.NUMERO} - ${opportunity.cliente?.NOMEFANTASIA}`}
        </Typography>
        <Tooltip title="Ver detalhe da oportunidade">
          <IconButton
            onClick={() => navigate(`/oportunidades/${opportunity.CODOS}`)}
            sx={{ position: "absolute", top: 8, right: 48 }}
          >
            <OpenInNewIcon />
          </IconButton>
        </Tooltip>
        <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack gap={3}>
          <TextField
            label="Data planejada"
            type="date"
            size="small"
            value={dataPlanejada}
            onChange={(e) => handleChangeDataPlanejada(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 200 }}
          />

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

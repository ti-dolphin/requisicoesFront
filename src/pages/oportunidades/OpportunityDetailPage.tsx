import {
  Box,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import OpportunityDetailedForm from "../../components/oportunidades/OpportunityDetailedForm";
import OpportunityCommentList from "../../components/oportunidades/OpportunityCommentList";
import OpportunityAttachmentList from "../../components/oportunidades/OpportunityAttachmentList";
import UpperNavigation from "../../components/shared/UpperNavigation";
import { useNavigate, useParams } from "react-router-dom";
import OpportunityFollowerList from "../../components/oportunidades/OpportunityFollowerList";
import { useEffect, useState } from "react";
import OpportunityService from "../../services/oportunidades/OpportunityService";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { Opportunity } from "../../models/oportunidades/Opportunity";

const OpportunityDetailPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { CODOS } = useParams();

  const [opportunity, setOpportunity] = useState<Opportunity | undefined>(undefined);
  const [observation, setObservation] = useState<string>("");

  const handleBack = () => {
    navigate("/oportunidades");
  };
  
  const saveObservation = async () => {
    if (!opportunity) return;
    try {
      opportunity.observacoes = observation;
      const updatedOpportunity : Opportunity = await OpportunityService.update(Number(CODOS), {
        observacoes: observation
      });
      setOpportunity(updatedOpportunity);
      dispatch(
        setFeedback({
          message: "Observação salva com sucesso",
          type: "success",
      }));
    } catch (e) {
      dispatch(
        setFeedback({
          message: "Erro ao salvar observa o",
          type: "error",
        })
      );
  };
}

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!CODOS) return;
      try {
        const opportunity : Opportunity = await OpportunityService.getById(Number(CODOS));
        setOpportunity(opportunity);
        setObservation(opportunity.observacoes);
      } catch (e) {
        dispatch(
          setFeedback({
            message: "Erro ao buscar oportunidade",
            type: "error",
          })
        );
      }
    };
    fetchOpportunity();
  }, [CODOS, dispatch]);

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1 },
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <UpperNavigation handleBack={handleBack}>
        <Stack direction="row" alignItems="center">
          <Typography
            variant="subtitle1"
            color="primary.main"
            fontWeight="bold"
          >
            {`${opportunity?.projeto.ID}.${opportunity?.adicional.NUMERO} - ${opportunity?.cliente.NOMEFANTASIA}`}
          </Typography>
        </Stack>
      </UpperNavigation>
      <Grid container direction="row" gap={1} wrap="wrap">
        {/* Seção de Campos de Cadastro */}
        <OpportunityDetailedForm />
        <Grid
          container
          direction={{ xs: "column", md: "row" }}
          gap={1}
          wrap="nowrap"
        >
          {/* Seção de Comentários */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                gap: 1,
                justifyContent: "flex-start",
              }}
            >
              <Typography
                variant="subtitle1"
                color="primary.main"
                fontWeight="bold"
                sx={{ mb: 1 }}
              >
                Escopo
              </Typography>
              <TextField
                label="Observação"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setObservation(e.target.value)
                }
                onBlur={saveObservation}
                value={observation}
                multiline
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <OpportunityCommentList />
              {/* Lista de comentários */}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, height: "100%" }}>
              {/* Lista de seguidores */}
              <Box sx={{ minHeight: 100 }}>
                <OpportunityFollowerList CODOS={Number(CODOS)} />
              </Box>
            </Paper>
          </Grid>

          {/* Seção de Anexos */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, height: "100%" }}>
              <Box sx={{ minHeight: 100 }}>
                <OpportunityAttachmentList />
              </Box>
            </Paper>
          </Grid>

          {/* Seção de Seguidores */}
        </Grid>
      </Grid>
    </Box>
  )
};

export default OpportunityDetailPage;

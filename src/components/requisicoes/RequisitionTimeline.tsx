import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import RequisitionStatusService from "../../services/requisicoes/RequisitionStatusService";
import { RequisitionStatusAlteration } from "../../models/requisicoes/RequisitionStatusAlteration";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { getDateStringFromISOstring } from "../../utils";

interface RequisitionTimelineProps {
  fullScreen?: boolean;
}

const RequisitionTimeline = ({ fullScreen = false }: RequisitionTimelineProps) => {

  const dispatch  = useDispatch();
  const requisition = useSelector(
    (state: RootState) => state.requisition.requisition
  );
  const [alterations, setAlterations] = useState<RequisitionStatusAlteration[]>(
    []
  );

  const fetchData = async () => {
    try {
      const data =
        await RequisitionStatusService.getStatusAlterationsByRequisitionId(
          requisition.ID_REQUISICAO
        );
      setAlterations(data);
    } catch (error) {
      dispatch(setFeedback({ 
        type: 'error', 
        message: 'Erro ao buscar histórico de status'
      }));
    }
  };

  useEffect(() => {
    if (requisition?.ID_REQUISICAO) {
      fetchData();
    }
  }, [requisition?.ID_REQUISICAO, requisition?.id_status_requisicao, requisition?.comprador?.CODPESSOA]);

  const getBuyerChangeData = (alteration: RequisitionStatusAlteration) => {
    if (alteration.transicao?.nome_transicao === "alterou comprador") {
      return {
        from: alteration.pessoa_origem?.NOME || "Não atribuído",
        to: alteration.pessoa_destino?.NOME || "Não atribuído",
      };
    }

    if (!alteration.justificativa) {
      return null;
    }

    try {
      const metadata = JSON.parse(alteration.justificativa);
      if (metadata?.tipo !== "troca_comprador") {
        return null;
      }

      return {
        from: metadata.comprador_anterior?.nome || "Não atribuído",
        to: metadata.comprador_novo?.nome || "Não atribuído",
      };
    } catch (_error) {
      return null;
    }
  };

  return (
    <Box sx={{ 
      maxWidth: fullScreen ? 'none' : 600, 
      maxHeight: fullScreen ? 'none' : 250, 
      overflow: 'auto', 
      mx: "auto", 
      my: 2 
    }}>
      <List sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {alterations.length > 0 ? (
          alterations.map(
            (alteration: RequisitionStatusAlteration, index: number) => {
              const buyerChangeData = getBuyerChangeData(alteration);

              return (
              <React.Fragment key={alteration.id_alteracao}>
                <ListItem
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    pl: 6,
                    height: 60,
                    minHeight: 60,
                    py: 1,
                  }}
                >
                  {/* Ponto da timeline */}
                  <ListItemIcon
                    sx={{
                      position: "absolute",
                      left: 8,
                      top: 8,
                    }}
                  >
                    <CircleIcon
                      sx={{
                        fontSize: 12,
                        color: index === 0 ? "primary.main" : "grey.500",
                      }}
                    />
                  </ListItemIcon>
                  {/* Linha conectora (exceto para o último item) */}
                  {index < alterations.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 11,
                        top: 20,
                        bottom: -20,
                        width: 2,
                        bgcolor: "grey.300",
                      }}
                    />
                  )}
                  <ListItemText
                    primary={
                      <Typography fontSize="small">
                        {buyerChangeData
                          ? `Troca de comprador ${buyerChangeData.from} -> ${buyerChangeData.to}`
                          : `${alteration.pessoa_alterado_por?.NOME} ${alteration.transicao?.nome_transicao}`}
                        {!buyerChangeData && alteration.pessoa_destino && (
                          <Typography component="span" fontSize="small" color="text.secondary">
                            {` → ${alteration.pessoa_destino.NOME}`}
                          </Typography>
                        )}
                        {!buyerChangeData && !alteration.pessoa_destino && alteration.perfil_destino && (
                          <Typography component="span" fontSize="small" color="text.secondary">
                            {` → ${alteration.perfil_destino}`}
                          </Typography>
                        )}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography fontSize="small">
                          {getDateStringFromISOstring(alteration.data_alteracao)}
                        </Typography>
                        {!buyerChangeData && alteration.justificativa && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            Justificativa: {alteration.justificativa}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < alterations.length - 1 && <Divider />}
              </React.Fragment>
            )}
          )
        ) : (
          <ListItem>
            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  Nenhuma alteração de status encontrada.
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default RequisitionTimeline;

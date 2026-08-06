import { useCallback, useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import OrdemCompraService from "../../services/ordensCompra/OrdemCompraService";
import { OrdemCompraRequisicao } from "../../models/OrdemCompra";

interface OrdemCompraRequisitionsDialogProps {
  open: boolean;
  onClose: () => void;
  numeroMovimento: string | number | null;
}

const OrdemCompraRequisitionsDialog = ({
  open,
  onClose,
  numeroMovimento,
}: OrdemCompraRequisitionsDialogProps) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [requisitions, setRequisitions] = useState<OrdemCompraRequisicao[]>([]);

  const fetchRequisitions = useCallback(async () => {
    if (numeroMovimento === null || numeroMovimento === undefined) {
      return;
    }

    setLoading(true);
    try {
      const data = await OrdemCompraService.getRequisitionsByOc(numeroMovimento);
      setRequisitions(data || []);
    } catch (error) {
      dispatch(
        setFeedback({
          message: "Erro ao buscar requisições da ordem de compra",
          type: "error",
        })
      );
      setRequisitions([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch, numeroMovimento]);

  useEffect(() => {
    if (open) {
      fetchRequisitions();
    }
  }, [open, fetchRequisitions]);

  const openRequisition = (idRequisicao: number) => {
    window.open(`/requisicoes/${idRequisicao}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle color="primary.main" fontWeight={600}>
        Requisições da OC {numeroMovimento ?? ""}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={26} />
          </Stack>
        ) : requisitions.length === 0 ? (
          <Typography color="text.secondary">
            Nenhuma requisição encontrada com esse número de OC no ano atual.
          </Typography>
        ) : (
          <List sx={{ py: 0 }}>
            {requisitions.map((requisition) => (
              <ListItem
                key={`${requisition.id_requisicao}-${requisition.oc}`}
                disablePadding
                divider
              >
                <ListItemButton
                  onClick={() => openRequisition(requisition.id_requisicao)}
                >
                  <ListItemText
                    primary={`REQ ${requisition.id_requisicao} | ${
                      requisition.descricao || "Sem descrição"
                    }`}
                    secondary={`Projeto: ${
                      requisition.projeto || "-"
                    }`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrdemCompraRequisitionsDialog;

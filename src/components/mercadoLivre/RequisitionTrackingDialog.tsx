import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import MercadoLivreService from "../../services/mercadoLivre/MercadoLivreService";
import { MercadoLivreOrder } from "../../models/mercadoLivre/MercadoLivreOrder";
import { RequisitionTrackingDialogProps } from "../../models/mercadoLivre/RequisitionTrackingDialog";
import TrackingList from "./TrackingList";

const RequisitionTrackingDialog = ({
  open,
  onClose,
  codigos,
  itensComPalavraChave = [],
  palavrasChavePorCodigo = {},
}: RequisitionTrackingDialogProps) => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState<MercadoLivreOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [notConnected, setNotConnected] = useState(false);

  const codigosKey = codigos.join(",");

  const loadTracking = useCallback(async () => {
    if (!codigosKey) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setNotConnected(false);
      const data = await MercadoLivreService.getTrackingByCodes(
        codigosKey.split(",")
      );
      setOrders(data.results);
    } catch (err: any) {
      const message = err?.response?.data?.error || "Erro ao buscar rastreio";
      if (String(message).includes("não conectada")) {
        setNotConnected(true);
      } else {
        dispatch(setFeedback({ message, type: "error" }));
      }
    } finally {
      setLoading(false);
    }
  }, [codigosKey, dispatch]);

  useEffect(() => {
    if (open) {
      loadTracking();
    }
  }, [open, loadTracking]);


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "primary.main",
          fontWeight: 600,
        }}
      >
        Rastreio dos itens da requisição
        <Box>
          <IconButton onClick={loadTracking} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
            <CircularProgress />
          </Stack>
        ) : notConnected ? (
          <Typography color="text.secondary">
            Nenhuma conta do Mercado Livre conectada. Conecte em Gestão Adm &gt; Contas Mercado Livre.
          </Typography>
        ) : orders.length === 0 && itensComPalavraChave.length === 0 ? (
          <Typography color="text.secondary">
            Nenhum item desta requisição tem código ou palavra-chave do Mercado Livre preenchido.
          </Typography>
        ) : (
          <>
            {itensComPalavraChave.length > 0 && (
              <Box sx={{ mb: orders.length > 0 ? 2 : 0 }}>
                <Typography fontSize="0.85rem" fontWeight={600} mb={1}>
                  Compras identificadas por palavra-chave
                </Typography>
                <Stack spacing={1.5}>
                  {itensComPalavraChave.map((entry, index) => (
                    <Box key={index}>
                      <Typography fontSize="0.85rem" fontWeight={600}>
                        {entry.produto_descricao || "Item sem descrição"}
                      </Typography>
                      <Typography fontSize="0.75rem" color="text.secondary">
                        Palavra-chave: {entry.palavras.join(", ")}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                {orders.length > 0 && <Divider sx={{ mt: 2 }} />}
              </Box>
            )}
            {orders.length > 0 && (
              <TrackingList
                orders={orders}
                palavrasChavePorCodigo={palavrasChavePorCodigo}
              />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequisitionTrackingDialog;

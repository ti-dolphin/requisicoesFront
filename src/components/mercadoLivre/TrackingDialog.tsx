import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import MercadoLivreService from "../../services/mercadoLivre/MercadoLivreService";
import { MercadoLivreOrder } from "../../models/mercadoLivre/MercadoLivreOrder";
import { TrackingDialogProps } from "../../models/mercadoLivre/TrackingDialog";
import { getDateStringFromISOstring, formatCurrency } from "../../utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  handling: "Em preparação",
  ready_to_ship: "Pronto para envio",
  shipped: "Enviado",
  delivered: "Entregue",
  not_delivered: "Não entregue",
  cancelled: "Cancelado",
};

const SUBSTATUS_LABELS: Record<string, string> = {
  out_for_delivery: "Saiu para entrega",
  receiver_absent: "Comprador ausente",
  dangerous_area: "Região de risco",
  bad_address: "Endereço incorreto",
  unauthorized_receiver: "Pessoa não autorizada",
  returning_to_sender: "Em devolução ao vendedor",
};

const STATUS_COLORS: Record<string, "default" | "info" | "success" | "error" | "warning"> = {
  delivered: "success",
  shipped: "info",
  ready_to_ship: "info",
  handling: "warning",
  pending: "default",
  not_delivered: "error",
  cancelled: "error",
};

const TrackingDialog = ({ open, onClose }: TrackingDialogProps) => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState<MercadoLivreOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [notConnected, setNotConnected] = useState(false);

  const loadTracking = useCallback(async () => {
    try {
      setLoading(true);
      setNotConnected(false);
      const data = await MercadoLivreService.getTracking(10);
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
  }, [dispatch]);

  useEffect(() => {
    if (open) {
      loadTracking();
    }
  }, [open, loadTracking]);

  const handleConnect = async () => {
    try {
      const { url } = await MercadoLivreService.getAuthorizationUrl();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: err?.response?.data?.error || "Erro ao gerar link de conexão",
          type: "error",
        })
      );
    }
  };

  const renderTracking = (order: MercadoLivreOrder) => {
    if (order.rastreio) {
      const { status, substatus, codigo_rastreio, transportadora, data_estimada } =
        order.rastreio;
      return (
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              size="small"
              label={STATUS_LABELS[status] || status}
              color={STATUS_COLORS[status] || "default"}
            />
            {substatus && (
              <Typography fontSize="0.75rem" color="text.secondary">
                {SUBSTATUS_LABELS[substatus] || substatus}
              </Typography>
            )}
          </Stack>
          {codigo_rastreio && (
            <Typography fontSize="0.75rem">
              Código: <strong>{codigo_rastreio}</strong>
              {transportadora ? ` — ${transportadora}` : ""}
            </Typography>
          )}
          {data_estimada && (
            <Typography fontSize="0.75rem" color="text.secondary">
              Previsão: {getDateStringFromISOstring(data_estimada)}
            </Typography>
          )}
        </Stack>
      );
    }

    if (order.erro_rastreio) {
      return (
        <Typography fontSize="0.75rem" color="error.main">
          Rastreio indisponível: {order.erro_rastreio}
        </Typography>
      );
    }

    return (
      <Typography fontSize="0.75rem" color="text.secondary">
        Sem envio associado
      </Typography>
    );
  };

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
        Rastreio das compras
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
          <Alert
            severity="info"
            action={
              <Button color="inherit" size="small" onClick={handleConnect}>
                Conectar
              </Button>
            }
          >
            Conta do Mercado Livre não conectada.
          </Alert>
        ) : orders.length === 0 ? (
          <Typography color="text.secondary">Nenhuma compra encontrada.</Typography>
        ) : (
          <Stack spacing={1} divider={<Divider />}>
            {orders.map((order) => (
              <Box key={order.id_pedido} sx={{ py: 1 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography fontSize="0.85rem" fontWeight={600}>
                      {order.itens.map((item) => item.titulo).join(", ")}
                    </Typography>
                    <Typography fontSize="0.75rem" color="text.secondary">
                      {getDateStringFromISOstring(order.data_criacao)}
                      {order.vendedor ? ` — ${order.vendedor}` : ""} —{" "}
                      {formatCurrency(Number(order.total || 0))}
                    </Typography>
                    <Link
                      href={`https://www.mercadolivre.com.br/vendas/${order.id_pedido}/detalhe`}
                      target="_blank"
                      rel="noopener noreferrer"
                      fontSize="0.7rem"
                    >
                      Pedido {order.id_pedido}
                    </Link>
                  </Box>
                  <Box sx={{ minWidth: 220 }}>{renderTracking(order)}</Box>
                </Stack>
              </Box>
            ))}
          </Stack>
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

export default TrackingDialog;

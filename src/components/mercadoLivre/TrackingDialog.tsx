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
import { TrackingDialogProps } from "../../models/mercadoLivre/TrackingDialog";
import TrackingList from "./TrackingList";
import ConnectAccountsAlert from "./ConnectAccountsAlert";

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
          <ConnectAccountsAlert />
        ) : orders.length === 0 ? (
          <Typography color="text.secondary">Nenhuma compra encontrada.</Typography>
        ) : (
          <TrackingList orders={orders} />
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

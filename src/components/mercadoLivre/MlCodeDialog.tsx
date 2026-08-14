import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import RequisitionItemService from "../../services/requisicoes/RequisitionItemService";
import { MlCodeDialogProps } from "../../models/mercadoLivre/MlCodeDialog";

const MlCodeDialog = ({ item, onClose, onSaved }: MlCodeDialogProps) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCodigo(String(item?.codigo_ml ?? ""));
  }, [item]);

  const handleSave = async () => {
    if (!item) return;

    try {
      setLoading(true);
      const atualizado = await RequisitionItemService.update(
        item.id_item_requisicao,
        {
          codigo_ml: codigo.trim() || null,
          alterado_por: user?.CODPESSOA,
        } as any
      );
      dispatch(
        setFeedback({ message: "Código do Mercado Livre salvo", type: "success" })
      );
      onSaved(atualizado);
      onClose();
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: err?.response?.data?.error || "Erro ao salvar o código",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={Boolean(item)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "primary.main",
          fontWeight: 600,
        }}
      >
        Código da compra
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography fontSize="0.8rem" color="text.secondary">
            {item?.produto_descricao || ""}
          </Typography>
          <TextField
            fullWidth
            autoFocus
            label="Código do Mercado Livre"
            value={codigo}
            onChange={(event) => setCodigo(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
            }}
            helperText="Número do pedido no Mercado Livre. Deixe vazio para remover."
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="contained"
          color="error"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MlCodeDialog;

import { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { setRefresh } from "../../redux/slices/requisicoes/requisitionItemSlice";
import { MlCodeService } from "../../services/mercadoLivre/MlCodeService";
import { MlCode } from "../../models/mercadoLivre/MlCode";
import { MlCodeDialogProps } from "../../models/mercadoLivre/MlCodeDialog";
import BaseDeleteDialog from "../shared/BaseDeleteDialog";
import BaseInputDialog from "../shared/BaseInputDialog";

const MlCodeDialog = ({ item, onClose }: MlCodeDialogProps) => {
  const dispatch = useDispatch();
  const { refresh } = useSelector((state: RootState) => state.requisitionItem);
  const [codes, setCodes] = useState<MlCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [deletingCode, setDeletingCode] = useState<MlCode | null>(null);

  const fetchCodes = async () => {
    if (!item) return;
    setLoading(true);
    try {
      const result = await MlCodeService.getByRequisitionItem(
        item.id_item_requisicao
      );
      setCodes(result);
    } catch (err: any) {
      dispatch(
        setFeedback({ message: "Erro ao buscar códigos.", type: "error" })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (item) {
      fetchCodes();
    } else {
      setCodes([]);
    }
  }, [item]);

  const openAddDialog = () => setAddDialogOpen(true);
  const closeAddDialog = () => {
    setAddDialogOpen(false);
    setCodeInput("");
  };

  const handleAddCode = async () => {
    if (!item || !codeInput.trim()) return;
    try {
      const created = await MlCodeService.create({
        id_item_requisicao: item.id_item_requisicao,
        codigo_ml: codeInput.trim(),
      });
      setCodes((prev) => [...prev, created]);
      closeAddDialog();
      dispatch(setRefresh(!refresh));
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: err?.response?.data?.error || "Erro ao salvar o código",
          type: "error",
        })
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingCode) return;
    try {
      await MlCodeService.delete(deletingCode.id_codigo_ml);
      setCodes((prev) =>
        prev.filter((code) => code.id_codigo_ml !== deletingCode.id_codigo_ml)
      );
      setDeletingCode(null);
      dispatch(setRefresh(!refresh));
    } catch (err: any) {
      dispatch(
        setFeedback({ message: "Erro ao excluir código.", type: "error" })
      );
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
        Códigos da compra
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography fontSize="0.8rem" color="text.secondary" mb={1}>
          {item?.produto_descricao || ""}
        </Typography>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <List sx={{ maxHeight: 300, overflow: "auto" }}>
            {codes.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Nenhum código cadastrado.
              </Typography>
            )}
            {codes.map((code) => (
              <ListItem key={code.id_codigo_ml} divider>
                <Typography fontSize="0.9rem">{code.codigo_ml}</Typography>
                <ListItemSecondaryAction>
                  <Tooltip title="Excluir">
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => setDeletingCode(code)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          disabled={loading}
          onClick={openAddDialog}
        >
          Adicionar código
        </Button>
      </DialogActions>

      <BaseInputDialog
        open={addDialogOpen}
        onClose={closeAddDialog}
        onConfirm={handleAddCode}
        title="Adicionar código"
        inputLabel="Código do Mercado Livre"
        inputValue={codeInput}
        onInputChange={(event) => setCodeInput(event.target.value)}
      />

      <BaseDeleteDialog
        open={deletingCode !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCode(null)}
      />
    </Dialog>
  );
};

export default MlCodeDialog;

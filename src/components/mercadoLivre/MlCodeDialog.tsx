import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  Stack,
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
import { PalavraChaveMlService } from "../../services/mercadoLivre/PalavraChaveMlService";
import MercadoLivreService from "../../services/mercadoLivre/MercadoLivreService";
import { MlCode } from "../../models/mercadoLivre/MlCode";
import { PalavraChaveMl } from "../../models/mercadoLivre/PalavraChaveMl";
import { MercadoLivreOrder } from "../../models/mercadoLivre/MercadoLivreOrder";
import { MlCodeDialogProps } from "../../models/mercadoLivre/MlCodeDialog";
import BaseDeleteDialog from "../shared/BaseDeleteDialog";
import BaseInputDialog from "../shared/BaseInputDialog";
import { STATUS_LABELS } from "./TrackingList";
import { getDateStringFromISOstring } from "../../utils";

const MlCodeDialog = ({ item, onClose }: MlCodeDialogProps) => {
  const dispatch = useDispatch();
  const { refresh } = useSelector((state: RootState) => state.requisitionItem);

  const [codes, setCodes] = useState<MlCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [addCodeDialogOpen, setAddCodeDialogOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [deletingCode, setDeletingCode] = useState<MlCode | null>(null);
  const [tracking, setTracking] = useState<Record<string, MercadoLivreOrder[]>>({});
  const [loadingTracking, setLoadingTracking] = useState(false);

  const [keywords, setKeywords] = useState<PalavraChaveMl[]>([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  // null = fechado; 0 = palavra-chave sem código (item sem nenhum código); number = id_codigo_ml alvo
  const [addingKeywordForCode, setAddingKeywordForCode] = useState<number | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [deletingKeyword, setDeletingKeyword] = useState<PalavraChaveMl | null>(null);

  const fetchTracking = async (codesList: MlCode[]) => {
    const trackableCodes = codesList.filter((code) => Boolean(code.codigo_ml));
    if (!trackableCodes.length) {
      setTracking({});
      return;
    }
    setLoadingTracking(true);
    try {
      const response = await MercadoLivreService.getTrackingByCodes(
        trackableCodes.map((code) => code.codigo_ml as string)
      );
      const grouped: Record<string, MercadoLivreOrder[]> = {};
      response.results.forEach((order) => {
        const key = order.codigo_ml || "";
        grouped[key] = [...(grouped[key] || []), order];
      });
      setTracking(grouped);
    } catch (err: any) {
      setTracking({});
    } finally {
      setLoadingTracking(false);
    }
  };

  const fetchCodes = async () => {
    if (!item) return;
    setLoadingCodes(true);
    try {
      const result = await MlCodeService.getByRequisitionItem(
        item.id_item_requisicao
      );
      setCodes(result);
      fetchTracking(result);
    } catch (err: any) {
      dispatch(
        setFeedback({ message: "Erro ao buscar códigos.", type: "error" })
      );
    } finally {
      setLoadingCodes(false);
    }
  };

  const fetchKeywords = async () => {
    if (!item) return;
    setLoadingKeywords(true);
    try {
      const result = await PalavraChaveMlService.getByRequisitionItem(
        item.id_item_requisicao
      );
      setKeywords(result);
    } catch (err: any) {
      dispatch(
        setFeedback({ message: "Erro ao buscar palavras-chave.", type: "error" })
      );
    } finally {
      setLoadingKeywords(false);
    }
  };

  useEffect(() => {
    if (item) {
      fetchCodes();
      fetchKeywords();
    } else {
      setCodes([]);
      setTracking({});
      setKeywords([]);
    }
  }, [item]);

  const openAddCodeDialog = () => setAddCodeDialogOpen(true);
  const closeAddCodeDialog = () => {
    setAddCodeDialogOpen(false);
    setCodeInput("");
  };

  const handleAddCode = async () => {
    if (!item || !codeInput.trim()) return;
    try {
      const created = await MlCodeService.create({
        id_item_requisicao: item.id_item_requisicao,
        link: codeInput.trim(),
      });
      const updatedCodes = [...codes, created];
      setCodes(updatedCodes);
      closeAddCodeDialog();
      dispatch(setRefresh(!refresh));
      fetchTracking(updatedCodes);
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: err?.response?.data?.error || "Erro ao salvar o link",
          type: "error",
        })
      );
    }
  };

  const handleDeleteCode = async () => {
    if (!deletingCode) return;
    try {
      await MlCodeService.delete(deletingCode.id_codigo_ml);
      setCodes((prev) =>
        prev.filter((code) => code.id_codigo_ml !== deletingCode.id_codigo_ml)
      );
      setTracking((prev) => {
        if (!deletingCode.codigo_ml) return prev;
        const next = { ...prev };
        delete next[deletingCode.codigo_ml];
        return next;
      });
      setDeletingCode(null);
      dispatch(setRefresh(!refresh));
      fetchKeywords();
    } catch (err: any) {
      dispatch(
        setFeedback({ message: "Erro ao excluir código.", type: "error" })
      );
    }
  };

  const openAddKeywordDialog = (idCodigoMl: number | null) =>
    setAddingKeywordForCode(idCodigoMl ?? 0);
  const closeAddKeywordDialog = () => {
    setAddingKeywordForCode(null);
    setKeywordInput("");
  };

  const handleAddKeyword = async () => {
    if (!item || !keywordInput.trim() || addingKeywordForCode === null) return;
    try {
      const created = await PalavraChaveMlService.create({
        id_item_requisicao: item.id_item_requisicao,
        id_codigo_ml:
          addingKeywordForCode === 0 ? null : addingKeywordForCode,
        palavra_chave: keywordInput.trim(),
      });
      setKeywords((prev) => [...prev, created]);
      closeAddKeywordDialog();
      dispatch(setRefresh(!refresh));
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: err?.response?.data?.error || "Erro ao salvar a palavra-chave",
          type: "error",
        })
      );
    }
  };

  const handleDeleteKeyword = async () => {
    if (!deletingKeyword) return;
    try {
      await PalavraChaveMlService.delete(deletingKeyword.id_palavra_chave_ml);
      setKeywords((prev) =>
        prev.filter(
          (keyword) =>
            keyword.id_palavra_chave_ml !== deletingKeyword.id_palavra_chave_ml
        )
      );
      setDeletingKeyword(null);
      dispatch(setRefresh(!refresh));
    } catch (err: any) {
      dispatch(
        setFeedback({ message: "Erro ao excluir palavra-chave.", type: "error" })
      );
    }
  };

  const keywordsSemCodigo = keywords.filter((k) => k.id_codigo_ml === null);

  return (
    <Dialog open={Boolean(item)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "primary.main",
          fontWeight: 600,
        }}
      >
        Identificação da compra (Mercado Livre)
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography fontSize="0.8rem" color="text.secondary" mb={2}>
          {item?.produto_descricao || ""}
        </Typography>

        <Typography fontSize="0.85rem" fontWeight={600} mb={1}>
          Compras
        </Typography>
        {loadingCodes || loadingKeywords ? (
          <CircularProgress size={24} />
        ) : (
          <List sx={{ maxHeight: 350, overflow: "auto" }}>
            {codes.length === 0 && keywordsSemCodigo.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Nenhuma compra identificada.
              </Typography>
            )}
            {codes.map((code) => {
              const codeTracking = code.codigo_ml
                ? tracking[code.codigo_ml] || []
                : [];
              const codeKeywords = keywords.filter(
                (k) => k.id_codigo_ml === code.id_codigo_ml
              );
              const isUrl = /^https?:\/\//i.test(code.link || "");
              return (
                <ListItem
                  key={code.id_codigo_ml}
                  divider
                  sx={{ alignItems: "flex-start" }}
                >
                  <Stack spacing={0.5} sx={{ pr: 4, width: "100%" }}>
                    {isUrl ? (
                      <Typography
                        component="a"
                        href={code.link as string}
                        target="_blank"
                        rel="noreferrer"
                        fontSize="0.9rem"
                        sx={{ color: "primary.main", wordBreak: "break-all" }}
                      >
                        {code.link}
                      </Typography>
                    ) : (
                      <Typography fontSize="0.9rem" sx={{ wordBreak: "break-all" }}>
                        {code.link || code.codigo_ml}
                      </Typography>
                    )}
                    {!code.codigo_ml ? (
                      <Typography fontSize="0.7rem" color="text.secondary">
                        Sem orderId identificado no link — rastreio indisponível
                      </Typography>
                    ) : loadingTracking ? (
                      <Typography fontSize="0.7rem" color="text.secondary">
                        Buscando previsão de entrega...
                      </Typography>
                    ) : codeTracking.length > 0 ? (
                      codeTracking.map((order, index) => (
                        <Typography
                          key={index}
                          fontSize="0.7rem"
                          color={
                            order.rastreio?.data_estimada
                              ? "text.secondary"
                              : "error.main"
                          }
                        >
                          {order.rastreio?.data_estimada
                            ? `Previsão de entrega: ${getDateStringFromISOstring(
                                order.rastreio.data_estimada
                              )}`
                            : order.erro_rastreio
                            ? `Rastreio indisponível: ${order.erro_rastreio}`
                            : order.rastreio?.status
                            ? STATUS_LABELS[order.rastreio.status] ||
                              order.rastreio.status
                            : "Sem previsão de entrega"}
                        </Typography>
                      ))
                    ) : null}

                    {codeKeywords.map((keyword) => (
                      <Stack
                        key={keyword.id_palavra_chave_ml}
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                      >
                        <Typography fontSize="0.75rem">
                          Palavra-chave: {keyword.palavra_chave}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeletingKeyword(keyword)}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Stack>
                    ))}

                    <Button
                      size="small"
                      startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                      sx={{ alignSelf: "flex-start", fontSize: "0.7rem" }}
                      onClick={() => openAddKeywordDialog(code.id_codigo_ml)}
                    >
                      Adicionar palavra-chave
                    </Button>
                  </Stack>
                  <ListItemSecondaryAction>
                    <Tooltip title="Excluir código">
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
              );
            })}

            {keywordsSemCodigo.map((keyword) => (
              <ListItem key={`palavra-${keyword.id_palavra_chave_ml}`} divider>
                <Typography fontSize="0.9rem">
                  Palavra-chave: {keyword.palavra_chave}
                </Typography>
                <ListItemSecondaryAction>
                  <Tooltip title="Excluir">
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => setDeletingKeyword(keyword)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={loadingCodes}
            onClick={openAddCodeDialog}
          >
            Adicionar link
          </Button>
          {codes.length === 0 && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              disabled={loadingKeywords}
              onClick={() => openAddKeywordDialog(null)}
            >
              Adicionar palavra-chave
            </Button>
          )}
        </Stack>
      </DialogContent>

      <BaseInputDialog
        open={addCodeDialogOpen}
        onClose={closeAddCodeDialog}
        onConfirm={handleAddCode}
        title="Adicionar link"
        inputLabel="Link da compra no Mercado Livre"
        inputValue={codeInput}
        onInputChange={(event) => setCodeInput(event.target.value)}
      />

      <BaseDeleteDialog
        open={deletingCode !== null}
        onConfirm={handleDeleteCode}
        onCancel={() => setDeletingCode(null)}
        message="Excluir este código também exclui as palavras-chave vinculadas a ele. Deseja continuar?"
      />

      <BaseInputDialog
        open={addingKeywordForCode !== null}
        onClose={closeAddKeywordDialog}
        onConfirm={handleAddKeyword}
        title="Adicionar palavra-chave"
        inputLabel="Palavra-chave"
        inputValue={keywordInput}
        onInputChange={(event) => setKeywordInput(event.target.value)}
      />

      <BaseDeleteDialog
        open={deletingKeyword !== null}
        onConfirm={handleDeleteKeyword}
        onCancel={() => setDeletingKeyword(null)}
      />
    </Dialog>
  );
};

export default MlCodeDialog;

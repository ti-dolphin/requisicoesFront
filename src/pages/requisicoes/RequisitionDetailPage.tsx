import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Button,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RequisitionService from "../../services/requisicoes/RequisitionService";
import { clearRequisition, setRequisition } from "../../redux/slices/requisicoes/requisitionSlice";
import RequisitionStatusStepper from "../../components/requisicoes/RequisitionStatusStepper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useCallback } from "react";
import RequisitionDetailsTable from "../../components/requisicoes/RequisitionDetailsTable";
import BuyerSelectionDialog from "../../components/requisicoes/BuyerSelectionDialog";
import AddIcon from "@mui/icons-material/Add";
import RequisitionAttachmentList from "../../components/requisicoes/RequisitionAttachmentList";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import RequisitionTimeline from "../../components/requisicoes/RequisitionTimeline";
import RequisitionItemsTable from "../../components/requisicoes/RequisitionItemsTable";
import { clearNewItems, clearRecentProducts, setAddingProducts, setItemBeingReplaced, setNewItems, setProductSelected, setRefresh, setReplacingItemProduct, setUpdatingRecentProductsQuantity } from "../../redux/slices/requisicoes/requisitionItemSlice";
import ProductsTable from "../../components/requisicoes/ProductsTable";
import RequisitionItemService from "../../services/requisicoes/RequisitionItemService";
import QuoteList from "../../components/requisicoes/QuoteList";
import CloseIcon from '@mui/icons-material/Close';
import { calculateQuoteSubtotal, formatCurrency2To3 } from "../../utils";
import UpperNavigation from "../../components/shared/UpperNavigation";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import RequisitionCommentList from "../../components/requisicoes/RequisitionCommentList";
import { useIsMobile } from "../../hooks/useIsMobile";
import SelectedQuoteItemsDialog from "../../components/requisicoes/SelectedQuoteItemsDialog";
import RequisitionHeaderTitle from "../../components/requisicoes/RequisitionHeaderTitle";
import { Requisition } from "../../models/requisicoes/Requisition";

const RequisitionDetailPage = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  const {addingProducts, updatingRecentProductsQuantity} = useSelector((state: RootState) => state.requisitionItem);
  const {id_requisicao} = useParams();
  const { recentProductsAdded, replacingItemProduct, itemBeingReplaced, productSelected, refresh, items } = useSelector((state: RootState) => state.requisitionItem);
  const {requisition, refreshRequisition} = useSelector((state: RootState) => state.requisition);
  const [quoteListOpen, setQuoteListOpen] = useState<boolean>(false);
  const [buyerDialogOpen, setBuyerDialogOpen] = useState<boolean>(false);
  const [selectedItemsDialogOpen, setSelectedItemsDialogOpen] = useState<boolean>(false);
  const [linkedReqDialogOpen, setLinkedReqDialogOpen] = useState<boolean>(false);
  const [linkedRequisitions, setLinkedRequisitions] = useState<Requisition[]>([]);
  const [loadingLinkedRequisitions, setLoadingLinkedRequisitions] = useState<boolean>(false);
  const [fullScreenItems, setFullScreenItems] = useState<boolean>(false);
  const [fullScreenTimeline, setFullScreenTimeline] = useState<boolean>(false);
  const [fullScreenAttachments, setFullScreenAttachments] = useState<boolean>(false);
  const [fullScreenComments, setFullScreenComments] = useState<boolean>(false);
  const fullScreenItemsTableContainer = useRef<HTMLDivElement>(null);
  const fullScreenTimelineContainer = useRef<HTMLDivElement>(null);
  const fullScreenAttachmentsContainer = useRef<HTMLDivElement>(null);
  const fullScreenCommentsContainer = useRef<HTMLDivElement>(null);
  const { isMobile } = useIsMobile();

  const displayItemsTotal = useMemo(() => {
    return items.reduce((acc, item: any) => {
      if (!item?.id_item_cotacao || !item?.items_cotacao?.length) return acc;

      const selectedQuoteItem = item.items_cotacao.find(
        (quoteItem: any) =>
          Number(quoteItem.id_item_cotacao) === Number(item.id_item_cotacao)
      );

      if (!selectedQuoteItem || Number(selectedQuoteItem.indisponivel) > 0) return acc;

      const unitPrice = Number(selectedQuoteItem.preco_unitario || 0);
      const quantity = Number(item.quantidade || 0);
      const ipiPercent = Number(selectedQuoteItem.IPI || 0);
      const stPercent = Number(selectedQuoteItem.ST || 0);
      return acc + calculateQuoteSubtotal(unitPrice, quantity, ipiPercent, stPercent);
    }, 0);
  }, [items]);

  const displayShippingTotal = useMemo(
    () => Number(requisition.custo_total_frete || 0),
    [requisition.custo_total_frete]
  );

  const displayGrandTotal = useMemo(
    () => displayItemsTotal + displayShippingTotal,
    [displayItemsTotal, displayShippingTotal]
  );
  
  const fetchData = useCallback(async () => { 
    const requisition = await RequisitionService.getById(Number(id_requisicao));
    dispatch(setRequisition(requisition));
  }, [id_requisicao, dispatch]);

  const createItemsFromProducts = async () =>  {
    try{  
      const newItemIds = await RequisitionItemService.createMany(recentProductsAdded, requisition.ID_REQUISICAO);
      dispatch(setFeedback({ 
        message: 'Produtos adicionados com sucesso! Insira as quantidades desejadas',
        type: 'success'
      }));
      dispatch(setNewItems(newItemIds));
      return;
    }catch(e : any){ 
      dispatch(setFeedback({ 
        message: 'Erro ao criar itens da requisição',
        type: 'error'
      }));
    }
  }

  const concludeReplaceItemProduct = async () =>   {
    if(!itemBeingReplaced || !productSelected) return;
    try { 
      await RequisitionItemService.update(itemBeingReplaced, {id_produto: productSelected});
      dispatch(setFeedback({
        message: 'Produto substituído com sucesso',
        type: 'success'
      }))
      dispatch(setRefresh(!refresh));
      dispatch(setReplacingItemProduct(false));
      dispatch(setItemBeingReplaced(null))
      dispatch(setProductSelected(null))
    } catch(e) {
      dispatch(setFeedback({
        message: 'Erro ao substituir produto',
        type: 'error'
      }))
    }
  }

  const concludeAddProducts  = async () =>  {
    await createItemsFromProducts();
    dispatch(setUpdatingRecentProductsQuantity(true));
    dispatch(setAddingProducts(false));
    dispatch(clearRecentProducts());
  };

  const concludeUpdateItemsQuantity = () => { 
    setTimeout(() => {
      dispatch(setUpdatingRecentProductsQuantity(false));
      dispatch(clearNewItems());
    }, 1000);
  };

  const handleClose = () => {
    dispatch(setAddingProducts(false));
    dispatch(setReplacingItemProduct(false));
  }

  const handleOpenBuyerDialog = () => {
    setBuyerDialogOpen(true);
  };

  const handleCloseBuyerDialog = () => {
    setBuyerDialogOpen(false);
  };

  const handleOpenLinkedRequisitions = async () => {
    if (!requisition?.ID_REQUISICAO) return;

    setLinkedReqDialogOpen(true);
    setLoadingLinkedRequisitions(true);

    try {
      const linkedReqs = await RequisitionService.getLinkedRequisitions(
        requisition.ID_REQUISICAO
      );
      setLinkedRequisitions(linkedReqs || []);
    } catch (e) {
      dispatch(
        setFeedback({
          message: "Erro ao buscar requisições vinculadas",
          type: "error",
        })
      );
      setLinkedRequisitions([]);
    } finally {
      setLoadingLinkedRequisitions(false);
    }
  };

  const openLinkedRequisition = (linkedReqId: number) => {
    setLinkedReqDialogOpen(false);
    const linkedReqPath = `/requisicoes/${linkedReqId}`;
    window.open(linkedReqPath, "_blank", "noopener,noreferrer");
  };

  const handleConfirmBuyerChange = async (buyerId: number | null) => {
    try {
      await RequisitionService.update(requisition.ID_REQUISICAO, {
        id_comprador: buyerId,
      });
      dispatch(setFeedback({
        message: 'Comprador atualizado com sucesso',
        type: 'success'
      }));
      fetchData();
    } catch (error) {
      dispatch(setFeedback({
        message: 'Erro ao atualizar comprador',
        type: 'error'
      }));
    }
  };

  const handleBack = () => {
    navigate("/requisicoes");
    dispatch(clearRequisition());
  };

  const shouldShowAddItemsButton = () => { 
    return (
      user?.PERM_COMPRADOR ||
      (Number(requisition?.ID_RESPONSAVEL) === Number(user?.CODPESSOA) &&
        requisition.status?.nome === "Em edição")
    );
  }

  const shouldShowQuoteListButton = () => { 
    if (!requisition || !requisition.status) {
      return false;
    }

    const statusList = ['em cotação', 'aprovação gerente', 'aprovação diretoria', 'comprar', 'oc gerada', 'concluído', 'recebimento', 'lançar nf'];
    return statusList.includes((requisition.status.nome ?? "").toLowerCase());
  }

  const shouldShowSelectedItemsButton = () => {
    if (!requisition || !requisition.status) return false;
    return ['em cotação', 'comprar', 'recebimento', 'lançar nf', 'concluído'].includes(
      (requisition.status.nome ?? "").toLowerCase()
    );
  }

  const hasItemsWithoutQuote = () => {
    if (!items || items.length === 0) {
      return false;
    }

    return items.some((item: any) => {

      if (!item.items_cotacao || item.items_cotacao.length === 0) {
        return false;
      }

      const hasAnyPrice = item.items_cotacao.some(
        (quoteItem: any) => quoteItem && quoteItem.preco_unitario > 0 && !quoteItem.indisponivel
      );

      return !hasAnyPrice; 
    });
  }

  useEffect(() => {
    if (id_requisicao) {
      fetchData();
    }
  }, [id_requisicao, fetchData, refreshRequisition]);

  return (
    <Box
      height="100vh"
      width="98vw"
      p={{
        xs: 1,
        md: 0.5,
      }}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "auto",
      }}
      bgcolor="background"
    >
      <UpperNavigation handleBack={handleBack}>
        <RequisitionHeaderTitle />
      </UpperNavigation>
      <Grid container spacing={0.6}>
        {/* Header: Título, Projeto, Status Steps */}
        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 1 }}>
              {id_requisicao && (
                <RequisitionStatusStepper
                  id_requisicao={Number(id_requisicao)}
                />
              )}
            </Box>
          </Paper>
        </Grid>
        {/* Detalhes da requisição */}
        <Grid item xs={12} md={3}>
          {isMobile ? (
            <Accordion defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle1"
                  color="primary.main"
                  fontWeight={500}
                >
                  Detalhes da requisição
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1 }}>
                <RequisitionDetailsTable
                  requisition={requisition}
                  onBuyerDoubleClick={handleOpenBuyerDialog}
                />
              </AccordionDetails>
            </Accordion>
          ) : (
            <Paper
              sx={{
                p: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="subtitle1"
                color="primary.main"
                fontWeight={500}
                mb={0.5}
              >
                Detalhes da requisição
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flex: 1, overflowY: "auto" }}>
                <RequisitionDetailsTable
                  requisition={requisition}
                  onBuyerDoubleClick={handleOpenBuyerDialog}
                />
              </Box>
            </Paper>
          )}
        </Grid>
        {/* Anexos, Comentários e Adicionar Itens */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Grid container spacing={1}>
            {/* Comentários */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              {isMobile ? (
                <Accordion defaultExpanded={false}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      variant="subtitle1"
                      color="primary.main"
                      fontWeight={500}
                    >
                      Comentários
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 1 }}>
                    <RequisitionCommentList />
                  </AccordionDetails>
                </Accordion>
              ) : (
                <Paper
                  sx={{
                    p: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="primary.main"
                      fontWeight={500}
                      mb={0.5}
                    >
                      Comentários
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setFullScreenComments(true)}
                      color="primary"
                    >
                      <FullscreenIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 1 }} />
                  <Box
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                    }}
                  >
                    <RequisitionCommentList />
                  </Box>
                </Paper>
              )}
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <Paper
                sx={{
                  p: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    color="primary.main"
                    fontWeight={500}
                    mb={0.5}
                  >
                    Anexos e Links
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setFullScreenAttachments(true)}
                    color="primary"
                  >
                    <FullscreenIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <Box sx={{ flex: 1, overflowY: "auto" }}>
                  <RequisitionAttachmentList
                    id_requisicao={Number(id_requisicao)}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={3}>
          {isMobile ? (
            <Accordion defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle1"
                  color="primary.main"
                  fontWeight={500}
                >
                  Timeline / Histórico
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1 }}>
                <RequisitionTimeline />
              </AccordionDetails>
            </Accordion>
          ) : (
            <Paper
              sx={{
                p: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="subtitle1"
                  color="primary.main"
                  fontWeight={500}
                >
                  Timeline / Histórico
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setFullScreenTimeline(true)}
                  color="primary"
                >
                  <FullscreenIcon fontSize="small" />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flex: 1, overflowY: "auto" }}>
                <RequisitionTimeline />
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Tabela de Itens */}
        <Grid
          item
          xs={12}
          sx={{
            minHeight: {
              xs: 800,
              md: 400,
            },
          }}
        >
          <Paper sx={{ p: 1, position: "relative" }}>
            <Stack direction="column" alignItems={"start"} gap={1}>
              {/* Tela cheia */}
              <IconButton
                sx={{ position: "absolute", right: "10px", top: "10px" }}
                onClick={() => setFullScreenItems(true)}
              >
                <FullscreenIcon />
              </IconButton>
              {/* Adicionar itens */}
              <Stack direction="row" spacing={1} alignItems="center">
                {shouldShowAddItemsButton() && (
                  <Button
                    onClick={() => dispatch(setAddingProducts(true))}
                    variant="contained"
                    size="small"
                  >
                    <AddIcon fontSize="small" />
                    Adicionar Itens
                  </Button>
                )}
                {shouldShowQuoteListButton() && (
                  <Button
                    onClick={() => setQuoteListOpen(true)}
                    variant="contained"
                    size="small"
                  >
                    Cotações
                  </Button>
                )}
                {shouldShowSelectedItemsButton() && (
                  <Button
                    onClick={() => setSelectedItemsDialogOpen(true)}
                    variant="contained"
                    size="small"
                    color="secondary"
                  >
                    Ver Itens Cotados
                  </Button>
                )}
                <Button
                  onClick={handleOpenLinkedRequisitions}
                  variant="outlined"
                  size="small"
                >
                  Requisições Vinculadas
                </Button>
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle2" color="primary.main">
                  Itens:{" "}
                  {formatCurrency2To3(Number(displayItemsTotal || 0))}
                </Typography>
                <Typography variant="subtitle2" color="primary.main">
                  Fretes:{" "}
                  {formatCurrency2To3(Number(displayShippingTotal || 0))}
                </Typography>
                <Typography variant="subtitle2" color="success.main">
                  Custo total:{" "}
                  {formatCurrency2To3(Number(displayGrandTotal || 0))}
                </Typography>
              </Box>
              {/* Legenda */}
              {hasItemsWithoutQuote() && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    Legenda:
                  </Typography>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "error.main",
                      display: "inline-block",
                      mr: 0.5,
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="error.main"
                    fontWeight={600}
                  >
                    Itens sem cotação
                  </Typography>
                </Box>
              )}
            </Stack>

            <Divider sx={{ mb: 1 }} />
            <Box>
              <RequisitionItemsTable hideFooter={false} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {/* Dialog para buscar os produtos, selecionar e adicioná-los aos itens da requisição */}
      <Dialog
        open={
          (addingProducts || replacingItemProduct) &&
          requisition?.tipo_faturamento != null
        } //o modal será aberto se estiver sendo feita substituição ou adição de produtos E se o tipo de faturamento já foi carregado
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        aria-labelledby="add-products-dialog-title"
      >
        <IconButton
          onClick={handleClose}
          color="error"
          sx={{ position: "absolute", top: 0, right: 0 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle id="add-products-dialog-title">
          <Typography variant="h6" fontWeight={600} color="primary.main">
            {" "}
            Adicionar Itens
          </Typography>
        </DialogTitle>
        <DialogContent>
          {(addingProducts || replacingItemProduct) &&
            requisition?.tipo_faturamento != null && (
              <ProductsTable
                tipoFaturamento={requisition.tipo_faturamento}
                fromReq={true}
              />
            )}
        </DialogContent>
        <DialogActions>
          {addingProducts && recentProductsAdded.length > 0 && (
            <Button
              onClick={concludeAddProducts}
              variant="contained"
              color="primary"
              sx={{ textTransform: "none", minWidth: 120 }}
            >
              Concluir
            </Button>
          )}
          {replacingItemProduct && productSelected && (
            <Button
              onClick={concludeReplaceItemProduct}
              variant="contained"
              color="primary"
              sx={{ textTransform: "none", minWidth: 120 }}
            >
              Substituir item
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* Dialog para atualizar os novos itens com as quantidades */}
      <Dialog
        open={updatingRecentProductsQuantity}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        aria-labelledby="add-products-dialog-title"
      >
        <DialogTitle id="add-products-dialog-title">
          Insira as quantidades dos produtos adicionados
        </DialogTitle>
        <DialogContent>
          {updatingRecentProductsQuantity && (
            <RequisitionItemsTable hideFooter={false} />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={concludeUpdateItemsQuantity}
            variant="contained"
            color="primary"
            sx={{ textTransform: "none", minWidth: 120 }}
          >
            Concluir
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog itens cotados selecionados */}
      <SelectedQuoteItemsDialog
        open={selectedItemsDialogOpen}
        onClose={() => setSelectedItemsDialogOpen(false)}
        idRequisicao={requisition?.ID_REQUISICAO}
        requisitionTitle={`${requisition?.ID_REQUISICAO || ""} | ${requisition?.DESCRIPTION || ""} | ${requisition?.projeto?.DESCRICAO || ""}`}
      />

      {/* Dialog da lista de cotações */}
      <Dialog maxWidth="md" fullWidth open={quoteListOpen}>
        <DialogTitle color="primary.main">
          Cotações desta requisição
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: "background.default",
          }}
        >
          <QuoteList />
          <IconButton
            onClick={() => setQuoteListOpen(false)}
            color="error"
            sx={{ position: "absolute", top: 0, right: 0 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogContent>
      </Dialog>

      <Dialog
        maxWidth="sm"
        fullWidth
        open={linkedReqDialogOpen}
        onClose={() => setLinkedReqDialogOpen(false)}
      >
        <DialogTitle color="primary.main">Requisições Vinculadas</DialogTitle>
        <DialogContent dividers>
          {loadingLinkedRequisitions ? (
            <Stack alignItems="center" justifyContent="center" py={4}>
              <CircularProgress size={26} />
            </Stack>
          ) : linkedRequisitions.length === 0 ? (
            <Typography color="text.secondary">
              Nenhuma requisição vinculada encontrada.
            </Typography>
          ) : (
            <List sx={{ py: 0 }}>
              {linkedRequisitions.map((linkedReq) => {
                const isCurrent =
                  Number(linkedReq.ID_REQUISICAO) === Number(requisition.ID_REQUISICAO);
                const parentId = Number(linkedReq.id_req_original || 0);

                return (
                  <ListItem key={linkedReq.ID_REQUISICAO} disablePadding divider>
                    <ListItemButton
                      onClick={() => openLinkedRequisition(linkedReq.ID_REQUISICAO)}
                    >
                      <ListItemText
                        primary={`REQ ${linkedReq.ID_REQUISICAO}${isCurrent ? " (Atual)" : ""}`}
                        secondary={`Origem: ${parentId ? `REQ ${parentId}` : "Requisição raiz"} | ${linkedReq.DESCRIPTION || "Sem descrição"}`}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkedReqDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog tela cheia items */}
      <Dialog
        fullScreen
        open={fullScreenItems}
        onClose={() => setFullScreenItems(false)}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <DialogTitle sx={{ maxHeight: 60 }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Typography fontSize="normal" color="primary.main" gutterBottom>
              Itens
            </Typography>
            <Button
              variant="contained"
              color="error"
              sx={{ fontSize: "small" }}
              onClick={() => setFullScreenItems(false)}
            >
              Fechar
            </Button>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems="center"
            >
              {shouldShowAddItemsButton() && (
                <Button
                  onClick={() => dispatch(setAddingProducts(true))}
                  variant="contained"
                  size="small"
                >
                  <AddIcon fontSize="small" />
                  Adicionar Itens
                </Button>
              )}
              {shouldShowQuoteListButton() && (
                <Button
                  onClick={() => setQuoteListOpen(true)}
                  variant="contained"
                  size="small"
                >
                  Cotações
                </Button>
              )}
              {shouldShowSelectedItemsButton() && (
                <Button
                  onClick={() => setSelectedItemsDialogOpen(true)}
                  variant="contained"
                  size="small"
                  color="secondary"
                >
                  Ver Itens Cotados
                </Button>
              )}
              <Button
                onClick={handleOpenLinkedRequisitions}
                variant="outlined"
                size="small"
              >
                Requisições Vinculadas
              </Button>
              <Box ml="auto" display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle2" color="success.main">
                  Custo total:{" "}
                  {formatCurrency2To3(Number(displayGrandTotal || 0))}
                </Typography>
                {hasItemsWithoutQuote() && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: "error.main",
                        display: "inline-block",
                        mr: 0.5,
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      color="error.main"
                      fontWeight={600}
                    >
                      Itens sem cotação
                    </Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent
          ref={fullScreenItemsTableContainer}
          sx={{ background: "background.default" }}
        >
          <RequisitionItemsTable
            hideFooter={false}
            tableMaxHeight={
              (fullScreenItemsTableContainer.current?.offsetHeight || 0) - 60
            }
          />
        </DialogContent>
      </Dialog>
      {/* Dialog tela cheia timeline/histórico */}
      <Dialog
        fullScreen
        open={fullScreenTimeline}
        onClose={() => setFullScreenTimeline(false)}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <DialogTitle sx={{ maxHeight: 60 }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Typography fontSize="normal" color="primary.main" gutterBottom>
              Timeline / Histórico
            </Typography>
            <Button
              variant="contained"
              color="error"
              sx={{ fontSize: "small" }}
              onClick={() => setFullScreenTimeline(false)}
            >
              Fechar
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent
          ref={fullScreenTimelineContainer}
          sx={{ background: "background.default" }}
        >
          <RequisitionTimeline fullScreen={true} />
        </DialogContent>
      </Dialog>
      {/* Dialog tela cheia anexos/links */}
      <Dialog
        fullScreen
        open={fullScreenAttachments}
        onClose={() => setFullScreenAttachments(false)}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <DialogTitle sx={{ maxHeight: 60 }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Typography fontSize="normal" color="primary.main" gutterBottom>
              Anexos e Links
            </Typography>
            <Button
              variant="contained"
              color="error"
              sx={{ fontSize: "small" }}
              onClick={() => setFullScreenAttachments(false)}
            >
              Fechar
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent
          ref={fullScreenAttachmentsContainer}
          sx={{ background: "background.default" }}
        >
          <RequisitionAttachmentList
            id_requisicao={Number(id_requisicao)}
            fullScreen={true}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog tela cheia comentários */}
      <Dialog
        fullScreen
        open={fullScreenComments}
        onClose={() => setFullScreenComments(false)}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <DialogTitle sx={{ maxHeight: 60 }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Typography fontSize="normal" color="primary.main" gutterBottom>
              Comentários
            </Typography>
            <Button
              variant="contained"
              color="error"
              sx={{ fontSize: "small" }}
              onClick={() => setFullScreenComments(false)}
            >
              Fechar
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent
          ref={fullScreenCommentsContainer}
          sx={{ background: "background.default" }}
        >
          <RequisitionCommentList fullScreen={true} />
        </DialogContent>
      </Dialog>
      {/* Dialog seleção de comprador */}
      <BuyerSelectionDialog
        open={buyerDialogOpen}
        onClose={handleCloseBuyerDialog}
        onConfirm={handleConfirmBuyerChange}
        currentBuyerId={requisition?.id_comprador}
      />
    </Box>
  )
};

export default RequisitionDetailPage;

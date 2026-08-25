import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import QuoteService from "../../services/requisicoes/QuoteService";
import QuoteForm from "../../components/requisicoes/QuoteForm";
import { useDispatch, useSelector } from "react-redux";
import { setAccesType, setQuote } from "../../redux/slices/requisicoes/quoteSlice";
import { Quote } from "../../models/requisicoes/Quote";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import QuoteItemsTable from "../../components/requisicoes/QuoteItemsTable";
import QuoteAttachmentList from "../../components/requisicoes/QuoteAttachmentList";
import { Requisition } from "../../models/requisicoes/Requisition";
import { setRequisition } from "../../redux/slices/requisicoes/requisitionSlice";
import RequisitionService from "../../services/requisicoes/RequisitionService";
import { UserService } from "../../services/UserService";
import { QuoteItemService } from "../../services/requisicoes/QuoteItemService";
import { setSingleQuoteItem } from "../../redux/slices/requisicoes/quoteItemSlice";
import { RootState } from "../../redux/store";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import UpperNavigation from "../../components/shared/UpperNavigation";
import { QuoteFileService } from "../../services/requisicoes/QuoteFileService";
import { formatCurrency } from "../../utils";
import { exportToExcel } from "../../utils/excelExport";
import { buildQuoteItemsExcelRows, parseQuoteItemsExcelRows } from "../../utils/quoteItemsExcel";

const QuoteDetailPage = () => {
  const dispatch = useDispatch();
  const { id_cotacao } = useParams<{ id_cotacao: string }>();
  const {quote} = useSelector((state : RootState) => state.quote);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const domain = window.location.origin;
  
  const accesType = useSelector((state : RootState) => state.quote.accessType);
  const requisition = useSelector((state : RootState) => state.requisition.requisition);
  const quoteItems = useSelector((state: RootState) => state.quoteItem.quoteItems);
  const [fullScreenItems, setFullScreenItems] = React.useState(false);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState<boolean>(false);
  const [importingExcel, setImportingExcel] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const checkIfQuoteHasAttachments = async (): Promise<boolean> => {
    try {
      const attachments = await QuoteFileService.getMany({ id_cotacao: Number(id_cotacao) }, token || undefined);
      return attachments.length > 0;
    } catch (error) {
      console.error('Erro ao verificar anexos da cotação:', error);
      return false;
    }
  };

  const handleSubmitQuote  = async (e : React.FormEvent<HTMLFormElement>, data : Quote) =>  { 
    e.preventDefault();
    const isSupplier = accesType === "supplier";
    const missingCnpjFornecedor = !String(data?.cnpj_fornecedor || "").trim();
    const missingCondicaoPagamento = !Number(data?.id_condicao_pagamento || 0);

    if (isSupplier && (missingCnpjFornecedor || missingCondicaoPagamento)) {
      dispatch(
        setFeedback({
          message: "Para enviar a cotação, CNPJ Fornecedor e Condição Pagamento são obrigatórios.",
          type: "error",
        })
      );
      return;
    }

    try {  
      const updatedQuote = await QuoteService.update(data.id_cotacao, {
        descricao  : data.descricao,
        observacao : data.observacao,
        id_classificacao_fiscal : data.id_classificacao_fiscal,
        id_condicao_pagamento : data.id_condicao_pagamento,
        id_tipo_frete : data.id_tipo_frete,
        fornecedor : data.fornecedor,
        valor_frete : data.valor_frete,
        valor_total : data.valor_total,
        cnpj_faturamento: data.cnpj_faturamento,
        cnpj_fornecedor : data.cnpj_fornecedor,
      });
      dispatch(setQuote(updatedQuote));
      dispatch(setFeedback({ message: `Cotação atualizada com sucesso!`, type: 'success' }));
    } catch(e : any) {  
      dispatch(setFeedback({ message: `Erro ao atualizar cotação : ${e.message}`, type: 'error' }));
    }
  }

  const handleBack = async () => {
    try {
      const hasAttachments = await checkIfQuoteHasAttachments();
      if (!hasAttachments) {
        setShowAttachmentDialog(true);
        return;
      }
      navigate(-1);
    } catch (error) {
      console.error('Erro ao verificar anexos:', error);
      navigate(-1);
    }
  }

  const confirmNavigation = () => {
    setShowAttachmentDialog(false);
    navigate(-1);
  };

  const cancelNavigation = () => {
    setShowAttachmentDialog(false);
  };

  const hanldeCreateSupplierAccess = async ( ) => { 
      try { 
        const supplierUrl = await UserService.getSupplierAcces(Number(id_cotacao), Number(requisition.ID_REQUISICAO));
        navigator.clipboard.writeText(`${domain}/${supplierUrl}`);
        dispatch(setFeedback({ message: `Acesso ao fornecedor copiado para a rea de transferência!`, type: 'success' }));
        return;
      } catch(e: any){ 
        dispatch(setFeedback({ 
          message: `Erro ao criar acesso ao fornecedor : ${e.message}`, 
          type: 'error'
        }))
      }
  };

  const handleExportExcel = () => {
    if (!quoteItems || quoteItems.length === 0) {
      dispatch(setFeedback({ message: `Não há itens para exportar`, type: 'error' }));
      return;
    }
    exportToExcel(
      buildQuoteItemsExcelRows(quoteItems),
      `cotacao_${id_cotacao}_itens`,
      "Itens"
    );
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImportingExcel(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

      if (rows.length === 0) {
        dispatch(setFeedback({ message: `A planilha importada está vazia`, type: 'error' }));
        return;
      }

      const { updates, errors } = parseQuoteItemsExcelRows(rows, quoteItems);

      for (const update of updates) {
        try {
          const { subtotal } = token
            ? await QuoteItemService.update(update.id_item_cotacao, update.payload, token)
            : await QuoteItemService.update(update.id_item_cotacao, update.payload);
          const currentItem = quoteItems.find(
            (item) => item.id_item_cotacao === update.id_item_cotacao
          );
          if (currentItem) {
            dispatch(setSingleQuoteItem({ ...currentItem, ...update.payload, subtotal }));
          }
        } catch (e: any) {
          errors.push(`Item ${update.id_item_cotacao}: ${e.message}`);
        }
      }

      if (updates.length > 0) {
        const updatedQuote = await QuoteService.getById(Number(id_cotacao));
        dispatch(setQuote(updatedQuote));
        dispatch(
          setFeedback({
            message: `${updates.length} ${updates.length === 1 ? "item atualizado" : "itens atualizados"} com sucesso!`,
            type: 'success',
          })
        );
      }

      if (errors.length > 0) {
        dispatch(
          setFeedback({
            message: `${errors.length} ${errors.length === 1 ? "linha não pôde" : "linhas não puderam"} ser importada(s): ${errors.slice(0, 3).join(" | ")}${errors.length > 3 ? "…" : ""}`,
            type: 'error',
          })
        );
      }
    } catch (e: any) {
      dispatch(setFeedback({ message: `Erro ao ler o arquivo Excel: ${e.message}`, type: 'error' }));
    } finally {
      setImportingExcel(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      if (token) { 
        window.localStorage.setItem("token", token);
        dispatch(setAccesType("supplier"));
      }
      const data: Quote = await QuoteService.getById(Number(id_cotacao));
      const reqData: Requisition = await RequisitionService.getById(
        Number(data.id_requisicao)
      );
      dispatch(setQuote(data));
      dispatch(setRequisition(reqData));
    } catch (e : any) {
      dispatch(
        setFeedback({
          message: `Erro ao carregar dados da cota o: ${e.message}`,
          type: "error",
        })
      );
    }
  }, [id_cotacao, token, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  
  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 2,
        width: "100%",
        height: "100vh",
        margin: "0 auto",
        backgroundColor: "background",
      }}
    >
      {accesType !== "supplier" && (
        <UpperNavigation handleBack={handleBack}>
          <Typography
            variant="h6"
            fontSize={"1rem"}
            color={"primary.main"}
          >{`Requisição ${requisition.ID_REQUISICAO} | ${requisition.DESCRIPTION} | ${requisition.projeto?.DESCRICAO} - Cotação ${quote?.id_cotacao}`}</Typography>
        </UpperNavigation>
      )}

      {accesType === "supplier" && (
        <Typography
          variant="h6"
          fontSize={"1rem"}
          color={"primary.main"}
        >{`Requisição ${requisition.ID_REQUISICAO}`}</Typography>
      )}

      <Grid container spacing={2} sx={{ justifyContent: "center" }}>
        <Grid item xs={12} md={8} sx={{ padding: 2 }}>
          <Paper
            sx={{
              p: 2,
              elevation: 1,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <QuoteForm onSubmit={handleSubmitQuote} />
            {accesType !== "supplier" && !token && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button size="small" onClick={hanldeCreateSupplierAccess}>
                  Link de fornecedor
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportExcel}
                >
                  Exportar Excel
                </Button>
                <Button
                  size="small"
                  startIcon={<UploadFileIcon />}
                  onClick={handleImportClick}
                  disabled={importingExcel}
                >
                  {importingExcel ? "Importando..." : "Importar Excel"}
                </Button>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  ref={importInputRef}
                  style={{ display: "none" }}
                  onChange={handleImportExcel}
                />
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: "flex" }}>
          <Paper
            sx={{
              p: 2,
              elevation: 1,
              borderRadius: 2,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography color="primary.main" variant="h6">
              Anexos
            </Typography>
            <QuoteAttachmentList id_cotacao={Number(id_cotacao)} allowAddLink />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2, elevation: 1, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" gap={2}>
              {" "}
              <Typography variant="h6" color="primary.main">
                Itens da cotação
              </Typography>
              <IconButton onClick={() => setFullScreenItems(true)}>
                <FullscreenIcon />
              </IconButton>
            </Stack>
            
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                alignItems: "center",
                mt: 2,
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" color="primary.main">
                Itens:{" "}
                {formatCurrency(Number((quote?.valor_total || 0) - (quote?.valor_frete || 0)))}
              </Typography>
              <Typography variant="subtitle2" color="primary.main">
                Fretes:{" "}
                {formatCurrency(Number(quote?.valor_frete || 0))}
              </Typography>
              <Typography variant="subtitle2" color="success.main">
                Custo total:{" "}
                {formatCurrency(Number(quote?.valor_total || 0))}
              </Typography>
            </Box>
            
            <QuoteItemsTable hideFooter={false} tableMaxHeight={400} />
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={fullScreenItems}
        onClose={() => setFullScreenItems(false)}
        fullScreen
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={2}>
            <Typography variant="h6" color="primary.main">
              Itens da cotação
            </Typography>
            <Button
              variant="contained"
              onClick={() => setFullScreenItems(false)}
              color="error"
            >
              Fechar
            </Button>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                alignItems: "center",
                ml: "auto",
              }}
            >
              <Typography variant="subtitle2" color="primary.main">
                Itens:{" "}
                {formatCurrency(Number((quote?.valor_total || 0) - (quote?.valor_frete || 0)))}
              </Typography>
              <Typography variant="subtitle2" color="primary.main">
                Fretes:{" "}
                {formatCurrency(Number(quote?.valor_frete || 0))}
              </Typography>
              <Typography variant="subtitle2" color="success.main">
                Custo total:{" "}
                {formatCurrency(Number(quote?.valor_total || 0))}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <QuoteItemsTable hideFooter={false} tableMaxHeight={600} />
      </Dialog>

      {/* Dialog de confirmação para voltar sem anexos */}
      <Dialog open={showAttachmentDialog} onClose={cancelNavigation}>
        <DialogTitle>Confirmação de navegação</DialogTitle>
        <DialogContent>
          <Typography>
            Você tem certeza que deseja voltar sem criar nenhum anexo na
            cotação?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={cancelNavigation}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={confirmNavigation}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuoteDetailPage;

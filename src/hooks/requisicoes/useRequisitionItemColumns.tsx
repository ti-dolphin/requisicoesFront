import React, { ChangeEvent, useCallback, useEffect, useState, useMemo } from "react";
import {
  GridColDef,
  GridEditInputCell,
  GridRenderEditCellParams,
} from "@mui/x-data-grid";
import {
  calculateQuoteSubtotal,
  calculateUnitPriceWithTaxes,
  formatCurrency2To3,
  formatDecimalPtBr,
  getDateFromISOstring,
} from "../../utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import DeleteIcon from "@mui/icons-material/Delete";
import { Badge, BadgeProps, Box, Checkbox, IconButton, styled, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  setCurrentQuoteIdSelected,
  setItemBeingReplaced,
  setReplacingItemProduct,
  setViewingItemAttachment,
  setViewingItemAttachmentType,
} from "../../redux/slices/requisicoes/requisitionItemSlice";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import FillAllDialog from "../../components/shared/FillAllDialog";
import RequisitionItemService from "../../services/requisicoes/RequisitionItemService";
import { useParams } from "react-router-dom";
import { QuoteItem } from "../../models/requisicoes/QuoteItem";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileIcon from '@mui/icons-material/FilePresent';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { calculateColumnWidth } from "../../utils/calculateColumnWidth";

const StyledBadge = styled(Badge)<BadgeProps>(() => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    padding: "0 4px",
  },
}));

// O editor padrão do grid aplica o valor digitado com debounce (~200ms);
// trocando de célula rapidamente o commit acontecia antes do valor pendente
// ser aplicado e o PUT ia sem a alteração. debounceMs={0} aplica a cada tecla.
const renderInstantEditCell = (params: GridRenderEditCellParams) => (
  <GridEditInputCell {...params} debounceMs={0} />
);

export const useRequisitionItemColumns = (
  addingReqItems: boolean,
  editItemFieldsPermitted: boolean,
  handleDeleteItem: (id_item_requisicao: number) => Promise<void>,
  handleFillOCS: (ocValue: number) => void,
  handleFillShippingDate: (date: string) => void,
  handleChangeQuoteItemsSelected: (
    e: React.ChangeEvent<HTMLInputElement>,
    id_item_cotacao: number,
    id_item_requisicao: number
  ) => void,
  quoteItemsSelected: Map<number, number>,
  selectionModel: number[],
  blockFields: boolean
) => {
  const dispatch = useDispatch();
  const { id_requisicao } = useParams();
  const [fillingOC, setFillingOC] = useState(false);
  const [ocValue, setOcValue] = useState<number | null>(null);
  const [fillingShippingDate, setFillingShippingDate] = useState(false);
  const [shippingDate, setShippingDate] = useState<string>("");
  const [rawDinamicColumns, setRawDinamicColumns] = useState<GridColDef[]>([]);

  const user = useSelector((state: RootState) => state.user.user);

  const { updatingRecentProductsQuantity } = useSelector(
    (state: RootState) => state.requisitionItem
  );

  const attendingItems = useSelector((state: RootState) => state.attendingItemsSlice.attendingItems);
  const items = useSelector((state: RootState) => state.requisitionItem.items);
  const requisition = useSelector((state: RootState) => state.requisition.requisition);
  const hasStockToPurchaseSplit = useMemo(
    () =>
      items.some(
        (item) => item.quantidade_solicitada != null || item.quantidade_estoque != null
      ),
    [items]
  );

  // O anexo de NF só deve ficar disponível a partir da etapa "Lançar NF"
  // (a etapa seguinte/final é "Concluído").
  const canViewNfAttachment = useMemo(() => {
    const statusName = (requisition.status?.nome ?? "").toLowerCase().trim();
    return statusName === "lançar nf" || statusName === "concluído";
  }, [requisition.status?.nome]);

  // Calcula a largura dinâmica da coluna de descrição
  const descriptionColumnWidth = useMemo(() =>
    calculateColumnWidth(items, 'produto_descricao', 'Descrição', undefined, undefined, 200, 600),
    [items]
  );

  // Largura dinâmica da observação, no mesmo padrão da descrição. A célula
  // renderiza o texto em negrito (~13px), então medimos com a mesma fonte —
  // medir com a fonte normal/menor subestimava a largura e cortava o texto.
  // O espaço extra cobre o botão de copiar + gap que dividem a célula.
  const OBSERVACAO_ICON_ALLOWANCE = 30;
  const observacaoColumnWidth = useMemo(() =>
    calculateColumnWidth(items, 'observacao', 'Observação', undefined, 'bold 13px Roboto', 100, 600) +
    OBSERVACAO_ICON_ALLOWANCE,
    [items]
  );

  const handleSelectQuoteId = (quoteId: number, e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.checked;
    if (selected) {
      dispatch(setCurrentQuoteIdSelected(quoteId));
      return;
    }
    dispatch(setCurrentQuoteIdSelected(null));
  };

  const concludeFillingOC = useCallback(async () => {
    if (!ocValue) {
      dispatch(
        setFeedback({
          message: "Digite um valor para preencher a OC",
          type: "error",
        })
      );
      return;
    }
    await handleFillOCS(ocValue);
    setOcValue(null);
    setFillingOC(false);
  }, [dispatch, handleFillOCS, ocValue]);

  const concludeFillingShippingDate = useCallback(async () => {
    if (!shippingDate) {
      dispatch(
        setFeedback({
          message: "Data inválida",
          type: "error",
        })
      );
      return;
    }
    await handleFillShippingDate(shippingDate);
    setShippingDate("");
    setFillingShippingDate(false);
  }, [dispatch, handleFillShippingDate, shippingDate]);

  const handleChangeshippingDate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setShippingDate(e.target.value);
    },
    []
  );

  const openOCDialog = useCallback(() => {
    if (!selectionModel.length) {
      dispatch(
        setFeedback({
          message: "Selecione os itens para preencher a OC",
          type: "error",
        })
      );
      return;
    }
    setFillingOC(true);
  }, [dispatch, selectionModel]);

  const openShippingDateDialog = useCallback(() => {
    if (!selectionModel.length) {
      dispatch(
        setFeedback({
          message: "Selecione os itens para preencher a data de entrega",
          type: "error",
        })
      );
      return;
    }
    setFillingShippingDate(true);
  }, [dispatch, selectionModel]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: "id_item_requisicao",
      headerName: "ID",
      type: "number",
      width: 50,
    },
    {
      field: "produto_codigo",
      headerName: "Cód. Produto",
      type: "string",
      width: 100,
    },
    {
      field: "produto_descricao",
      headerName: "Descrição",
      type: "string",
      width: descriptionColumnWidth,
      flex: 0,
      renderCell: (params: any) => (
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            height: "100%" 
          }}
        >
          <Typography 
            fontSize="11px" 
            fontWeight="bold"
            sx={{
              whiteSpace: 'normal'
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "quantidade_atendida",
      headerName: "Atender",
      type: "number",
      width: 100,
      editable: true,
      renderEditCell: renderInstantEditCell,
    },
    {
      field: "quantidade",
      headerName: attendingItems
        ? "Quantidade solicitada"
        : hasStockToPurchaseSplit
          ? "Comprar"
          : "QTD",
      type: "number",
      editable: attendingItems ? false : true,
      renderEditCell: renderInstantEditCell,
      width: attendingItems ? 200 : 100,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            height: "100%",
          }}
        >
          <Typography fontSize="small" fontWeight="bold">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      // Sem type "number" de propósito: o editor numérico do DataGrid rejeita
      // vírgula como separador decimal (padrão pt-BR). A conversão para número
      // acontece só no commit (processRowUpdate), senão o separador some
      // enquanto o usuário digita.
      field: "target_price",
      headerName: "Valor alvo unitário",
      width: 120,
      editable: attendingItems ? false : true,
      align: "right",
      headerAlign: "right",
      sortComparator: (a: any, b: any) => Number(a || 0) - Number(b || 0),
      renderEditCell: renderInstantEditCell,
      renderCell: (params: any) =>
        params.value !== null && params.value !== undefined && params.value !== ""
          ? formatDecimalPtBr(Number(params.value))
          : "",
    },
    {
      field: "data_necessidade",
      headerName: "Data de necessidade",
      type: "date",
      width: 140,
      editable: attendingItems ? false : true,
      valueGetter: (data_necessidade: string) =>
        data_necessidade ? getDateFromISOstring(data_necessidade) : null,
    },  
    {
      field: "quantidade_disponivel",
      headerName: "Estoque",
      type: "number",
      width: 120,
      editable: false,
      renderCell: (params: any) => {
        const value = params.value;
        const hasStock = value && value > 0;
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              height: "100%",
              width: "100%",
            }}
          >
            <Typography 
              fontSize="small" 
              fontWeight="bold"
              color={hasStock ? "success.main" : "error.main"}
            >
              {value || 0}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "quantidade_solicitada",
      headerName: "Solicitado",
      type: "number",
      width: 120,
      editable: false,
      valueGetter: (value: any, row: any) => {
        if (value !== null && value !== undefined) {
          return value;
        }
        if (row?.quantidade_estoque !== null && row?.quantidade_estoque !== undefined) {
          return Number(row.quantidade || 0) + Number(row.quantidade_estoque || 0);
        }
        return row?.quantidade || 0;
      },
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            height: "100%",
          }}
        >
          <Typography fontSize="small" fontWeight="bold">
            {params.value ?? 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: "quantidade_estoque",
      headerName: "Estoque",
      type: "number",
      width: 110,
      editable: false,
      valueGetter: (value: any) => Number(value || 0),
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            height: "100%",
            width: "100%",
          }}
        >
          <Typography fontSize="small" fontWeight="bold" color="success.main">
            {params.value || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: "data_entrega",
      headerName: "Data de entrega",
      width: 150,
      type: "date",
      editable: true,
      minWidth: 100,
      valueGetter: (data_entrega: string) =>
        data_entrega ? getDateFromISOstring(data_entrega) : null,
      renderHeader: () => (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography fontSize="12px" fontWeight="bold" color="primary">
            Data entrega
          </Typography>
          {editItemFieldsPermitted || user?.PERM_COMPRADOR && (
            <Tooltip title="Preencher">
              <IconButton
                onClick={openShippingDateDialog}
                sx={{ height: 20, width: 20 }}
              >
                <ArticleOutlinedIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Tooltip>
          )}
          {editItemFieldsPermitted && (
            <FillAllDialog
              open={fillingShippingDate}
              onClose={() => setFillingShippingDate(false)}
              onChange={handleChangeshippingDate}
              onConfirm={concludeFillingShippingDate}
              value={shippingDate}
              label="Data de entrega"
              type="date"
              title="Digite a data desejada para preencher todos os itens"
            />
          )}
        </Box>
      ),
    },
    {
      field: "produto_unidade",
      headerName: "Unidade",
      type: "string",
      editable: true,
      renderEditCell: renderInstantEditCell,
      sortable: false,
      minWidth: 70,
    },
    {
      field: "oc",
      headerName: "OC",
      editable: true,
      renderEditCell: renderInstantEditCell,
      type: "string",
      // 0 é o default do banco e significa "sem OC": exibe e edita como vazio.
      // O guard de no-op da tabela também trata 0 e "" como equivalentes.
      valueGetter: (oc: string) => {
        const value = String(oc ?? "").trim();
        return value === "0" ? "" : value;
      },
      minWidth: 100,
      renderHeader: () => (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography fontSize="12px" fontWeight="bold" color="primary">
            OC
          </Typography>
          {editItemFieldsPermitted || user?.PERM_COMPRADOR && (
            <Tooltip title="Preencher">
              <IconButton onClick={openOCDialog} sx={{ height: 20, width: 20 }}>
                <ArticleOutlinedIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Tooltip>
          )}
          {editItemFieldsPermitted && (
            <FillAllDialog
              open={fillingOC}
              onClose={() => setFillingOC(false)}
              onConfirm={concludeFillingOC}
              value={ocValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOcValue(Number(e.target.value))
              }
              label="Número da OC"
              type="number"
              title="Digite o valor desejado para preencher todos os itens"
            />
          )}
        </Box>
      ),
    },
    {
      field: "observacao",
      headerName: "Observação",
      type: "string",
      editable: true,
      renderEditCell: renderInstantEditCell,
      // O "N/A" é só exibição (renderCell); no valueGetter ele contaminava o
      // valor de edição e clicar/sair da célula gravava "N/A" no banco.
      valueGetter: (observacao: string) => observacao ?? "",
      width: observacaoColumnWidth,
      flex: 0,
      minWidth: 100,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            height: "100%",
          }}
        >
          <Tooltip title="Copiar observação">
            <IconButton
              onClick={() => navigator.clipboard.writeText(params.value)}
              sx={{ padding: 0, flexShrink: 0 }}
            >
              <ContentCopyIcon sx={{ fontSize: 11 }} />
            </IconButton>
          </Tooltip>
          <Typography 
            sx={{
              whiteSpace: 'normal',
              fontSize: '12px'
            }}
          >
            {String(params?.value ?? '')}
          </Typography>
        </Box>
      ),
    },
    {
      field: "melhor_preco",
      headerName: "Melhor Preço",
      type: "number",
      minWidth: 120,
      sortable: true,
      valueGetter: (value: any, row: any) => {
        if (!row.items_cotacao || row.items_cotacao.length === 0) {
          return null;
        }
        const prices = row.items_cotacao
          .filter((item: any) => item && item.preco_unitario > 0 && !item.indisponivel)
          .map((item: any) =>
            calculateUnitPriceWithTaxes(
              Number(item.preco_unitario || 0),
              Number(item.IPI || 0),
              Number(item.ST || 0)
            )
          );
        
        return prices.length > 0 ? Math.min(...prices) : null;
      },
      renderCell: (params) => {
        const price = params.value;
        if (price === null || price === undefined) {
          return (
            <Typography fontSize="small" color="text.secondary">
              -
            </Typography>
          );
        }
        return (
          <Typography fontSize="small" fontWeight="bold" color="success.main">
            {formatCurrency2To3(Number(price || 0))}
          </Typography>
        );
      },
    },
    {
      field: "total_linha",
      headerName: "Total da linha",
      type: "number",
      minWidth: 140,
      sortable: true,
      valueGetter: (_value: any, row: any) => {
        const selectedQuoteItemId = Number(row?.id_item_cotacao || 0);
        if (!selectedQuoteItemId) {
          return null;
        }

        const selectedQuoteItem = row.items_cotacao?.find(
          (item: any) => Number(item.id_item_cotacao) === selectedQuoteItemId
        );

        if (!selectedQuoteItem || Number(selectedQuoteItem.indisponivel) > 0) {
          return null;
        }

        const unitPrice = Number(selectedQuoteItem.preco_unitario || 0);
        const quantity = Number(row.quantidade || 0);
        return calculateQuoteSubtotal(
          unitPrice,
          quantity,
          Number(selectedQuoteItem.IPI || 0),
          Number(selectedQuoteItem.ST || 0)
        );
      },
      renderCell: (params: any) => {
        if (params.value === null || params.value === undefined) {
          return (
            <Typography fontSize="small" color="text.secondary">
              -
            </Typography>
          );
        }

        return (
          <Typography fontSize="small" fontWeight="bold" color="success.main">
            {formatCurrency2To3(Number(params.value || 0))}
          </Typography>
        );
      },
    },
    {
      field: "actions",
      headerName: "Ações",
      type: "actions",
      minWidth: 140,
      renderCell: (row) => {
        const { id } = row;
        const anexos = row.row.anexos ?? [];
        const normalAttachmentsCount = anexos.filter(
          (anexo: any) => (anexo.tipo ?? 1) !== 2
        ).length;
        const nfAttachmentsCount = anexos.filter(
          (anexo: any) => anexo.tipo === 2
        ).length;

        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.4,
            }}
          >
            {editItemFieldsPermitted && (
              <Tooltip title="Excluir item">
                <IconButton
                  disabled={blockFields}
                  onClick={() => handleDeleteItem(Number(id))}
                  color="error"
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
            {editItemFieldsPermitted && (
              <Tooltip title="Substituir produto">
                <IconButton
                  onClick={() => {
                    dispatch(setReplacingItemProduct(true));
                    dispatch(setItemBeingReplaced(Number(id)));
                  }}
                  sx={{ color: "primary.main" }}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Anexos">
              <IconButton
                onClick={() => {
                  dispatch(setViewingItemAttachmentType(1));
                  dispatch(setViewingItemAttachment(Number(id)));
                }}
                sx={{ height: 24, width: 24 }}
              >
                {normalAttachmentsCount > 0 ? (
                  <StyledBadge
                    variant="standard"
                    badgeContent={normalAttachmentsCount}
                    color="primary"
                  >
                    <FileIcon sx={{ fontSize: 14 }} />
                  </StyledBadge>
                ) : (
                  <FileIcon sx={{ fontSize: 14 }} />
                )}
              </IconButton>
            </Tooltip>
            {canViewNfAttachment && (
              <Tooltip title="Anexo NF">
                <IconButton
                  onClick={() => {
                    dispatch(setViewingItemAttachmentType(2));
                    dispatch(setViewingItemAttachment(Number(id)));
                  }}
                  sx={{ height: 24, width: 24 }}
                >
                  {nfAttachmentsCount > 0 ? (
                    <StyledBadge
                      variant="standard"
                      badgeContent={nfAttachmentsCount}
                      color="secondary"
                    >
                      <ReceiptLongIcon sx={{ fontSize: 14 }} />
                    </StyledBadge>
                  ) : (
                    <ReceiptLongIcon sx={{ fontSize: 14 }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ], [
    descriptionColumnWidth,
    observacaoColumnWidth,
    attendingItems,
    hasStockToPurchaseSplit,
    canViewNfAttachment,
    editItemFieldsPermitted,
    user?.PERM_COMPRADOR,
    blockFields,
    fillingOC,
    ocValue,
    fillingShippingDate,
    shippingDate,
    openOCDialog,
    openShippingDateDialog,
    concludeFillingOC,
    concludeFillingShippingDate,
    handleChangeshippingDate,
    handleDeleteItem,
    dispatch,
  ]);

  // Definindo filteredColumns para sempre executar hooks depois
  const filteredColumns = useMemo(() => {
    const nonDefaultColumns = [
      "produto_quantidade_disponivel",
      "quantidade_atendida",
      "quantidade_disponivel",
      "quantidade_solicitada",
      "quantidade_estoque",
    ];
    let filtered = columns.filter((col) => !nonDefaultColumns.includes(col.field));

    if (hasStockToPurchaseSplit && !updatingRecentProductsQuantity && !addingReqItems && !attendingItems) {
      const fieldsToShow = ["quantidade_solicitada", "quantidade_estoque"];
      const stockFlowColumns = columns.filter((col) => fieldsToShow.includes(col.field));
      filtered = [...filtered, ...stockFlowColumns];

      const quantityFlowOrder = ["quantidade_solicitada", "quantidade", "quantidade_estoque"];
      const quantityFlowColumns = quantityFlowOrder
        .map((field) => filtered.find((col) => col.field === field))
        .filter(Boolean) as GridColDef[];
      const remainingColumns = filtered.filter(
        (col) => !quantityFlowOrder.includes(col.field)
      );
      filtered = [...quantityFlowColumns, ...remainingColumns];
    }

    // Se a requisição está no escopo de estoque (id_escopo_requisicao = 1), incluir coluna de estoque
    const isStockScope = requisition?.id_escopo_requisicao === 1;
    if (isStockScope && !updatingRecentProductsQuantity && !addingReqItems && !attendingItems) {
      // Incluir a coluna quantidade_disponivel
      const stockColumn = columns.find(col => col.field === "quantidade_disponivel");
      if (stockColumn && !filtered.includes(stockColumn)) {
        filtered = [...filtered, stockColumn];
      }
    }

    if (updatingRecentProductsQuantity) {
      const selectedColumns = [
        "produto_descricao",
        "quantidade",
        "produto_quantidade_disponivel",
      ];
      filtered = columns.filter((col) =>
        selectedColumns.includes(col.field)
      );
    }
    if (addingReqItems) {
      filtered = columns.filter((col) =>
        ["produto_descricao"].includes(col.field)
      );
    }
    if (attendingItems) {
      filtered = columns.filter((col) =>
        [
          "produto_descricao",
          "quantidade_atendida",
          "quantidade",
          "quantidade_disponivel",
        ].includes(col.field)
      );
    }
    return filtered;
  }, [
    columns,
    hasStockToPurchaseSplit,
    updatingRecentProductsQuantity,
    addingReqItems,
    attendingItems,
    requisition?.id_escopo_requisicao,
  ]);


  const fetchDinamicColumns = useCallback(async () => {
    try {
      const rawCols = await RequisitionItemService.getDinamicColumns(
        Number(id_requisicao)
      );
      setRawDinamicColumns(rawCols);
    } catch (e) {
      console.error('[useRequisitionItemColumns] Erro ao buscar colunas dinâmicas', e);
      dispatch(
        setFeedback({
          message: "Erro ao buscar colunas dinâmicas",
          type: "error",
        })
      );
    }
  }, [dispatch, id_requisicao]);

  const dinamicColumns = useMemo(() => {
    return rawDinamicColumns.map((col: GridColDef) => ({
      ...col,
      editable: true,
      // Permite ordenação correta pelo valor numérico do preço cotado
      valueGetter: (value: any, row: any) => {
        if (!row) return null;
        const quoteItem = row.items_cotacao?.find(
          (item: QuoteItem) => Number(item.id_cotacao) === Number(col.field)
        );
        return quoteItem && !quoteItem.indisponivel
          ? calculateUnitPriceWithTaxes(
              Number(quoteItem.preco_unitario || 0),
              Number(quoteItem.IPI || 0),
              Number(quoteItem.ST || 0)
            )
          : null;
      },
      renderCell: (params: any) => {
        const { id_item_requisicao } = params.row;
        const quoteItem = params.row.items_cotacao.find(
          (item: QuoteItem) =>
            Number(item.id_cotacao) === Number(params.field)
        );
        const hasquoteItem = quoteItem && !quoteItem.indisponivel;
        const parciallyQuoted = hasquoteItem
          ? Number(quoteItem.quantidade_cotada) <
            Number(quoteItem.quantidade_solicitada)
          : false;
        const priceWithTaxes = hasquoteItem
          ? calculateUnitPriceWithTaxes(
              Number(quoteItem?.preco_unitario || 0),
              Number(quoteItem?.IPI || 0),
              Number(quoteItem?.ST || 0)
            )
          : null;

        return (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {hasquoteItem && priceWithTaxes !== null &&
              formatCurrency2To3(Number(priceWithTaxes) || 0)}
            {hasquoteItem && (
              <Checkbox
                disabled={blockFields || !editItemFieldsPermitted}
                onChange={(e) =>
                  handleChangeQuoteItemsSelected(
                    e,
                    Number(quoteItem?.id_item_cotacao),
                    Number(id_item_requisicao)
                  )
                }
                checked={
                  quoteItemsSelected.get(Number(id_item_requisicao)) ===
                  Number(quoteItem?.id_item_cotacao)
                    ? true
                    : false
                }
                icon={<RadioButtonUncheckedIcon sx={{ fontSize: 14 }} />}
                checkedIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                sx={{ color: "primary.main" }}
              />
            )}
            {quoteItem?.indisponivel > 0 && (
              <Tooltip
                title={`Indisponível no fornecedor: ${col.headerName}`}
              >
                <ErrorIcon color="error" sx={{ fontSize: 14 }} />
              </Tooltip>
            )}
            {parciallyQuoted && (
              <Tooltip
                title={`Quantidade cotada: ${quoteItem?.quantidade_cotada}`}
              >
                <ErrorIcon color="secondary" sx={{ fontSize: 14 }} />
              </Tooltip>
            )}
          </Box>
        );
      },
      minWidth: 200,
      sortable: true,
      renderHeader: (params: any) => {
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              fontSize="0.7rem"
              fontWeight="bold"
              color="primary"
            >
              {params.colDef.headerName}
            </Typography>
          </Box>
        );
      },
    }));
  }, [
    rawDinamicColumns,
    handleChangeQuoteItemsSelected,
    quoteItemsSelected,
    blockFields,
    editItemFieldsPermitted,
  ]);

  const isDinamicField = useCallback(
    (field: string | number): boolean => {
      const result = dinamicColumns.some((col) => col.field === field);
      return result;
    },
    [dinamicColumns]
  );

  const allItemsHaveCotacao =
    items.length > 0 &&
    items.every((item: any) => Array.isArray(item.items_cotacao));

  const selectedQuoteItemsKey = useMemo(
    () =>
      items
        .map(
          (item: any) =>
            `${item.id_item_requisicao}:${item.id_item_cotacao ?? 0}:${item.quantidade ?? 0}`
        )
        .join("|"),
    [items]
  );

  useEffect(() => {
    setRawDinamicColumns([]);
  }, [id_requisicao]);

  useEffect(() => {
    if (!id_requisicao || isNaN(Number(id_requisicao))) {
      return;
    }
    if (addingReqItems) {
      return;
    }
    if (updatingRecentProductsQuantity) {
      return;
    }
    if (!allItemsHaveCotacao) {
      return;
    }
    fetchDinamicColumns();
  }, [
    fetchDinamicColumns,
    addingReqItems,
    updatingRecentProductsQuantity,
    id_requisicao,
    allItemsHaveCotacao,
    selectedQuoteItemsKey,
  ]);

  return useMemo(() => {
    return {
      columns:
        dinamicColumns.length > 0
          ? [...filteredColumns, ...dinamicColumns]
          : filteredColumns,
      fillingOC,
      ocValue,
      fillingShippingDate,
      shippingDate,
      dinamicColumns,
      isDinamicField,
    };
  }, [
    dinamicColumns,
    filteredColumns,
    fillingOC,
    ocValue,
    fillingShippingDate,
    shippingDate,
    isDinamicField,
  ]);
};

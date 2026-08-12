import {
  GridCellModes,
  GridCellModesModel,
  GridCellParams,
  GridCloseIcon,
  GridRowModel,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRequisitionItemColumns } from "../../hooks/requisicoes/useRequisitionItemColumns";
import { RequisitionItem } from "../../models/requisicoes/RequisitionItem";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import RequisitionItemService from "../../services/requisicoes/RequisitionItemService";
import BaseDataTable from "../shared/BaseDataTable";
import BaseTableToolBar from "../shared/BaseTableToolBar";
import { debounce } from "lodash";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { useRequisitionItemPermissions } from "../../hooks/requisicoes/useRequisitionITemPermissions";
import {
  removeItem,
  replaceItem,
  setCurrentQuoteIdSelected,
  setItems,
  setProductsAdded,
  setRefresh,
  setSelectedQuote,
  setUpdatingChildReqItems,
  setUpdatingRecentProductsQuantity,
  setViewingItemAttachment,
} from "../../redux/slices/requisicoes/requisitionItemSlice";
import QuoteService from "../../services/requisicoes/QuoteService";
import { useNavigate, useParams } from "react-router-dom";
import { Quote } from "../../models/requisicoes/Quote";
import { QuoteItemService } from "../../services/requisicoes/QuoteItemService";
import {
  setAddingReqItems,
  setQuoteItems,
} from "../../redux/slices/requisicoes/quoteItemSlice";

import {
  setRefreshRequisition,
  updateRequisitionField,
} from "../../redux/slices/requisicoes/requisitionSlice";
import { toggleRefreshReqComments } from "../../redux/slices/requisicoes/requisitionCommentSlice";
import {
  formatDateStringtoISOstring,
  formatDateToISOstring,
  getDateFromISOstring,
  getDateKey,
  normalizeOcValue,
  normalizeText,
} from "../../utils";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import RequisitionTrackingDialog from "../mercadoLivre/RequisitionTrackingDialog";
import RequisitionService from "../../services/requisicoes/RequisitionService";
import UpdateChildReqItemsDialog from "./UpdateChildReqItemsDialog";
import { useIsMobile } from "../../hooks/useIsMobile";
import RequisitionItemAttachmentList from "./RequisitionItemAttachmentList";
import {
  setItemsToAttend,
  setNotAttendedItems,
} from "../../redux/slices/requisicoes/attenItemsSlice";
import { useUserOptions } from "../../hooks/useUserOptions";
import { useProjectOptions } from "../../hooks/projectOptionsHook";
import { usePatrimonyTypeOptions } from "../../hooks/patrimonios/usePatrimonyTypeOptions";
import { PatrimonyService } from "../../services/patrimonios/PatrimonyService";
import MovementationService from "../../services/patrimonios/MovementationService";
import ElegantInput from "../shared/ui/Input";
import OptionsField from "../shared/ui/OptionsField";
import StickyHorizontalScrollbar from "../shared/StickyHorizontalScrollbar";
import {
  RequisitionItemsTableProps,
  PatrimonyFormData,
} from "../../models/requisicoes/RequisitionItemsTable";

const RequisitionItemsTable = ({
  tableMaxHeight,
  hideFooter,
}: RequisitionItemsTableProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { id_requisicao } = useParams();

  const { requisition, refreshRequisition } = useSelector(
    (state: RootState) => state.requisition
  );
  const attendingItems = useSelector(
    (state: RootState) => state.attendingItemsSlice.attendingItems
  );
  const quote = useSelector((state: RootState) => state.quote.quote);
  const quoteItems = useSelector(
    (state: RootState) => state.quoteItem.quoteItems
  );
  const addingReqItems = useSelector(
    (state: RootState) => state.quoteItem.addingReqItems
  );
  const user = useSelector((state: RootState) => state.user.user);
  const {
    items,
    newItems,
    updatingRecentProductsQuantity,
    refresh,
    currentQuoteIdSelected,
    selectedQuote,
    updatingChildReqItems,
    viewingItemAttachment,
    viewingItemAttachmentType,
  } = useSelector((state: RootState) => state.requisitionItem);

  const { isMobile } = useIsMobile();
  const gridApiRef = useGridApiRef();
  const permissionsFromHook = useRequisitionItemPermissions(user, requisition);
  const { userOptions } = useUserOptions();
  const { projectOptions } = useProjectOptions();
  const { patirmonyTypeOptions } = usePatrimonyTypeOptions();

  const [quotesTotal, setQuotesTotal] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cellModesModel, setCellModesModel] = React.useState<GridCellModesModel>({});
  const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>([]);
  const [quoteItemsSelected, setQuoteItemsSelected] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const [blockFields, setBlockFields] = useState(false);
  const [quoteListOpen, setQuoteListOpen] = useState<boolean>(false);
  const [patrimonyDialogOpen, setPatrimonyDialogOpen] = useState(false);
  const [selectedPatrimonyItem, setSelectedPatrimonyItem] = useState<RequisitionItem | null>(null);
  const [savingPatrimony, setSavingPatrimony] = useState(false);
  const [createdPatrimonyItemIds, setCreatedPatrimonyItemIds] = useState<Set<number>>(new Set());
  const [patrimonyFormData, setPatrimonyFormData] = useState<PatrimonyFormData>({
    nome: "",
    descricao: "",
    nserie: "",
    tipo: 0,
    valor_compra: 0,
    calibracao: 0,
    data_proxima_calibracao: "",
    responsavel: undefined,
    projeto: undefined,
  });

  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);

  const codigosMl = useMemo(
    () => [
      ...new Set(
        items
          .map((item: any) => String(item.codigo_ml ?? "").trim())
          .filter((codigo: string) => codigo !== "")
      ),
    ],
    [items]
  );

  const itemsRef = React.useRef(items);
  const pendingRowUpdates = React.useRef<Map<number, number>>(new Map());
  const fetchSeqRef = React.useRef(0);

  const permissions = useMemo(() => {
    if (!requisition?.status) {
      return { editItemFieldsPermitted: false, createQuotePermitted: false };
    }
    
    const isBuyer = Number(user?.PERM_COMPRADOR) === 1;
    const isReceivingStep = requisition.status?.nome?.toLowerCase() === "recebimento" || requisition.status?.nome?.toLowerCase() === "lançar nf"

    if (isBuyer && isReceivingStep) {
      return {
        editItemFieldsPermitted: true,
        createQuotePermitted: permissionsFromHook.createQuotePermitted,
      };
    }
    
    return permissionsFromHook;

  }, [permissionsFromHook, requisition?.status, user]);
  const { editItemFieldsPermitted, createQuotePermitted } = permissions;

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const handleDeleteItem = useCallback(
    async (id_item_requisicao: number) => {
      setBlockFields(true);
      try {
        const updatedItems = itemsRef.current.filter(
          (item) => item.id_item_requisicao !== id_item_requisicao
        );
        dispatch(removeItem(id_item_requisicao));
        await RequisitionItemService.delete(id_item_requisicao);
        dispatch(setRefreshRequisition(!refreshRequisition));
        dispatch(
          setProductsAdded(
            updatedItems.map((item: RequisitionItem) => item.id_produto)
          )
        );
        setBlockFields(false);
        return;
      } catch (e: any) {
        dispatch(setRefreshRequisition(!refreshRequisition));
        dispatch(
          setFeedback({ message: "Erro ao excluir itens", type: "error" })
        );
        setBlockFields(false);
      }
    },
    [dispatch, refreshRequisition]
  );

  const handleFillOCS = useCallback(
    async (ocValue: number) => {
      try {
        const itemsWithOC = await RequisitionItemService.updateOCS(
          selectionModel as number[],
          ocValue
        );
        if (itemsWithOC) {
          setSelectionModel([]);
          dispatch(setRefresh(!refresh));
        }
      } catch (e: any) {
        dispatch(
          setFeedback({ message: "Erro ao preencher OC", type: "error" })
        );
      }
    },
    [dispatch, refresh, selectionModel]
  );

  const handleFillShippingDate = useCallback(
    async (date: string) => {
      if (!date) {
        dispatch(
          setFeedback({
            message: "Data inválida ou no formato errado",
            type: "error",
          })
        );
        return;
      }
      if (date) {
        const isoDate = formatDateStringtoISOstring(date);
        try {
          const itemsWithShippingDate =
            await RequisitionItemService.updateShippingDate(
              selectionModel as number[],
              isoDate
            );
          if (itemsWithShippingDate) {
            setSelectionModel([]);
            dispatch(setRefresh(!refresh));
          }
        } catch (e) {
          dispatch(
            setFeedback({
              message: "Erro ao preencher data de entrega",
              type: "error",
            })
          );
        }
      }
    },
    [dispatch, refresh, selectionModel]
  );

  const recalculateQuoteItemsTotals = useCallback(async () => {
    try {
      const { custo_total_itens, custo_total_frete } =
        await RequisitionItemService.recalculateQuoteItemsTotals(
          Number(id_requisicao)
        );
      dispatch(
        updateRequisitionField({ field: "custo_total_itens", value: custo_total_itens })
      );
      dispatch(
        updateRequisitionField({ field: "custo_total_frete", value: custo_total_frete })
      );
    } catch (error: any) {
      dispatch(
        setFeedback({
          message: "Erro ao recalcular o total da requisição",
          type: "error",
        })
      );
    }
  }, [dispatch, id_requisicao]);

  const debouncedRecalculateTotals = useMemo(
    () => debounce(recalculateQuoteItemsTotals, 2000),
    [recalculateQuoteItemsTotals]
  );

  useEffect(
    () => () => {
      debouncedRecalculateTotals.flush();
    },
    [debouncedRecalculateTotals]
  );

  const handleChangeQuoteItemsSelected = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      id_item_cotacao: number,
      id_item_requisicao: number
    ) => {
      const isChecking = e.target.checked;

      if (!isChecking && requisition.status?.nome.toLowerCase() !== "em cotação") {
        dispatch(
          setFeedback({
            message: "Apenas itens em cotação podem ser removidos",
            type: "error",
          })
        );
        return;
      }

      const nextSelectedQuoteItem = isChecking ? id_item_cotacao : null;
      setBlockFields(true);

      try {
        await RequisitionItemService.updateQuoteItemsSelected(
          id_item_requisicao,
          nextSelectedQuoteItem
        );
        setQuoteItemsSelected((previous) => {
          const next = new Map(previous);
          if (nextSelectedQuoteItem) {
            next.set(id_item_requisicao, nextSelectedQuoteItem);
          } else {
            next.delete(id_item_requisicao);
          }
          return next;
        });
        const currentItem = itemsRef.current.find(
          (item) => item.id_item_requisicao === id_item_requisicao
        );
        if (currentItem) {
          dispatch(
            replaceItem({
              id_item_requisicao,
              updatedItem: {
                ...currentItem,
                id_item_cotacao: nextSelectedQuoteItem ?? undefined,
              },
            })
          );
        }
        debouncedRecalculateTotals();
      } catch (error: any) {
        dispatch(
          setFeedback({
            message: "Erro ao atualizar fornecedor selecionado",
            type: "error",
          })
        );
      } finally {
        setBlockFields(false);
      }
    },
    [requisition, dispatch, debouncedRecalculateTotals]
  );

  const handleCopySelectedItems = useCallback(async () => {
    const selectedIds = new Set(selectionModel.map((id) => Number(id)));
    const selectedItems = itemsRef.current.filter((item) =>
      selectedIds.has(item.id_item_requisicao)
    );
    if (selectedItems.length === 0) return;

    const formatDate = (value?: string | null) => {
      if (!value) return "";
      const date = getDateFromISOstring(value);
      return date ? date.toLocaleDateString("pt-BR") : "";
    };
    const sanitize = (value: any) =>
      String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
    const formatNumber = (value: any) =>
      value === null || value === undefined || value === ""
        ? ""
        : String(value).replace(".", ",");

    const header = [
      "ID",
      "Cód. Produto",
      "Descrição",
      "QTD",
      "Valor alvo unitário",
      "Data de necessidade",
      "Data entrega",
      "Unidade",
      "OC",
    ];
    const rows = selectedItems.map((item: any) =>
      [
        item.id_item_requisicao,
        sanitize(item.produto_codigo || item.produto?.codigo),
        sanitize(item.produto_descricao || item.produto?.descricao),
        formatNumber(item.quantidade),
        formatNumber(item.target_price),
        formatDate(item.data_necessidade),
        formatDate(item.data_entrega),
        sanitize(item.produto_unidade || item.produto?.unidade),
        sanitize(item.oc),
      ].join("\t")
    );

    try {
      await navigator.clipboard.writeText(
        [header.join("\t"), ...rows].join("\n")
      );
      dispatch(
        setFeedback({
          message: `${selectedItems.length} ${
            selectedItems.length === 1 ? "item copiado" : "itens copiados"
          }`,
          type: "success",
        })
      );
    } catch {
      dispatch(
        setFeedback({ message: "Erro ao copiar itens", type: "error" })
      );
    }
  }, [dispatch, selectionModel]);

  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const tableWrapperRef = React.useRef<HTMLDivElement>(null);

  const { columns, isDinamicField, dinamicColumns } = useRequisitionItemColumns(
    addingReqItems,
    editItemFieldsPermitted,
    handleDeleteItem,
    handleFillOCS,
    handleFillShippingDate,
    handleChangeQuoteItemsSelected,
    quoteItemsSelected,
    selectionModel as number[],
    blockFields
  );

  const [supplierFilter, setSupplierFilter] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!supplierFilter) return items;
    return items.filter((item: any) => {
      const selectedQuoteItemId =
        quoteItemsSelected.get(item.id_item_requisicao) ?? item.id_item_cotacao;
      if (!selectedQuoteItemId) return false;
      return item.items_cotacao?.some(
        (qi: any) =>
          Number(qi.id_cotacao) === Number(supplierFilter) &&
          Number(qi.id_item_cotacao) === Number(selectedQuoteItemId)
      );
    });
  }, [items, supplierFilter, quoteItemsSelected]);

  // autoHeight desliga a virtualização de linhas do DataGrid; acima de 30
  // linhas forçamos altura fixa para manter a tabela virtualizada e fluida.
  const effectiveMaxHeight = tableMaxHeight ?? (filteredItems.length > 30 ? 600 : undefined);
  const shouldUseAutoHeight = effectiveMaxHeight === undefined;

  const exceptionForBuyer = (field: string) => {
    if (!requisition.status) return;
    if (field !== "oc" && field !== "data_entrega") return false;
    const ocStatus = requisition.status?.nome.toLowerCase() === "comprar";
    const buyer = Number(user?.PERM_COMPRADOR) == 1;
    return ocStatus && buyer;
  };

  const isNonRegisteredItem = useCallback((row: any) => {
    const productCode = String(row?.produto_codigo || row?.produto?.codigo || "").trim();
    return productCode === "06.001.04.0002";
  }, []);

  const isCellEditable = useCallback(
    (params: GridCellParams) => {
      if (blockFields) return false;
      if (params.field === "produto_unidade") {
        return isNonRegisteredItem(params.row);
      }
      return Boolean(params.colDef.editable);
    },
    [isNonRegisteredItem, blockFields]
  );

  const mobileColumns = () => {
    const mobile = ["produto_descricao", "quantidade", "total_linha", "actions"];
    const filtered = columns.filter((column) => mobile.includes(column.field) || isDinamicField?.(column.field));
    filtered.forEach((column) => {
      if (column.field !== "actions") {
        column.minWidth = 160;
      }
    });
    return filtered;
  };
  const handleCellClick = (params: GridCellParams, event: React.MouseEvent) => {
    if (isDinamicField && isDinamicField(params.field)) {
      return;
    }

  const currentStatus = requisition.status?.nome?.toLowerCase();
    if (
      params.field === 'target_price' &&
      (currentStatus !== 'em edição' && currentStatus !== 'validação')
    ) {
      dispatch(
        setFeedback({
          message: `O campo selecionado não é editável`,
          type: "error",
        })
      );
      return;
    }

    if (params.field === "__check__") return;
    if (params.field === "actions") return;

    if (!params.isEditable) {
      dispatch(
        setFeedback({
          message: `O campo selecionado não é editável`,
          type: "error",
        })
      );
      return;
    }
    if (exceptionForBuyer(params.field)) {
      if (
        (event.target as any).nodeType === 1 &&
        !event.currentTarget.contains(event.target as Element)
      ) {
        return;
      }
      setCellModesModel((prevModel) => {
        return {
          ...Object.keys(prevModel).reduce(
            (acc, id) => ({
              ...acc,
              [id]: Object.keys(prevModel[id]).reduce(
                (acc2, field) => ({
                  ...acc2,
                  [field]: { mode: GridCellModes.View },
                }),
                {}
              ),
            }),
            {}
          ),
          [params.id]: {
            ...Object.keys(prevModel[params.id] || {}).reduce(
              (acc, field) => ({
                ...acc,
                [field]: { mode: GridCellModes.View },
              }),
              {}
            ),
            [params.field]: { mode: GridCellModes.Edit },
          },
        };
      });
      return;
    }
    if (!editItemFieldsPermitted) {
      dispatch(
        setFeedback({
          message: `Você não tem permissão para editar este campo`,
          type: "error",
        })
      );
      return;
    }
    if (
      (event.target as any).nodeType === 1 &&
      !event.currentTarget.contains(event.target as Element)
    ) {
      return;
    }
    setCellModesModel((prevModel) => {
      return {
        ...Object.keys(prevModel).reduce(
          (acc, id) => ({
            ...acc,
            [id]: Object.keys(prevModel[id]).reduce(
              (acc2, field) => ({
                ...acc2,
                [field]: { mode: GridCellModes.View },
              }),
              {}
            ),
          }),
          {}
        ),
        [params.id]: {
          ...Object.keys(prevModel[params.id] || {}).reduce(
            (acc, field) => ({
              ...acc,
              [field]: { mode: GridCellModes.View },
            }),
            {}
          ),
          [params.field]: { mode: GridCellModes.Edit },
        },
      };
    });
  };
  const handleCellModesModelChange = React.useCallback(
    (newModel: GridCellModesModel) => {
      setCellModesModel(newModel);
    },
    []
  );
  const performUpdateOnDatabase = React.useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel, payload: any) => {
      const rowId = newRow.id_item_requisicao;
      const pending = pendingRowUpdates.current;
      pending.set(rowId, (pending.get(rowId) || 0) + 1);
      try {
        const updatedItem = await RequisitionItemService.update(rowId, payload);
        const remaining = (pending.get(rowId) || 1) - 1;
        if (remaining <= 0) {
          pending.delete(rowId);
          // Só sincroniza com a resposta do servidor se esta for a última
          // edição em voo da linha, senão sobrescreveria um valor mais novo.
          dispatch(replaceItem({ id_item_requisicao: rowId, updatedItem }));
        } else {
          pending.set(rowId, remaining);
        }
      } catch (e: any) {
        const remaining = (pending.get(rowId) || 1) - 1;
        if (remaining <= 0) {
          pending.delete(rowId);
          dispatch(
            replaceItem({
              id_item_requisicao: rowId,
              updatedItem: oldRow as RequisitionItem,
            })
          );
        } else {
          pending.set(rowId, remaining);
        }
        dispatch(
          setFeedback({
            message: `Erro ao atualizar item da requisição: ${e.message}`,
            type: "error",
          })
        );
      }
    },
    [dispatch]
  );

  // Aceita vírgula ou ponto como separador decimal; entrada inválida mantém
  // o valor anterior.
  const parseTargetPrice = (value: any, previousValue: any) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return null;
    }
    if (typeof value === "number") {
      return value;
    }
    const parsed = Number(String(value).trim().replace(",", "."));
    return isNaN(parsed) ? previousValue ?? null : parsed;
  };

  const parseQuantidade = (value: any, previousValue: any) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return previousValue;
    }
    if (typeof value === "number") {
      return value;
    }
    const parsed = Number(String(value).trim().replace(",", "."));
    return isNaN(parsed) ? previousValue : parsed;
  };

  const processRowUpdate = React.useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel) => {
      if (!attendingItems) {
        // O editor de datas do grid devolve Date; normaliza para ISO para
        // manter o mesmo formato que o servidor retorna. O preço alvo chega
        // como texto (editor livre para aceitar vírgula) e vira número aqui.
        const normalizedRow: GridRowModel = {
          ...newRow,
          quantidade: parseQuantidade(newRow.quantidade, oldRow.quantidade),
          target_price: parseTargetPrice(newRow.target_price, oldRow.target_price),
          data_necessidade:
            newRow.data_necessidade instanceof Date
              ? formatDateToISOstring(newRow.data_necessidade)
              : newRow.data_necessidade,
          data_entrega:
            newRow.data_entrega instanceof Date
              ? formatDateToISOstring(newRow.data_entrega)
              : newRow.data_entrega,
        };
        const productCode = String(
          normalizedRow.produto_codigo || normalizedRow.produto?.codigo || ""
        ).trim();

        const quantidadeChanged = normalizedRow.quantidade !== oldRow.quantidade;
        const targetPriceChanged = normalizedRow.target_price !== oldRow.target_price;
        const dataNecessidadeChanged =
          getDateKey(normalizedRow.data_necessidade) !== getDateKey(oldRow.data_necessidade);
        const dataEntregaChanged =
          getDateKey(normalizedRow.data_entrega) !== getDateKey(oldRow.data_entrega);
        const ocChanged = normalizeOcValue(normalizedRow.oc) !== normalizeOcValue(oldRow.oc);
        const observacaoChanged =
          String(normalizedRow.observacao ?? "") !== String(oldRow.observacao ?? "");
        const codigoMlChanged =
          String(normalizedRow.codigo_ml ?? "").trim() !==
          String(oldRow.codigo_ml ?? "").trim();
        const produtoUnidadeChanged =
          productCode === "06.001.04.0002" &&
          normalizedRow.produto_unidade !== oldRow.produto_unidade;

        if (quantidadeChanged && normalizedRow.quantidade < 0) {
          dispatch(
            setFeedback({
              message: `Quantidade solicitada não pode ser negativa`,
              type: "error",
            })
          );
          return oldRow;
        }
        // Sair da célula sem alterar nada não deve disparar PUT.
        const hasChanges =
          quantidadeChanged ||
          targetPriceChanged ||
          dataNecessidadeChanged ||
          dataEntregaChanged ||
          ocChanged ||
          observacaoChanged ||
          produtoUnidadeChanged ||
          codigoMlChanged;
        if (!hasChanges) {
          return oldRow;
        }

        // Manda só os campos que mudaram nesta edição, não a linha inteira.
        const payload: any = {
          id_item_requisicao: normalizedRow.id_item_requisicao,
          alterado_por: user?.CODPESSOA,
        };
        if (quantidadeChanged) {
          payload.quantidade = normalizedRow.quantidade;
          payload.oldQuantity = oldRow.quantidade;
        }
        if (targetPriceChanged) payload.target_price = normalizedRow.target_price;
        if (dataNecessidadeChanged) payload.data_necessidade = normalizedRow.data_necessidade;
        if (dataEntregaChanged) payload.data_entrega = normalizedRow.data_entrega;
        if (ocChanged) payload.oc = normalizedRow.oc;
        if (observacaoChanged) payload.observacao = normalizedRow.observacao;
        if (produtoUnidadeChanged) payload.produto_unidade = normalizedRow.produto_unidade;
        if (codigoMlChanged) {
          payload.codigo_ml = String(normalizedRow.codigo_ml ?? "").trim() || null;
        }

        if (quantidadeChanged) {
          // Sem estado otimista: a quantidade dispara recálculo de cotação e
          // totais no servidor, então só refletimos na tela depois que ele
          // confirma. A tabela já fica travada (blockFields) nesse meio tempo.
          setBlockFields(true);
          try {
            const updatedItem = await RequisitionItemService.update(
              normalizedRow.id_item_requisicao,
              payload
            );
            dispatch(
              replaceItem({
                id_item_requisicao: normalizedRow.id_item_requisicao,
                updatedItem,
              })
            );
            dispatch(toggleRefreshReqComments());
            return updatedItem;
          } catch (e: any) {
            dispatch(
              setFeedback({
                message: `Erro ao atualizar item da requisição: ${e.message}`,
                type: "error",
              })
            );
            return oldRow;
          } finally {
            setBlockFields(false);
          }
        }

        fetchSeqRef.current++;
        dispatch(
          replaceItem({
            id_item_requisicao: normalizedRow.id_item_requisicao,
            updatedItem: normalizedRow as RequisitionItem,
          })
        );
        performUpdateOnDatabase(normalizedRow, oldRow, payload);
        return normalizedRow;
      }

      if (newRow.quantidade_atendida < 0) {
        dispatch(
          setFeedback({
            message: `Quantidade atendida não pode ser negativa`,
            type: "error",
          })
        );
        return oldRow;
      }

      if (newRow.produto_quantidade_disponivel < newRow.quantidade_atendida) {
        dispatch(
          setFeedback({
            message: `Quantidade atendida não pode ser maior do que a disponível em estoque`,
            type: "error",
          })
        );
        return oldRow;
      }
      if (newRow.quantidade_atendida > newRow.quantidade) {
        dispatch(
          setFeedback({
            message: `Quantidade atendida não deve ser maior que quantidade solicitada`,
            type: "error",
          })
        );
        return oldRow;
      }
      dispatch(
        replaceItem({
          id_item_requisicao: newRow.id_item_requisicao,
          updatedItem: newRow as RequisitionItem,
        })
      );
      return newRow;
    },
    [attendingItems, dispatch, performUpdateOnDatabase, user?.CODPESSOA]
  );

  const getTotalFromQuotes = async () => {
    let quotes = await QuoteService.getAllQuotesByReq(Number(id_requisicao));
    quotes = quotes.map((quote: any) => {
      return {
        total: quote.valor_total_itens
      };
    });

    setQuotesTotal(quotes);
  }

  const syncCreatedPatrimonyItems = useCallback(
    async (currentItems: RequisitionItem[]) => {
      if (!currentItems || currentItems.length === 0) {
        setCreatedPatrimonyItemIds(new Set());
        return;
      }

      try {
        const patrimonies = await PatrimonyService.getMany();
        const currentItemIds = new Set<number>(
          currentItems.map((item) => Number(item.id_item_requisicao))
        );

        const createdIds = new Set<number>(
          patrimonies
            .map((patrimony: any) => Number(patrimony?.id_item || 0))
            .filter((itemId: number) => itemId > 0 && currentItemIds.has(itemId))
        );

        setCreatedPatrimonyItemIds(createdIds);
      } catch (_error) {
        // Não bloqueia tela em caso de falha de sincronização.
      }
    },
    []
  );

  const isPatrimonyItemCreated = useCallback(
    (item: any) => {
      const itemId = Number(item?.id_item_requisicao || 0);

      return createdPatrimonyItemIds.has(itemId);
    },
    [createdPatrimonyItemIds]
  );

  const handleOpenPatrimonyDialog = useCallback(
    (item: RequisitionItem) => {
      setSelectedPatrimonyItem(item);
      setPatrimonyFormData({
        nome: item.produto_descricao || "",
        descricao: item.observacao || item.produto_descricao || "",
        nserie: "",
        tipo: 0,
        valor_compra: 0,
        calibracao: 0,
        data_proxima_calibracao: "",
        responsavel: undefined,
        projeto: requisition?.ID_PROJETO ? Number(requisition.ID_PROJETO) : undefined,
      });
      setPatrimonyDialogOpen(true);
    },
    [requisition?.ID_PROJETO]
  );

  const handleClosePatrimonyDialog = () => {
    setPatrimonyDialogOpen(false);
    setSelectedPatrimonyItem(null);
  };

  const handleCreatePatrimony = async () => {
    if (!selectedPatrimonyItem) {
      return;
    }

    if (
      !patrimonyFormData.nome ||
      !patrimonyFormData.descricao ||
      !patrimonyFormData.tipo ||
      !patrimonyFormData.projeto ||
      !patrimonyFormData.responsavel
    ) {
      dispatch(
        setFeedback({
          type: "error",
          message: "Preencha nome, descrição, tipo, projeto e responsável.",
        })
      );
      return;
    }

    if (
      patrimonyFormData.calibracao === 1 &&
      !patrimonyFormData.data_proxima_calibracao
    ) {
      dispatch(
        setFeedback({
          type: "error",
          message: "Preencha a data da próxima calibração.",
        })
      );
      return;
    }

    setSavingPatrimony(true);

    try {
      const createdPatrimony = await PatrimonyService.create({
        nome: patrimonyFormData.nome,
        descricao: patrimonyFormData.descricao,
        nserie: patrimonyFormData.nserie,
        valor_compra: patrimonyFormData.valor_compra,
        tipo: patrimonyFormData.tipo,
        calibracao: patrimonyFormData.calibracao,
        data_proxima_calibracao:
          patrimonyFormData.calibracao === 1
            ? patrimonyFormData.data_proxima_calibracao
            : null,
        id_produto: Number(selectedPatrimonyItem.id_produto),
        id_item: Number(selectedPatrimonyItem.id_item_requisicao),
      });

      await MovementationService.create({
        id_patrimonio: createdPatrimony.id_patrimonio,
        id_responsavel: Number(patrimonyFormData.responsavel),
        id_projeto: Number(patrimonyFormData.projeto),
      });

      setCreatedPatrimonyItemIds((previous) => {
        const next = new Set(previous);
        next.add(Number(selectedPatrimonyItem.id_item_requisicao));
        return next;
      });

      dispatch(
        setFeedback({
          type: "success",
          message: "Patrimônio criado com sucesso.",
        })
      );
      handleClosePatrimonyDialog();
    } catch (error: any) {
      dispatch(
        setFeedback({
          type: "error",
          message:
            error?.response?.data?.mensagem ?? "Erro ao criar patrimônio.",
        })
      );
    } finally {
      setSavingPatrimony(false);
    }
  };

  const getRowClassName = useCallback((params: any) => {
    const item = params.row;
    const classes: string[] = [];
    const currentStatus = normalizeText(requisition.status?.nome);
    const isCadPatrimonioStep = currentStatus === "cadastrar patrimonio";
    const patrimonyType = Number(item?.produto?.tipo_produto_patrimonio ?? 0);
    const isPatrimonyItem = patrimonyType === 1 || patrimonyType === 2;
    const patrimonyCreated = isPatrimonyItemCreated(item);

    if (isCadPatrimonioStep && isPatrimonyItem) {
      classes.push(patrimonyCreated ? "item-patrimonio-green" : "item-patrimonio-blue");
    }

    // Na etapa "Comprar", o comprador vê em amarelo (mesma cor da requisição
    // parada há 2 dias) os itens que tiveram a quantidade alterada.
    const isBuyer = Number(user?.PERM_COMPRADOR) === 1;
    if (
      currentStatus === "comprar" &&
      isBuyer &&
      Number(item?.quantidade_alterada) === 1
    ) {
      classes.push("item-quantity-changed");
    }

    if (quotesTotal.length === 0) {
      return classes.join(" ");
    }

    if (!item.items_cotacao || item.items_cotacao.length === 0) {
      return classes.join(" ");
    }

    const hasAnyPrice = item.items_cotacao.some(
      (quoteItem: any) => quoteItem && quoteItem.preco_unitario > 0 && !quoteItem.indisponivel
    );

    if (!hasAnyPrice) {
      classes.push("item-without-quote");
    }

    return classes.join(" ");
  }, [quotesTotal, requisition.status?.nome, isPatrimonyItemCreated, user?.PERM_COMPRADOR]);

  const handleRowClick = (params: any) => {
    const row = params?.row as RequisitionItem;
    const currentStatus = normalizeText(requisition.status?.nome);
    const isCadPatrimonioStep = currentStatus === "cadastrar patrimonio";
    const patrimonyType = Number(row?.produto?.tipo_produto_patrimonio ?? 0);
    const isPatrimonyItem = patrimonyType === 1 || patrimonyType === 2;

    if (!(isCadPatrimonioStep && isPatrimonyItem)) {
      return;
    }

    if (isPatrimonyItemCreated(row)) {
      return;
    }

    handleOpenPatrimonyDialog(row);
  };

  const createQuoteFromSelectedItems = async () => {
    const quote: Quote = await QuoteService.create({
      id_requisicao: requisition.ID_REQUISICAO,
      fornecedor: "",
      observacao: "",
      descricao: "",
      valor_frete: 0,
      itemIds: selectionModel,
    });
    if (quote) {
      navigate(`cotacao/${quote.id_cotacao}`);
    }
  };
  const handleAddItemsToRequisition = async () => {
    if (quote) {
      try {
        const newQuoteItems = selectionModel.map((id_item_requisicao) => ({
          id_cotacao: quote.id_cotacao,
          id_item_requisicao,
          quantidade_solicitada:
            items.find((item) => item.id_item_requisicao === id_item_requisicao)
              ?.quantidade || 0,
          quantidade_cotada:
            items.find((item) => item.id_item_requisicao === id_item_requisicao)
              ?.quantidade || 0,
          descricao_item: "",
          preco_unitario: 0,
        }));

        const incrementedQuoteItems = await QuoteItemService.create(
          newQuoteItems
        );
        dispatch(setQuoteItems(incrementedQuoteItems));
        dispatch(setAddingReqItems(false));
        dispatch(
          setFeedback({
            message: "Itens adicionados com sucesso à cotação",
            type: "success",
          })
        );
      } catch (e: any) {
        dispatch(
          setFeedback({ message: "Erro ao adicionar itens", type: "error" })
        );
      }
    }
  };
  const handleChangeSelection = async (
    newRowSelectionModel: GridRowSelectionModel
  ) => {
    if (addingReqItems) {
      const itemsInQuoteItems = quoteItems.map(
        (item) => item.id_item_requisicao
      );
      if (itemsInQuoteItems.includes(Number(newRowSelectionModel[0]))) {
        dispatch(
          setFeedback({
            message: "Vocé nao pode selecionar itens que ja estao na cotação",
            type: "error",
          })
        );
        return;
      }
    }
    setSelectionModel(newRowSelectionModel);
  };
  const changeSearchTerm = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value.toLowerCase());
    },
    []
  );
  const debouncedHandleChangeSearchTerm = useMemo(
    () => debounce(changeSearchTerm, 500),
    [changeSearchTerm]
  );
  useEffect(
    () => () => debouncedHandleChangeSearchTerm.cancel(),
    [debouncedHandleChangeSearchTerm]
  );
  const fetchData = useCallback(async () => {
    setLoading(true);
    const seq = ++fetchSeqRef.current;
    try {
      const params = newItems.length > 0 ? {
        id_requisicao: requisition.ID_REQUISICAO,
        id_item_requisicao: { in: [...newItems] },
        searchTerm,
      } : {
        id_requisicao: requisition.ID_REQUISICAO,
        searchTerm,
      };

      const data = await RequisitionItemService.getMany(params);
      if (seq !== fetchSeqRef.current) {
        setLoading(false);
        return;
      }
      let nextItems = data;
      if (pendingRowUpdates.current.size > 0) {
        nextItems = data.map((item: RequisitionItem) => {
          if (!pendingRowUpdates.current.has(item.id_item_requisicao)) {
            return item;
          }
          const localItem = itemsRef.current.find(
            (local) => local.id_item_requisicao === item.id_item_requisicao
          );
          return localItem ?? item;
        });
      }
      dispatch(setItems(nextItems));
      if (attendingItems) {
        dispatch(
          setItems(
            data
              .map((item) => {
                let quantidade_atendida =
                  item.quantidade > (item.quantidade_disponivel || 0)
                    ? item.quantidade_disponivel
                    : item.quantidade;
                return {
                  ...item,
                  quantidade_atendida,
                };
              })
              .filter((item) => item.quantidade_disponivel)
          )
        );
      }
      defineSelectedQuoteItemsMap(data);
      dispatch(setProductsAdded(data.map((item) => item.id_produto)));
      setLoading(false);
    } catch (e) {
      setLoading(false);
      dispatch(
        setFeedback({
          message: "Erro ao buscar itens da requisição",
          type: "error",
        })
      );
    }
  }, [dispatch, requisition.ID_REQUISICAO, searchTerm, newItems]);

  const defineSelectedQuoteItemsMap = (items: RequisitionItem[]) => {
    items.forEach((item) => {
      if (item.id_item_cotacao) {
        quoteItemsSelected.set(item.id_item_requisicao, item.id_item_cotacao);
      }
    });
  };

  const handleChangeQuoteSelected = useCallback(async () => {
    if (currentQuoteIdSelected) {
      const quote: Partial<Quote> = await QuoteService.getById(
        currentQuoteIdSelected
      );
      if (quote && quote.items) {
        const quoteItems = quote.items.map((item) => item.id_item_cotacao);
        const itemIds = items
          .filter((item) => quoteItems.includes(item.id_item_cotacao || 0))
          .map((item) => item.id_item_requisicao);
        setSelectionModel(itemIds);
        dispatch(setSelectedQuote(quote));
        return;
      }
    }
    setSelectionModel([]);
  }, [currentQuoteIdSelected, quoteItems]);

  const shouldShowCreateParcialReqBtn = () => {
    const allowedStatus = ["em cotação", "requisitado", "validação"];
    return (
      !addingReqItems &&
      !updatingRecentProductsQuantity &&
      items.length > 0 &&
      !attendingItems &&
      editItemFieldsPermitted &&
      allowedStatus.includes(requisition.status?.nome?.toLowerCase() || "")
    );
  };

  const shouldShowAttendItemsBtn = () => {
    return attendingItems && selectionModel.length > 0;
  };

  const handleAttendItems = () => {
    const selectedItems = items.filter((item) =>
      selectionModel.includes(item.id_item_requisicao)
    );
    const selectedIds = selectedItems.map((item) => item.id_item_requisicao);
    dispatch(setItemsToAttend(selectedItems));
    dispatch(
      setNotAttendedItems(
        items.filter((item) => !selectedIds.includes(item.id_item_requisicao))
      )
    );
    dispatch(
      setItems(
        items.filter((item) => selectedIds.includes(item.id_item_requisicao))
      )
    );
    setSelectionModel([]);
  };

  const handleCellKeyDown = useCallback(
    (params: GridCellParams, event: React.KeyboardEvent) => {
      if (
        event.key === "Tab" &&
        params.field === "quantidade" &&
        updatingRecentProductsQuantity
      ) {
        event.preventDefault();
        const visibleRows = gridApiRef.current.getSortedRows();
        const rowIndex = visibleRows.findIndex(
          (row) => row.id_item_requisicao === params.id
        );
        let nextRowIndex = event.shiftKey ? rowIndex - 1 : rowIndex + 1;
        if (nextRowIndex < 0 || nextRowIndex >= visibleRows.length) return;
        const nextRowId = visibleRows[nextRowIndex].id_item_requisicao;
        gridApiRef.current.setCellFocus(nextRowId, "quantidade");
      }
    },
    [gridApiRef, updatingRecentProductsQuantity]
  );

  useEffect(() => {
    if (requisition) {
      fetchData();
    }
  }, [
    dispatch,
    requisition.ID_REQUISICAO,
    fetchData,
    updatingRecentProductsQuantity,
    refresh,
  ]);

  useEffect(() => {
    handleChangeQuoteSelected();
  }, [handleChangeQuoteSelected]);

  useEffect(() => {
    if (id_requisicao) {
      getTotalFromQuotes();
    }
  }, [id_requisicao]);

  const isCadPatrimonioStep =
    normalizeText(requisition.status?.nome) === "cadastrar patrimonio";
  const itemIdsKey = useMemo(
    () => items.map((item) => item.id_item_requisicao).join(","),
    [items]
  );
  useEffect(() => {
    if (!isCadPatrimonioStep) return;
    syncCreatedPatrimonyItems(itemsRef.current);
  }, [isCadPatrimonioStep, itemIdsKey, syncCreatedPatrimonyItems]);

  return (
    <Box>
      {selectionModel.length > 0 && (
        <Box sx={{ p: 1, display: "flex", gap: 1 }}>
          {!addingReqItems &&
            !updatingRecentProductsQuantity &&
            createQuotePermitted && (
              <Button
                variant="contained"
                onClick={createQuoteFromSelectedItems}
              >
                Criar cotação
              </Button>
            )}
          {shouldShowCreateParcialReqBtn() && (
            <Button
              variant="contained"
              onClick={() => {
                dispatch(setUpdatingChildReqItems(true));
              }}
            >
              Criar requisição parcial
            </Button>
          )}

          {shouldShowAttendItemsBtn() && (
            <Button variant="contained" onClick={() => handleAttendItems()}>
              atender
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopySelectedItems}
          >
            Copiar itens
          </Button>
        </Box>
      )}
      {codigosMl.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1, pb: 1 }}>
          <Button
            variant="outlined"
            startIcon={<LocalShippingIcon />}
            onClick={() => setTrackingDialogOpen(true)}
          >
            Rastrear compras ({codigosMl.length})
          </Button>
        </Box>
      )}
      <BaseTableToolBar
        ref={toolbarRef}
        handleChangeSearchTerm={debouncedHandleChangeSearchTerm}
      />
      <Box
        ref={tableWrapperRef}
        sx={{
          height: effectiveMaxHeight ? effectiveMaxHeight : "auto",
          overflowX: "auto",
          overflowY: shouldUseAutoHeight ? "visible" : "auto",
          "& .MuiDataGrid-scrollbar--horizontal": {
            position: "sticky",
            bottom: 0,
            zIndex: 3,
            backgroundColor: (theme) => theme.palette.background.paper,
          },
          '& .item-without-quote': {
            backgroundColor: '#ffebee !important',
            '&:hover': {
              backgroundColor: '#ffcdd2 !important',
            },
          },
          '& .item-patrimonio-blue': {
            backgroundColor: '#cfe8ff !important',
            '&:hover': {
              backgroundColor: '#b7dcff !important',
            },
          },
          '& .item-patrimonio-green': {
            backgroundColor: '#d8f5d0 !important',
            '&:hover': {
              backgroundColor: '#c5ecb9 !important',
            },
          },
          '& .item-quantity-changed': {
            backgroundColor: '#fff3cc !important',
            '&:hover': {
              backgroundColor: '#ffe9a8 !important',
            },
          },
        }}
      >
        {dinamicColumns.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.5,
              flexWrap: "wrap",
              position: "sticky",
              top: 0,
              zIndex: 2,
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            {dinamicColumns.map((col) => {
              const isSelected = supplierFilter === (col.field as string);
              return (
                <Box
                  key={col.field as string}
                  onClick={() =>
                    setSupplierFilter(isSelected ? null : (col.field as string))
                  }
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    borderRadius: 1,
                    px: 1,
                    py: 0.25,
                    bgcolor: isSelected ? "primary.50" : "transparent",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {isSelected ? (
                    <CheckCircleIcon sx={{ fontSize: 14, color: "primary.main" }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ fontSize: 14, color: "primary.main" }} />
                  )}
                  <Typography
                    fontSize="0.7rem"
                    color="primary.main"
                    fontWeight={isSelected ? "bold" : "normal"}
                  >
                    {col.headerName}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
        <BaseDataTable
          apiRef={gridApiRef}
          density="compact"
          getRowId={(row: any) => row.id_item_requisicao}
          loading={loading || blockFields}
          theme={theme}
          disableColumnMenu
          rowHeight={60}
          rows={filteredItems}
          checkboxSelection
          onRowSelectionModelChange={handleChangeSelection}
          rowSelectionModel={selectionModel}
          disableRowSelectionOnClick
          columns={isMobile ? mobileColumns() : columns}
          isCellEditable={isCellEditable}
          cellModesModel={cellModesModel}
          onCellModesModelChange={handleCellModesModelChange}
          onCellClick={handleCellClick}
          processRowUpdate={processRowUpdate}
          hideFooter={hideFooter}
          autoHeight={shouldUseAutoHeight}
          onCellKeyDown={handleCellKeyDown}
          getRowClassName={getRowClassName}
          onRowClick={handleRowClick}
          showCellVerticalBorder
        />
      </Box>
      <StickyHorizontalScrollbar wrapperRef={tableWrapperRef} />
      {addingReqItems && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <Button variant="contained" onClick={handleAddItemsToRequisition}>
            Adicionar itens
          </Button>
        </Box>
      )}

      <RequisitionTrackingDialog
        open={trackingDialogOpen}
        onClose={() => setTrackingDialogOpen(false)}
        codigos={codigosMl}
      />

      {updatingChildReqItems && (
        <UpdateChildReqItemsDialog
          open={updatingChildReqItems}
          onClose={() => dispatch(setUpdatingChildReqItems(false))}
          id_requisicao={Number(id_requisicao)}
          items={items.filter((item) =>
            selectionModel.includes(item.id_item_requisicao)
          )}
          allItems={items}
        />
      )}

      <Dialog
        open={viewingItemAttachment !== null}
        onClose={() => dispatch(setViewingItemAttachment(null))}
        fullWidth
        maxWidth="md"
      >
        <IconButton
          onClick={() => dispatch(setViewingItemAttachment(null))}
          sx={{
            color: "error.main",
            height: 30,
            width: 30,
            position: "absolute",
            top: 4,
            right: 4,
            boxShadow: 3,
          }}
        >
          <GridCloseIcon />
        </IconButton>
        <DialogTitle>
          {viewingItemAttachmentType === 2
            ? "Anexos de Nota Fiscal"
            : "Lista de Anexos"}
        </DialogTitle>
        <DialogContent>
          <RequisitionItemAttachmentList />
        </DialogContent>
      </Dialog>

      <Dialog
        open={patrimonyDialogOpen}
        onClose={handleClosePatrimonyDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Cadastrar Patrimônio
          {selectedPatrimonyItem?.produto_descricao
            ? ` - ${selectedPatrimonyItem.produto_descricao}`
            : ""}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            <ElegantInput
              label="Nome"
              required
              value={patrimonyFormData.nome}
              onChange={(event) =>
                setPatrimonyFormData((previous) => ({
                  ...previous,
                  nome: event.target.value,
                }))
              }
            />
            <ElegantInput
              label="Descrição"
              required
              value={patrimonyFormData.descricao}
              onChange={(event) =>
                setPatrimonyFormData((previous) => ({
                  ...previous,
                  descricao: event.target.value,
                }))
              }
            />
            <ElegantInput
              label="Nº de série"
              value={patrimonyFormData.nserie}
              onChange={(event) =>
                setPatrimonyFormData((previous) => ({
                  ...previous,
                  nserie: event.target.value,
                }))
              }
            />
            <ElegantInput
              label="Valor de compra"
              type="number"
              value={patrimonyFormData.valor_compra}
              onChange={(event) =>
                setPatrimonyFormData((previous) => ({
                  ...previous,
                  valor_compra: Number(event.target.value || 0),
                }))
              }
            />
            <OptionsField
              label="Tipo"
              required
              options={patirmonyTypeOptions}
              value={patrimonyFormData.tipo}
              onChange={(optionIdSelected) =>
                setPatrimonyFormData((previous) => ({
                  ...previous,
                  tipo: Number(optionIdSelected),
                }))
              }
            />
            <OptionsField
              label="Projeto"
              required
              options={projectOptions}
              value={patrimonyFormData.projeto}
              optionHeight={60}
              onChange={(optionIdSelected) =>
                setPatrimonyFormData((previous) => ({
                  ...previous,
                  projeto: Number(optionIdSelected),
                }))
              }
            />
            <OptionsField
              label="Responsável"
              required
              options={userOptions}
              value={patrimonyFormData.responsavel}
              onChange={(optionIdSelected) =>
                setPatrimonyFormData((previous) => ({
                  ...previous,
                  responsavel: Number(optionIdSelected),
                }))
              }
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <input
                id="cadastro-patrimonio-calibracao"
                type="checkbox"
                checked={patrimonyFormData.calibracao === 1}
                onChange={(event) =>
                  setPatrimonyFormData((previous) => ({
                    ...previous,
                    calibracao: event.target.checked ? 1 : 0,
                    data_proxima_calibracao: event.target.checked
                      ? previous.data_proxima_calibracao
                      : "",
                  }))
                }
              />
              <label htmlFor="cadastro-patrimonio-calibracao">Calibração</label>
            </Box>
            {patrimonyFormData.calibracao === 1 && (
              <ElegantInput
                label="Data da próxima calibração"
                type="date"
                required
                value={patrimonyFormData.data_proxima_calibracao}
                onChange={(event) =>
                  setPatrimonyFormData((previous) => ({
                    ...previous,
                    data_proxima_calibracao: event.target.value,
                  }))
                }
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePatrimonyDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleCreatePatrimony}
            variant="contained"
            disabled={savingPatrimony}
          >
            {savingPatrimony ? "Salvando..." : "Criar Patrimônio"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequisitionItemsTable;
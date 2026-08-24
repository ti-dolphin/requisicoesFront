import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  GridCellModesModel,
  GridCellParams,
  GridCellModes,
  GridRowModel,
} from "@mui/x-data-grid";
import { useState, useCallback, useEffect, ChangeEvent, useMemo } from "react";
import { QuoteItem } from "../../models/requisicoes/QuoteItem";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { QuoteItemService } from "../../services/requisicoes/QuoteItemService";
import BaseDataTable from "../shared/BaseDataTable";
import BaseTableToolBar from "../shared/BaseTableToolBar";
import { debounce } from "lodash";
import { useQuoteItemColumns } from "../../hooks/requisicoes/useQuoteItemColumns";
import { useQuoteItemPermissions } from "../../hooks/requisicoes/useQuoteItemPermissions";
import RequisitionItemsTable from "./RequisitionItemsTable";
import CloseIcon from '@mui/icons-material/Close';
import { setAddingReqItems, setQuoteItems, setSingleQuoteItem, setViewingItemAttachment } from "../../redux/slices/requisicoes/quoteItemSlice";
import { useParams } from "react-router-dom";
import { useIsMobile } from "../../hooks/useIsMobile";
import QuoteItemAttachmentViewList from "./QuoteItemAttachmentViewList";
import { normalizeMonetaryInput } from "../../utils/parseMonetaryInput";


interface QuoteItemsTableProps {
  tableMaxHeight? : number;
  hideFooter : boolean
}


const QuoteItemsTable = ({
  tableMaxHeight,
  hideFooter,
}: QuoteItemsTableProps) => {
  const dispatch = useDispatch();
  const { token } = useParams();
  const user = useSelector((state: RootState) => state.user.user);
  const theme = useTheme();
  const { quote, accessType } = useSelector((state: RootState) => state.quote);
  const { quoteItems, addingReqItems, viewingItemAttachment } = useSelector(
    (state: RootState) => state.quoteItem
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});
  const [loading, setLoading] = useState(false);
  const [blockFields, setBlockFields] = useState(false);
  const isSupplierRoute = accessType === "supplier" ? true : false;
  const {isMobile} = useIsMobile();

  const handleUpdateUnavailable = async (
    e: ChangeEvent<HTMLInputElement>,
    itemId: number
  ) => {
    setBlockFields(true);
    setLoading(true);
    const item = quoteItems.find((item) => item.id_item_cotacao === itemId);
    if (!item) return;
    try {
      const indisponivel = e.target.checked ? 1 : 0;
      // Indisponível=1 zera o subtotal sem olhar preço/quantidade/IPI/ST no
      // servidor; só ao reabilitar o item é que eles entram no recálculo.
      const payload: any = {
        indisponivel,
        id_cotacao: Number(item.id_cotacao),
      };
      if (!e.target.checked) {
        payload.preco_unitario = item.preco_unitario;
        payload.quantidade_cotada = item.quantidade_cotada;
        payload.IPI = Number(item.IPI);
        payload.ST = Number(item.ST);
      }
      const updatedItem: QuoteItem = {
        ...item,
        indisponivel,
        subtotal: e.target.checked ? 0 : item.subtotal,
      };
      if (!e.target.checked) {
        // Caso o item seja desmarcado, o backend recalcula subtotal e totais;
        // o resto do item já é conhecido localmente e não muda nessa operação.
        try {
          const { subtotal } = await updateQuoteItem(itemId, payload);
          dispatch(setSingleQuoteItem({ ...item, ...payload, subtotal }));
        } finally {
          setBlockFields(false);
          setLoading(false);
        }
        return;
      }
      dispatch(setSingleQuoteItem(updatedItem));
      debouncedSave(payload, item.id_item_cotacao, item);
      return;
    } catch (e: any) {
      dispatch(setSingleQuoteItem(item));
      dispatch(
        setFeedback({
          message: `Erro ao atualizar o item ${item.produto_descricao} - ${e.message}`,
          type: "error",
        })
      );
    }
  };

  const handleViewAttachments = (id_item_requisicao: number) => {
    dispatch(setViewingItemAttachment(id_item_requisicao));
  };

  const { columns } = useQuoteItemColumns(handleUpdateUnavailable, blockFields, handleViewAttachments);

  const mobileColumns = ( ) =>  {
    const arr = [
      {
        label: "Produto",
        field: 'produto_descricao',
        width: 160
      },
      { label: 'ICMS%', field: "ICMS", width: 100 },
      { label: 'IPI%', field: "IPI", width: 80 },
      { label: 'ST%', field: "ST", width: 80 },
      { label: 'Preco Unitario', field: "preco_unitario", width: 200 },
      { label:'subtotal', field: "subtotal", width: 100 },
    ];
    return arr;
  }

  const { permissionToEditItems, permissionToAddItems } =
    useQuoteItemPermissions(user, isSupplierRoute);

  const updateQuoteItem = useCallback(
    (id_item_cotacao: number, payload: any) => {
      if (token) {
        return QuoteItemService.update(id_item_cotacao, payload, token);
      }
      return QuoteItemService.update(id_item_cotacao, payload);
    },
    [token]
  );

  const handleCellClick = useCallback(
    (params: GridCellParams, event: React.MouseEvent) => {
      if (blockFields) return;

      if (params.field === "indisponivel") return;

      if (params.row.indisponivel) {
        dispatch(
          setFeedback({
            message: `O item ${params.row.produto_descricao} nao pode ser editado pois esta indisponivel`,
            type: "error",
          })
        );
        return;
      }

      if (!params.isEditable) {
        // dispatch(
        //   setFeedback({
        //     message: `O campo selecionado não é editável`,
        //     type: "error",
        //   })
        // );
        return;
      }

      if (!permissionToEditItems) {
        dispatch(
          setFeedback({
            type: "error",
            message: "Vocé nao tem permissão para editar o item.",
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
      setCellModesModel((prevModel) => ({
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
      }));
    },
    [dispatch, permissionToEditItems]
  );

  const handleCellModesModelChange = useCallback(
    (newModel: GridCellModesModel) => {
      setCellModesModel(newModel);
    },
    []
  );

  /**
   * Atualiza um item da cotação.
   * Verifica se a quantidade cotada  maior que a quantidade solicitada,
   * se a quantidade cotada   menor que zero, e se o pre o unit rio est  zerado.
   *
   * @param {Object} payload - Payload com campos para atualizar o item da cota o.
   * @param {number} id_item_cotacao - ID do item da cota o.
   * @param {Object} previousItem - Item da cotacaoo anterior para restaurar se houver erros.
   */
  const sendUpdate = useCallback(async (
    payload: any,
    id_item_cotacao: number,
    previousItem: any
  ) => {
    const validations = [
      {
        condition: payload.quantidade_cotada > payload.quantidade_solicitada,
        message: `Quantidade cotada maior que quantidade solicitada`,
      },
      {
        condition: payload.quantidade_cotada < 0,
        message: `Quantidade cotada menor que zero`,
      },
    ];
    try {
      validations.forEach((validation) => {
        if (validation.condition) {
          throw new Error(validation.message);
        }
      });
      const { subtotal } = await updateQuoteItem(id_item_cotacao, payload);
      dispatch(setSingleQuoteItem({ ...previousItem, ...payload, subtotal }));
    } catch (e: any) {
      dispatch(setSingleQuoteItem({ ...previousItem }));
      dispatch(
        setFeedback({
          message: `Erro ao atualizar item da cotação: ${e.message}`,
          type: "error",
        })
      );
      return;
    } finally {
      setBlockFields(false);
      setLoading(false);
    }
  }, [dispatch, updateQuoteItem]);

  const debouncedSave = useMemo(() => debounce(sendUpdate, 300), [sendUpdate]);

  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  const processRowUpdate = useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel) => {
      const normalizedPrecoUnitario = normalizeMonetaryInput(
        newRow.preco_unitario,
        Number(oldRow.preco_unitario || 0)
      );

      const precoChanged = normalizedPrecoUnitario !== Number(oldRow.preco_unitario || 0);
      const quantidadeChanged = Number(newRow.quantidade_cotada) !== Number(oldRow.quantidade_cotada);
      const icmsChanged = Number(newRow.ICMS) !== Number(oldRow.ICMS);
      const ipiChanged = Number(newRow.IPI) !== Number(oldRow.IPI);
      const stChanged = Number(newRow.ST) !== Number(oldRow.ST);
      const observacaoChanged = (newRow.observacao || "") !== (oldRow.observacao || "");

      const hasChanges =
        precoChanged || quantidadeChanged || icmsChanged || ipiChanged || stChanged || observacaoChanged;

      if (!hasChanges) {
        return oldRow;
      }

      // ICMS e observação não entram no cálculo de subtotal/total (a fórmula
      // só usa preço, quantidade, IPI e ST): se só eles mudaram, não precisa
      // do fluxo completo de recálculo no servidor.
      const onlyNonCalcFieldsChanged =
        (observacaoChanged || icmsChanged) &&
        !precoChanged && !quantidadeChanged && !ipiChanged && !stChanged;

      if (onlyNonCalcFieldsChanged) {
        const fields: { observacao?: string; ICMS?: number } = {};
        if (observacaoChanged) fields.observacao = newRow.observacao;
        if (icmsChanged) fields.ICMS = Number(newRow.ICMS);
        try {
          setBlockFields(true);
          setLoading(true);
          if (token) {
            await QuoteItemService.updateFields(newRow.id_item_cotacao, fields, token);
          } else {
            await QuoteItemService.updateFields(newRow.id_item_cotacao, fields);
          }
          return newRow;
        } catch (e: any) {
          dispatch(
            setFeedback({
              message: `Erro ao atualizar item da cotação: ${e.message}`,
              type: "error",
            })
          );
          return oldRow;
        } finally {
          setBlockFields(false);
          setLoading(false);
        }
      }

      if(normalizedPrecoUnitario < 0){
        dispatch(
          setFeedback({
            message: `Preco unitario nao pode ser menor que zero`,
            type: "error",
          })
        );
        return oldRow;
      }

      if(newRow.quantidade_cotada < 0){
        dispatch(
          setFeedback({
            message: `Quantidade cotada nao pode ser menor que zero`,
            type: "error",
          })
        );
        return oldRow;
      }

      if(newRow.quantidade_cotada > newRow.quantidade_solicitada){
        dispatch(
          setFeedback({
            message: `Quantidade cotada nao pode ser maior que quantidade solicitada`,
            type: "error",
          })
        );
        return oldRow;
      }

      // Preço, quantidade, IPI e ST viajam sempre juntos porque o subtotal no
      // servidor é calculado a partir dos quatro de uma vez; ICMS e observação
      // só entram se também tiverem mudado nesta mesma edição (raro, mas
      // possível). id_item_requisicao nunca é lido pelo update no servidor.
      const payload: any = {
        quantidade_cotada: newRow.quantidade_cotada,
        IPI: Number(newRow.IPI),
        ST: Number(newRow.ST),
        preco_unitario: normalizedPrecoUnitario,
        id_cotacao: Number(newRow.id_cotacao),
      };
      if (icmsChanged) payload.ICMS = Number(newRow.ICMS);
      if (observacaoChanged) payload.observacao = newRow.observacao;
      try {
        setBlockFields(true);
        setLoading(true);
        debouncedSave(payload, newRow.id_item_cotacao, oldRow);
        return {
          ...newRow,
          preco_unitario: normalizedPrecoUnitario,
        };
      } catch (e: any) {
        setBlockFields(false);
        setLoading(false);
        dispatch(
          setFeedback({
            message: `Erro ao atualizar item da cotação: ${e.message}`,
            type: "error",
          })
        );
        return oldRow;
      }
    },
    [dispatch, token]
  );

  const changeSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const debouncedHandleChangeSearchTerm = debounce(changeSearchTerm, 500);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        id_cotacao: quote?.id_cotacao, // Adjust to your quotation state property
        searchTerm,
      };
      if (token) {
        const data = await QuoteItemService.getMany(params, token);
        dispatch(setQuoteItems(data));
        return;
      }
      const data = await QuoteItemService.getMany(params);
      console.log(data, 'data items cotacao');
      dispatch(setQuoteItems(data));
    } catch (e) {
      dispatch(
        setFeedback({
          message: "Erro ao buscar itens da cotação",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, quote?.id_cotacao, searchTerm, token]);

  useEffect(() => {
    if (quote?.id_cotacao) {
      fetchData();
    }
  }, [fetchData, quote?.id_cotacao]);

  return (
    <Box>
      <BaseTableToolBar
        handleChangeSearchTerm={debouncedHandleChangeSearchTerm}
      >
         {permissionToAddItems && (
          <Button
            variant="contained"
            onClick={() => {
              dispatch(setAddingReqItems(true));
            }}
          >
            Adicionar itens
          </Button>
        )}
      </BaseTableToolBar>
      <Box sx={{ height: tableMaxHeight ? tableMaxHeight : "auto" }}>
        <BaseDataTable
          density="compact"
          disableColumnMenu
          getRowId={(row: any) => row.id_item_cotacao}
          loading={loading}
          theme={theme}
          rows={quoteItems}
          columns={isMobile ? mobileColumns() : columns}
          cellModesModel={cellModesModel}
          onCellModesModelChange={handleCellModesModelChange}
          onCellClick={handleCellClick}
          processRowUpdate={processRowUpdate}
          hideFooter={hideFooter}
        />
      </Box>

      <Dialog
        open={addingReqItems}
        fullWidth
        onClose={() => dispatch(setAddingReqItems(false))}
      >
        <DialogTitle>Adicionar itens</DialogTitle>
        <DialogContent>
          <IconButton
            sx={{ position: "absolute", top: 0, right: 0 }}
            color="error"
            onClick={() => dispatch(setAddingReqItems(false))}
          >
            <CloseIcon />
          </IconButton>
          {addingReqItems && <RequisitionItemsTable hideFooter />}
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar anexos do item da requisição */}
      <Dialog
        open={viewingItemAttachment !== null}
        fullWidth
        maxWidth="sm"
        onClose={() => dispatch(setViewingItemAttachment(null))}
      >
        <DialogTitle>Anexos do Item</DialogTitle>
        <DialogContent>
          <IconButton
            sx={{ position: "absolute", top: 0, right: 0 }}
            color="error"
            onClick={() => dispatch(setViewingItemAttachment(null))}
          >
            <CloseIcon />
          </IconButton>
          {viewingItemAttachment !== null && (
            <QuoteItemAttachmentViewList id_item_requisicao={viewingItemAttachment} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default QuoteItemsTable;

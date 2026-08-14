import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  setRows,
  setSelectedRow,
  setSelectedKanban,
  setLoading,
  setSearchTerm,
  setFilters,
  clearfilters,
  setRequisitionBeingDeletedId,
  removeRow,
  setDoneReqFilter,
  setCancelledReqFilter,
} from "../../../redux/slices/requisicoes/requisitionTableSlice";
import { setFeedback } from "../../../redux/slices/feedBackSlice";
import RequisitionService from "../../../services/requisicoes/RequisitionService";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, SelectChangeEvent, Tooltip, useTheme } from "@mui/material";
import { useRequisitionColumns } from "../../../hooks/requisicoes/useRequisitionColumns";
import BaseDataTable from "../../../components/shared/BaseDataTable";
import BaseDetailModal from "../../../components/shared/BaseDetailModal";
import { useGridApiRef } from "@mui/x-data-grid";
import { RequisitionKanban } from "../../../models/requisicoes/RequisitionKanban";
import { useRequisitionKanban } from "../../../hooks/requisicoes/useRequisitionKanban";
import BaseToolBar from "../../../components/shared/BaseToolBar";
import BaseDropdown from "../../../components/shared/BaseDropdown";
import BaseTableToolBar from "../../../components/shared/BaseTableToolBar";
import { debounce } from "lodash";
import RequisitionFormModal from "../../../components/requisicoes/RequisitionFormModal";
import { useNavigate } from "react-router-dom";
import UpperNavigation from "../../../components/shared/UpperNavigation";
import BaseDeleteDialog from "../../../components/shared/BaseDeleteDialog";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { FixedSizeGrid } from "react-window";
import DataCard from "../../../components/shared/DataCard";
import RequisitionCard from "../../../components/requisicoes/RequisitionCard";
import { User, ReducedUser } from "../../../models/User";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { setViewingProducts } from "../../../redux/slices/productSlice";
import ProductsTable from "../../../components/requisicoes/ProductsTable";
import CloseIcon from "@mui/icons-material/Close";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import { ColumnReorderDialog } from "../../../components/shared/ColumnReorderDialog";
import { usePersistedColumnOrder, ColumnPreference } from "../../../hooks/table/usePersistedColumnOrder";
import NotificationBell from "../../../components/requisicoes/NotificationBell";
import { getRequisitionUrgencyLevel } from "../../../utils";
import { Requisition } from "../../../models/requisicoes/Requisition";

const REQUISITION_TABLE_KEY = "requisition-list";

const RequisitionListPage = () => {
  useRequisitionKanban();
  const [triggerFetch, setTriggerFetch] = useState(0);
  const [columnOrderDialogOpen, setColumnOrderDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.user.user);
  const { rows } = useSelector((state: RootState) => state.requisitionTable);
  const navigate = useNavigate();
  const gridContainerRef = React.useRef<HTMLDivElement>(null);
  const latestRequestIdRef = React.useRef(0);
  const {
    searchTerm,
    filters,
    loading,
    selectedRow,
    kanbans,
    selectedKanban,
    requisitionBeingDeletedId,
    doneReqFilter,
    cancelledReqFilter,
  } = useSelector((state: RootState) => state.requisitionTable);

  const {isMobile } = useIsMobile();
  const {viewingProducts} = useSelector((state: RootState) => state.productSlice);
  const changeSelectedRow = (row: any) => {
    dispatch(setSelectedRow(row));
  };
  const gridRef = useGridApiRef();

  const handleChangeFilters = React.useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      field: string
    ) => {
      let value: any = e.target.value;
      if (!isNaN(Number(value)) && value.trim() !== "") {
        value = Number(value);
      }
      dispatch(setFilters({ ...filters, [field]: value }));
    },
    [dispatch, filters]
  );

  const { columns: rawColumns } = useRequisitionColumns(
    handleChangeFilters,
    changeSelectedRow,
    gridRef,
    rows
  );

  const { orderedColumns: columns, columnVisibilityModel, saveColumnOrder, removeColumnOrder } = usePersistedColumnOrder(
    REQUISITION_TABLE_KEY,
    user!,
    rawColumns
  );
  const handleChangeKanban = React.useCallback(
    (event: SelectChangeEvent<unknown>) => {
      const selectedKanban = kanbans.find(
        (kanban: RequisitionKanban) =>
          kanban.id_kanban_requisicao === Number(event.target.value)
      );
      if (selectedKanban) {
        dispatch(setSelectedKanban(selectedKanban));
        return;
      }
    },
    [kanbans, dispatch]
  );

  const handleChangeSearchTerm = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      dispatch(setSearchTerm(value.toLowerCase()));
    },
    [dispatch]
  );

  const getRowClassName = React.useCallback((params: any) => {
    if (selectedKanban?.id_kanban_requisicao !== 1) {
      return '';
    }

    const requisition = params.row as Requisition;
    const urgencyLevel = getRequisitionUrgencyLevel(
      requisition.id_status_requisicao,
      requisition.data_ultima_alteracao_status
    );

    if (urgencyLevel === 'critical') {
      return 'requisition-critical';
    } else if (urgencyLevel === 'warning') {
      return 'requisition-warning';
    }

    return '';
  },[selectedKanban]);

  const handleDeleteRequisition = async () => {
    if (!requisitionBeingDeletedId) return;
    try {
      await RequisitionService.delete(requisitionBeingDeletedId);
      dispatch(setRequisitionBeingDeletedId(null));
      dispatch(removeRow(requisitionBeingDeletedId));
      dispatch(
        setFeedback({
          message: "Requisição deletada com sucesso",
          type: "success",
        })
      );
    } catch (e) {
      dispatch(
        setFeedback({
          message: "Houve um erro ao deletar a requisição",
          type: "error",
        })
      );
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleCleanFilter = () => { 
    dispatch(clearfilters());
  };

  const handleApplyColumnOrder = (preferences: ColumnPreference[]) => {
    saveColumnOrder(preferences);
  };

  const removeSavedColumnOrder = async () => {
    await removeColumnOrder()
    setColumnOrderDialogOpen(false)
  }

  const handleFilterConcluidos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    dispatch(setDoneReqFilter(checked));
  };

  const handleFilterCancelados = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    dispatch(setCancelledReqFilter(checked));
  };

  const debouncedHandleChangeSearchTerm = useMemo(() => { 
    return debounce(handleChangeSearchTerm, 500);
  }, [handleChangeSearchTerm]);

  const goToRequisitionDetails = React.useCallback(
    (id: number) => {
      // Mantém a pesquisa global salva ao abrir uma requisição: ao voltar,
      // a lista reexibe o mesmo texto e o mesmo resultado (igual aos filtros).
      // flush() grava no Redux o termo digitado que ainda esteja pendente no debounce.
      debouncedHandleChangeSearchTerm.flush();
      navigate(`/requisicoes/${id}`);
    },
    [debouncedHandleChangeSearchTerm, navigate]
  );

  const navigateToRequisitionDetails = (params: any) => {
    if (params.field === "actions") return;
    const { id } = params;
    goToRequisitionDetails(Number(id));
  };

  const fetchData = React.useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;
    dispatch(setLoading(true));

    try {
      const data = await RequisitionService.getMany(user as User, {
        id_kanban_requisicao: selectedKanban?.id_kanban_requisicao,
        searchTerm,
        filters,
        doneReqFilter,
        cancelledReqFilter,
        removeAdmView: true,
      });

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      dispatch(setRows(data));
    } catch (e: any) {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      dispatch(
        setFeedback({
          message: "Houve um erro ao buscar requisições",
          type: "error",
        })
      );
    } finally {
      if (requestId === latestRequestIdRef.current) {
        dispatch(setLoading(false));
      }
    }
  }, [
    dispatch,
    user,
    selectedKanban,
    searchTerm,
    filters,
    triggerFetch,
    doneReqFilter,
    cancelledReqFilter 
  ])

  useEffect(() => {
    if (selectedKanban && user) fetchData()
  }, [
    selectedKanban,
    searchTerm,
    filters,
    fetchData,
    user,
    doneReqFilter,
    cancelledReqFilter,
  ])

  return (
    <Box sx={{ height: "100vh", width: "100%" }}>
      <UpperNavigation handleBack={handleBack} />
      <Box
        sx={{
          height: "calc(100% - 40px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BaseToolBar transparent={false}>
          <Box sx={{ display: "flex", gap: 2, boxShadow: "none" }}>
            {isMobile ? (
              <BaseDropdown
                label="Kanban"
                options={kanbans.map((kanban: RequisitionKanban) => ({
                  label: kanban.nome,
                  value: kanban.id_kanban_requisicao,
                }))}
                value={selectedKanban?.id_kanban_requisicao || ""}
                onChange={handleChangeKanban}
                backgroundColor={""}
              />
            ) : (
              kanbans.map((kanban: RequisitionKanban) => (
                <Button
                  key={kanban.id_kanban_requisicao}
                  onClick={() => dispatch(setSelectedKanban(kanban))}
                  sx={{
                    backgroundColor:
                      selectedKanban?.id_kanban_requisicao ===
                      kanban.id_kanban_requisicao
                        ? "secondary.main"
                        : "primary.main",
                    color: "white",
                    textTransform: "capitalize",
                    borderRadius: 0,
                    height: 26,
                  }}
                >
                  {kanban.nome}
                </Button>
              ))
            )}
          </Box>
          <Box
            sx={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <RequisitionFormModal />
            <NotificationBell />
            {!isMobile && (
              <Tooltip title="Ordenar colunas">
                <IconButton
                  onClick={() => setColumnOrderDialogOpen(true)}
                  sx={{ color: "white", height: 26, width: 26, borderRadius: 0 }}
                >
                  <OpenWithIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {!isMobile && (
              <Button
                sx={{
                  color: "white",
                  textTransform: "capitalize",
                  borderRadius: 0,
                  height: 26,
                }}
                startIcon={<Inventory2Icon />}
                onClick={() => dispatch(setViewingProducts(true))}
              >
                Produtos
              </Button>
            )}
          </Box>
        </BaseToolBar>
        <BaseTableToolBar
          handleChangeSearchTerm={debouncedHandleChangeSearchTerm}
          searchValue={searchTerm}
          searchInputStyles={{ width: 400 }}
        >
          {!isMobile && selectedKanban?.id_kanban_requisicao === 5 && (
            <>
              <Box sx={{ display: "inline-flex", alignItems: "center", ml: 2 }}>
                <input
                  type="checkbox"
                  id="filter-concluidos"
                  onChange={handleFilterConcluidos}
                  checked={doneReqFilter}
                />
                <label
                  htmlFor="filter-concluidos"
                  style={{ marginLeft: 4, fontSize: 14 }}
                >
                  Concluídos
                </label>
              </Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", ml: 2 }}>
                <input
                  type="checkbox"
                  id="filter-cancelados"
                  onChange={handleFilterCancelados}
                  checked={cancelledReqFilter}
                />
                <label
                  htmlFor="filter-cancelados"
                  style={{ marginLeft: 4, fontSize: 14 }}
                >
                  Cancelados
                </label>
              </Box>
              <Button
                sx={{ height: 30, borderRadius: 0 }}
                variant="contained"
                onClick={handleCleanFilter}
              >
                Limpar filtros
              </Button>
            </>
          )}
        </BaseTableToolBar>
        {isMobile ? (
          <Box
            ref={gridContainerRef}
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 1,
            }}
          >
            <FixedSizeGrid
              style={{ margin: "auto" }}
              columnWidth={gridContainerRef.current?.offsetWidth || 300}
              rowHeight={260}
              columnCount={1}
              rowCount={rows.length}
              width={gridContainerRef.current?.offsetWidth || 300}
              height={gridContainerRef.current?.offsetHeight || 400}
            >
              {({ columnIndex, rowIndex, style }) => {
                const itemIndex = rowIndex
                const requisition = rows[itemIndex]
                if (!requisition) return null
                return (
                  <RequisitionCard
                    req={requisition}
                    style={style}
                    onClickDetails={() =>
                      goToRequisitionDetails(requisition.ID_REQUISICAO)
                    }
                  />
                )
              }}
            </FixedSizeGrid>
          </Box>
        ) : (
          <BaseDataTable
            apiRef={gridRef}
            rows={rows}
            disableColumnMenu
            disableColumnFilter
            rowHeight={40}
            columns={columns}
            columnVisibilityModel={columnVisibilityModel}
            loading={loading}
            onCellClick={(params: { field: string }) =>
              params.field !== "actions" && navigateToRequisitionDetails(params)
            }
            getRowId={(row: any) => row.ID_REQUISICAO}
            getRowClassName={getRowClassName}
            theme={theme}
            sx={{
              "& .requisition-warning": {
                backgroundColor: "#fff3cc !important",
              },
              "& .requisition-critical": {
                backgroundColor: "#ffcccc !important",
              },
            }}
          />
        )}
      </Box>
      <BaseDetailModal
        open={selectedRow !== null}
        onClose={() => dispatch(setSelectedRow(null))}
        columns={columns}
        row={selectedRow}
        ref={gridRef}
      />
      <BaseDeleteDialog
        open={requisitionBeingDeletedId !== null}
        onConfirm={handleDeleteRequisition}
        onCancel={() => dispatch(setRequisitionBeingDeletedId(null))}
      />

      <ColumnReorderDialog
        open={columnOrderDialogOpen}
        onClose={() => setColumnOrderDialogOpen(false)}
        columns={columns
          .filter((col) => col.field !== "actions" && col.headerName)
          .map((col) => ({ field: col.field, headerName: col.headerName!, hidden: columnVisibilityModel[col.field] === false }))}
        onApply={handleApplyColumnOrder}
        onRemoveSavedOrder={removeSavedColumnOrder}
      />

      <Dialog
        open={viewingProducts}
        onClose={() => dispatch(setViewingProducts(false))}
        fullScreen
      >
        <IconButton
          onClick={() => dispatch(setViewingProducts(false))}
          sx={{ position: "absolute", top: 0, right: 0, color: "red" }}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle>Produtos</DialogTitle>
        <DialogContent sx={{ display: "flex" }}>
          <Box sx={{ flexGrow: 1 }}>
            <ProductsTable tipoFaturamento={0} />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
};

export default RequisitionListPage;

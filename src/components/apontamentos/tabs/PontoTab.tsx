import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  setRows as setPontoRows,
  setSelectedRow as setPontoSelectedRow,
  setLoading as setPontoLoading,
  setFilters as setPontoFilters,
  clearFilters as clearPontoFilters,
  setPage as setPontoPage,
  setPageSize as setPontoPageSize,
  setTotalRows as setPontoTotalRows,
} from "../../../redux/slices/apontamentos/pontoTableSlice";
import { CommonFilters as CommonFilterValues } from "../../../redux/slices/apontamentos/commonFiltersSlice";
import { setFeedback } from "../../../redux/slices/feedBackSlice";
import { clearCommonFilters } from "../../../redux/slices/apontamentos/commonFiltersSlice";
import NotesService from "../../../services/NotesService";
import { Box, Button, useTheme, FormControlLabel, Checkbox, Tooltip, IconButton } from "@mui/material";
import OpenWithIcon from '@mui/icons-material/OpenWith'
import { usePontoColumns } from "../../../hooks/apontamentos/usePontoColumns";
import BaseDataTable from "../../shared/BaseDataTable";
import BaseDetailModal from "../../shared/BaseDetailModal";
import { useGridApiRef } from "@mui/x-data-grid";
import { Ponto } from "../../../models/Ponto";
import CommonFilters from "../CommonFilters";
import { ColumnReorderDialog } from "../../shared/ColumnReorderDialog";
import { usePersistedColumnOrder, ColumnPreference } from "../../../hooks/table/usePersistedColumnOrder";
const TABLE_KEY='point-list'

interface AppliedPontoQuery {
  filters: any;
  searchTerm: string;
}


const PontoTab: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const gridRefPonto = useGridApiRef();

  const {
    rows: pontoRows,
    loading: pontoLoading,
    selectedRow: pontoSelectedRow,
    filters: pontoFilters,
    page: pontoPage,
    pageSize: pontoPageSize,
    totalRows: pontoTotalRows,
  } = useSelector((state: RootState) => state.pontoTable);
  const commonFilters = useSelector((state: RootState) => state.commonFilters.filters);
  const user = useSelector((state: RootState) => state.user.user);
  const [hasBootstrappedQuery, setHasBootstrappedQuery] = useState(false);
  const [columnOrderDialogOpen, setColumnOrderDialogOpen] = useState(false)
  const [appliedQuery, setAppliedQuery] = useState<AppliedPontoQuery | null>(null);

  const handleChangePontoFilters = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
      const value = e.target.value;
      dispatch(setPontoFilters({ ...pontoFilters, [field]: value }));
    },
    [dispatch, pontoFilters]
  );

  const handleChangePontoCheckbox = useCallback(
    (field: string, checked: boolean) => {
      dispatch(setPontoFilters({ ...pontoFilters, [field]: checked }));
    },
    [dispatch, pontoFilters]
  );

  const changePontoSelectedRow = useCallback(
    (row: Ponto | null) => {
      dispatch(setPontoSelectedRow(row));
    },
    [dispatch]
  );

  const handleTogglePontoField = useCallback(
    async (codapont: number, field: string, nextValue: boolean) => {
      try {
        const result = await NotesService.updatePontoField(codapont, field, nextValue);
        dispatch(
          setPontoRows(
            pontoRows.map((row) =>
              row.CODAPONT === codapont
                ? {
                    ...row,
                    ...result,
                    [field]: nextValue,
                    ...(field === "AJUSTADO" && nextValue ? { PROBLEMA: false } : {}),
                  }
                : row
            )
          )
        );
      } catch (e: any) {
        dispatch(
          setFeedback({
            message: e.message || "Erro ao atualizar campo",
            type: "error",
          })
        );
      }
    },
    [dispatch, pontoRows]
  );

  const { columns: rawColumns } = usePontoColumns(
    handleChangePontoFilters,
    handleTogglePontoField,
    !!(user?.PERM_APONTAMENTO_PONTO || user?.PERM_ADMINISTRADOR),
    !!(user?.PERM_APONTAMENTO_PONTO_JUSTIFICATIVA || user?.PERM_ADMINISTRADOR)
  );

  const { orderedColumns: columns, columnVisibilityModel, saveColumnOrder, removeColumnOrder } = usePersistedColumnOrder(
    TABLE_KEY,
    user!,
    rawColumns
  );

  const handleApplyColumnOrder = (preferences: ColumnPreference[]) => {
    saveColumnOrder(preferences);
  };

  const removeSavedColumnOrder = async () => {
    await removeColumnOrder()
    setColumnOrderDialogOpen(false)
  }

  const handleCleanPontoFilter = useCallback(() => {
    dispatch(clearPontoFilters());
    dispatch(clearCommonFilters());
  }, [dispatch]);

  const handleSearch = useCallback((nextCommonFilters?: CommonFilterValues) => {
    const sourceFilters = nextCommonFilters ?? commonFilters;
    dispatch(setPontoPage(0));
    setAppliedQuery({
      filters: {
        ...pontoFilters,
        DATA_DE: sourceFilters.DATA_DE,
        DATA_ATE: sourceFilters.DATA_ATE,
        ATIVOS: sourceFilters.ATIVOS,
      },
      searchTerm: sourceFilters.searchTerm,
    });
  }, [dispatch, pontoFilters, commonFilters]);

  const handleProcessRowUpdate = useCallback(
    async (newRow: Ponto, oldRow: Ponto): Promise<Ponto> => {
      if (newRow.MOTIVO_PROBLEMA !== oldRow.MOTIVO_PROBLEMA) {
        try {
          const result = await NotesService.updatePontoField(newRow.CODAPONT, "MOTIVO_PROBLEMA", newRow.MOTIVO_PROBLEMA || "");
          const updatedRow = { ...newRow, DATA_HORA_MOTIVO: result.DATA_HORA_MOTIVO ?? newRow.DATA_HORA_MOTIVO };
          dispatch(
            setPontoRows(
              pontoRows.map((row) =>
                row.CODAPONT === newRow.CODAPONT ? updatedRow : row
              )
            )
          );
          return updatedRow;
        } catch (e: any) {
          dispatch(
            setFeedback({
              message: e.message || "Erro ao atualizar motivo",
              type: "error",
            })
          );
          return oldRow;
        }
      }

      if (newRow.JUSTIFICATIVA !== oldRow.JUSTIFICATIVA) {
        try {
          const result = await NotesService.updatePontoField(newRow.CODAPONT, "JUSTIFICATIVA", newRow.JUSTIFICATIVA || "");
          const updatedRow = {
            ...newRow,
            DATA_HORA_JUSTIFICATIVA: result.DATA_HORA_JUSTIFICATIVA ?? newRow.DATA_HORA_JUSTIFICATIVA,
            JUSTIFICADO_POR: result.JUSTIFICADO_POR ?? newRow.JUSTIFICADO_POR,
          };
          dispatch(
            setPontoRows(
              pontoRows.map((row) =>
                row.CODAPONT === newRow.CODAPONT ? updatedRow : row
              )
            )
          );
          return updatedRow;
        } catch (e: any) {
          dispatch(
            setFeedback({
              message: e.message || "Erro ao atualizar justificativa",
              type: "error",
            })
          );
          return oldRow;
        }
      }

      return newRow;
    },
    [dispatch, pontoRows]
  );

  const fetchPontoData = useCallback(async () => {
    if (!appliedQuery) return;
    dispatch(setPontoLoading(true));
    try {
      const response = await NotesService.getManyPonto({
        filters: appliedQuery.filters,
        searchTerm: appliedQuery.searchTerm,
        page: pontoPage,
        pageSize: pontoPageSize,
      });
      dispatch(setPontoRows(response.data));
      dispatch(setPontoTotalRows(response.total));
    } catch (e: any) {
      dispatch(
        setFeedback({
          message: e.message || "Houve um erro ao buscar dados de ponto",
          type: "error",
        })
      );
    } finally {
      dispatch(setPontoLoading(false));
    }
  }, [dispatch, appliedQuery, pontoPage, pontoPageSize]);

  useEffect(() => {
    if (hasBootstrappedQuery) return;

    setHasBootstrappedQuery(true);
    setAppliedQuery({
      filters: {
        ...pontoFilters,
        DATA_DE: commonFilters.DATA_DE,
        DATA_ATE: commonFilters.DATA_ATE,
        ATIVOS: commonFilters.ATIVOS,
      },
      searchTerm: commonFilters.searchTerm,
    });
  }, [hasBootstrappedQuery, pontoFilters, commonFilters]);

  useEffect(() => {
    if (appliedQuery) {
      fetchPontoData();
    }
  }, [fetchPontoData, appliedQuery]);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          padding: 0.5,
          backgroundColor: "white",
          borderRadius: "0",
          border: "1px solid lightgray",
          marginTop: "5px",
        }}
      >
        <CommonFilters disabled={pontoLoading} onSearch={handleSearch} />

        <FormControlLabel
          control={
            <Checkbox
              checked={pontoFilters.PROBLEMA}
              onChange={(e) => handleChangePontoCheckbox("PROBLEMA", e.target.checked)}
              size="small"
              disabled={pontoLoading}
            />
          }
          label="Com Problema"
          sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={pontoFilters.AJUSTADO}
              onChange={(e) => handleChangePontoCheckbox("AJUSTADO", e.target.checked)}
              size="small"
              disabled={pontoLoading}
            />
          }
          label="Ajustado"
          sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }}
        />

        <Button
          sx={{ height: 32, borderRadius: 0, fontSize: 12 }}
          variant="contained"
          onClick={handleCleanPontoFilter}
          disabled={pontoLoading}
        >
          Limpar filtros
        </Button>
        <Tooltip title="Ordenar colunas">
          <IconButton
            onClick={() => setColumnOrderDialogOpen(true)}
            sx={{ color: "primary.main", height: 26, width: 26, borderRadius: 0 }}
          >
            <OpenWithIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <BaseDataTable
        apiRef={gridRefPonto}
        rows={pontoRows}
        disableColumnMenu
        disableColumnFilter
        rowHeight={40}
        columns={columns}
        columnVisibilityModel={columnVisibilityModel}
        loading={pontoLoading}
        getRowId={(row: any) => row.CODAPONT}
        theme={theme}
        paginationMode="server"
        rowCount={pontoTotalRows}
        paginationModel={{ page: pontoPage, pageSize: pontoPageSize }}
        onPaginationModelChange={(model: { page: number; pageSize: number }) => {
          dispatch(setPontoPage(model.page));
          dispatch(setPontoPageSize(model.pageSize));
        }}
        pageSizeOptions={[25, 50, 100, 1000]}
        processRowUpdate={(newRow, oldRow) => handleProcessRowUpdate(newRow as Ponto, oldRow as Ponto)}
      />
      <ColumnReorderDialog
        open={columnOrderDialogOpen}
        onClose={(() => {setColumnOrderDialogOpen(false)})}
        columns={columns
          .filter((col) => col.field !== "actions" && col.headerName)
          .map((col) => ({ field: col.field, headerName: col.headerName!, hidden: columnVisibilityModel[col.field] === false }))
        }
        onApply={handleApplyColumnOrder}
        onRemoveSavedOrder={removeSavedColumnOrder}
      />
    </>
  );
};

export default PontoTab;

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  setRows as setProblemaRows,
  setSelectedRow as setProblemaSelectedRow,
  setLoading as setProblemaLoading,
  setFilters as setProblemaFilters,
  clearFilters as clearProblemaFilters,
  setPage as setProblemaPage,
  setPageSize as setProblemaPageSize,
  setTotalRows as setProblemaRowCount,
} from "../../../redux/slices/apontamentos/problemaTableSlice";
import { CommonFilters as CommonFilterValues } from "../../../redux/slices/apontamentos/commonFiltersSlice";
import { setFeedback } from "../../../redux/slices/feedBackSlice";
import { clearCommonFilters } from "../../../redux/slices/apontamentos/commonFiltersSlice";
import NotesService from "../../../services/NotesService";
import { Box, Button, useTheme, FormControlLabel, Checkbox, Tooltip, IconButton } from "@mui/material";
import { useProblemaColumns } from "../../../hooks/apontamentos/useProblemaColumns";
import BaseDataTable from "../../shared/BaseDataTable";
import BaseDetailModal from "../../shared/BaseDetailModal";
import { useGridApiRef } from "@mui/x-data-grid";
import OpenWithIcon from '@mui/icons-material/OpenWith'
import { Problema } from "../../../models/Problema";
import CommonFilters from "../CommonFilters";
import { ColumnReorderDialog } from "../../shared/ColumnReorderDialog";
import { usePersistedColumnOrder, ColumnPreference } from "../../../hooks/table/usePersistedColumnOrder";
const TABLE_KEY='problems-list'

interface AppliedProblemaQuery {
  filters: any;
  searchTerm: string;
}

const ProblemasTab: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const gridRefProblema = useGridApiRef();

  const {
    rows: problemaRows,
    loading: problemaLoading,
    selectedRow: problemaSelectedRow,
    filters: problemaFilters,
    page: problemaPage,
    pageSize: problemaPageSize,
    totalRows: problemaTotalRows,
  } = useSelector((state: RootState) => state.problemaTable);
  const commonFilters = useSelector((state: RootState) => state.commonFilters.filters);
  const user = useSelector((state: RootState) => state.user.user);
  const [hasBootstrappedQuery, setHasBootstrappedQuery] = useState(false);
  const [columnOrderDialogOpen, setColumnOrderDialogOpen] = useState(false)
  const [appliedQuery, setAppliedQuery] = useState<AppliedProblemaQuery | null>(null);

  const handleChangeProblemaFilters = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
      const value = e.target.value;
      dispatch(setProblemaFilters({ ...problemaFilters, [field]: value }));
    },
    [dispatch, problemaFilters]
  );

  const handleChangeProblemaCheckbox = useCallback(
    (field: string, checked: boolean) => {
      dispatch(setProblemaFilters({ ...problemaFilters, [field]: checked }));
    },
    [dispatch, problemaFilters]
  );

  const changeProblemaSelectedRow = useCallback(
    (row: Problema | null) => {
      dispatch(setProblemaSelectedRow(row));
    },
    [dispatch]
  );

  const handleColumnFilterEnter = useCallback((field: string, value: string) => {
    const nextFilters = { ...problemaFilters, [field]: value };
    dispatch(setProblemaFilters(nextFilters));
    dispatch(setProblemaPage(0));
    setAppliedQuery({
      filters: {
        ...nextFilters,
        DATA_DE: commonFilters.DATA_DE,
        DATA_ATE: commonFilters.DATA_ATE,
        ATIVOS: commonFilters.ATIVOS,
      },
      searchTerm: commonFilters.searchTerm,
    });
  }, [dispatch, problemaFilters, commonFilters]);

  const { columns: rawColumns } = useProblemaColumns(handleChangeProblemaFilters, handleColumnFilterEnter);

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

  const handleCleanProblemaFilter = useCallback(() => {
    dispatch(clearProblemaFilters());
    dispatch(clearCommonFilters());
  }, [dispatch]);

  const handleSearch = useCallback((nextCommonFilters?: CommonFilterValues) => {
    const sourceFilters = nextCommonFilters ?? commonFilters;
    dispatch(setProblemaPage(0));
    setAppliedQuery({
      filters: {
        ...problemaFilters,
        DATA_DE: sourceFilters.DATA_DE,
        DATA_ATE: sourceFilters.DATA_ATE,
        ATIVOS: sourceFilters.ATIVOS,
      },
      searchTerm: sourceFilters.searchTerm,
    });
  }, [dispatch, problemaFilters, commonFilters]);

  const navigateToProblemaDetails = useCallback(
    (params: any) => {
      if (params.field === "actions") return;
      changeProblemaSelectedRow(params.row);
    },
    [changeProblemaSelectedRow]
  );

  const fetchProblemaData = useCallback(async () => {
    if (!appliedQuery) return;
    dispatch(setProblemaLoading(true));
    try {
      const response = await NotesService.getManyProblema({
        filters: appliedQuery.filters,
        searchTerm: appliedQuery.searchTerm,
        page: problemaPage,
        pageSize: problemaPageSize,
      });
      dispatch(setProblemaRows(response.data));
      dispatch(setProblemaRowCount(response.total));
    } catch (e: any) {
      dispatch(
        setFeedback({
          message: e.message || "Houve um erro ao buscar dados de problemas",
          type: "error",
        })
      );
    } finally {
      dispatch(setProblemaLoading(false));
    }
  }, [dispatch, appliedQuery, problemaPage, problemaPageSize]);

  useEffect(() => {
    if (hasBootstrappedQuery) return;

    setHasBootstrappedQuery(true);
    setAppliedQuery({
      filters: {
        ...problemaFilters,
        DATA_DE: commonFilters.DATA_DE,
        DATA_ATE: commonFilters.DATA_ATE,
        ATIVOS: commonFilters.ATIVOS,
      },
      searchTerm: commonFilters.searchTerm,
    });
  }, [hasBootstrappedQuery, problemaFilters, commonFilters]);

  useEffect(() => {
    if (appliedQuery) {
      fetchProblemaData();
    }
  }, [fetchProblemaData, appliedQuery]);

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
        <CommonFilters disabled={problemaLoading} onSearch={handleSearch} />

        <FormControlLabel
          control={
            <Checkbox
              checked={problemaFilters.COMENTADO}
              onChange={(e) => handleChangeProblemaCheckbox("COMENTADO", e.target.checked)}
              size="small"
              disabled={problemaLoading}
            />
          }
          label="Comentados"
          sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }}
        />

        <Button
          sx={{ height: 32, borderRadius: 0, fontSize: 12 }}
          variant="contained"
          onClick={handleCleanProblemaFilter}
          disabled={problemaLoading}
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
        apiRef={gridRefProblema}
        rows={problemaRows}
        disableColumnMenu
        disableColumnFilter
        rowHeight={40}
        columns={columns}
        columnVisibilityModel={columnVisibilityModel}
        loading={problemaLoading}
        onCellClick={(params: { field: string }) =>
          params.field !== "actions" && navigateToProblemaDetails(params)
        }
        getRowId={(row: any) => row.CODAPONT}
        theme={theme}
        paginationMode="server"
        rowCount={problemaTotalRows}
        paginationModel={{ page: problemaPage, pageSize: problemaPageSize }}
        onPaginationModelChange={(model: { page: number; pageSize: number }) => {
          dispatch(setProblemaPage(model.page));
          dispatch(setProblemaPageSize(model.pageSize));
        }}
        pageSizeOptions={[25, 50, 100, 1000]}
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

export default ProblemasTab;

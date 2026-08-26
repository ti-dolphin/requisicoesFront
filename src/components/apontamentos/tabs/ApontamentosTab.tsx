import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  setRows,
  setLoading,
  setFilters,
  clearFilters,
  setPage,
  setPageSize,
  setRefreshNotes,
  setTotalRows,
} from "../../../redux/slices/apontamentos/notesTableSlice";
import { CommonFilters as CommonFilterValues } from "../../../redux/slices/apontamentos/commonFiltersSlice";
import OpenWithIcon from '@mui/icons-material/OpenWith'
import { setFeedback } from "../../../redux/slices/feedBackSlice";
import { clearCommonFilters } from "../../../redux/slices/apontamentos/commonFiltersSlice";
import NotesService from "../../../services/NotesService";
import { Box, Button, useTheme, FormControlLabel, Checkbox, CircularProgress, Tooltip, IconButton, Menu, MenuItem, ListItemText } from "@mui/material";
import { useNotesColumns } from "../../../hooks/apontamentos/useNotesColumns";
import BaseDataTable from "../../shared/BaseDataTable";
import { useGridApiRef, GridRowSelectionModel } from "@mui/x-data-grid";
import NoteCommentDialog from "../NoteCommentDialog";
import CommonFilters from "../CommonFilters";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { formatNotesForExcel, exportToExcel } from "../../../utils/excelExport";
import { ColumnReorderDialog } from "../../shared/ColumnReorderDialog";
import { usePersistedColumnOrder, ColumnPreference } from "../../../hooks/table/usePersistedColumnOrder";
const TABLE_KEY='pointing-list'

interface AppliedNotesQuery {
  filters: any;
  searchTerm: string;
}

interface StatusApontamentoOption {
  CODSTATUSAPONT: string;
  DESCRICAO: string;
}

const normalizeDateValue = (value: unknown): string | null => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split("T")[0];
  }

  const asString = String(value).trim();
  if (!asString) return null;
  return asString.split("T")[0] || null;
};

const getNextFolgaDate = (value: unknown): Date | null => {
  const normalized = normalizeDateValue(value);
  if (!normalized) return null;

  const lastFolgaDate = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(lastFolgaDate.getTime())) return null;

  lastFolgaDate.setDate(lastFolgaDate.getDate() + 60);
  return lastFolgaDate;
};

const isWithinNextTwoWeeks = (value: unknown): boolean => {
  const nextFolgaDate = getNextFolgaDate(value);
  if (!nextFolgaDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const twoWeeksFromNow = new Date(today);
  twoWeeksFromNow.setDate(today.getDate() + 14);

  return nextFolgaDate >= today && nextFolgaDate <= twoWeeksFromNow;
};

interface ApontamentosTabProps {
  selectedApontamentos: GridRowSelectionModel;
  onSelectionChange: (selection: GridRowSelectionModel) => void;
  onApontarClick: () => void;
}

const ApontamentosTab: React.FC<ApontamentosTabProps> = ({
  selectedApontamentos,
  onSelectionChange,
  onApontarClick,
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const gridRef = useGridApiRef();

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedCodapont, setSelectedCodapont] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [columnOrderDialogOpen, setColumnOrderDialogOpen] = useState(false)
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [statusOptions, setStatusOptions] = useState<StatusApontamentoOption[]>([]);

  const { rows, loading, filters, page, pageSize, totalRows, refreshNotes } = useSelector(
    (state: RootState) => state.notesTable
  );
  const commonFilters = useSelector((state: RootState) => state.commonFilters.filters);
  const user = useSelector((state: RootState) => state.user.user);
  const [hasBootstrappedQuery, setHasBootstrappedQuery] = useState(false);
  const [appliedQuery, setAppliedQuery] = useState<AppliedNotesQuery | null>(null);

  const handleChangeFilters = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
      const value = e.target.value;
      dispatch(setFilters({ ...filters, [field]: value }));
    },
    [dispatch, filters]
  );

  const handleChangeCheckbox = useCallback(
    (field: string, checked: boolean) => {
      dispatch(setFilters({ ...filters, [field]: checked }));
    },
    [dispatch, filters]
  );

  const handleCleanFilter = useCallback(() => {
    dispatch(clearFilters());
    dispatch(clearCommonFilters());
  }, [dispatch]);

  const handleColumnFilterEnter = useCallback((field: string, value: string) => {
    const nextFilters = { ...filters, [field]: value };
    dispatch(setFilters(nextFilters));
    dispatch(setPage(0));
    setAppliedQuery({
      filters: {
        ...nextFilters,
        DATA_DE: commonFilters.DATA_DE,
        DATA_ATE: commonFilters.DATA_ATE,
        ATIVOS: commonFilters.ATIVOS,
      },
      searchTerm: commonFilters.searchTerm,
    });
  }, [dispatch, filters, commonFilters]);

  const openStatusMenu = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchorEl(event.currentTarget);
  };

  const closeStatusMenu = () => {
    setStatusMenuAnchorEl(null);
  };

  const toggleStatusFilter = useCallback((statusCode: string, checked: boolean) => {
    const currentCodes = filters.CODSTATUSAPONT_IN || [];
    const nextCodes = checked
      ? [...currentCodes, statusCode]
      : currentCodes.filter((code) => code !== statusCode);

    const nextFilters = {
      ...filters,
      CODSTATUSAPONT_IN: Array.from(new Set(nextCodes)),
    };

    dispatch(setFilters(nextFilters));
    dispatch(setPage(0));
    setAppliedQuery({
      filters: {
        ...nextFilters,
        DATA_DE: commonFilters.DATA_DE,
        DATA_ATE: commonFilters.DATA_ATE,
        ATIVOS: commonFilters.ATIVOS,
      },
      searchTerm: commonFilters.searchTerm,
    });
  }, [dispatch, filters, commonFilters]);

  const handleCommentClick = useCallback((codapont: number) => {
    setSelectedCodapont(codapont);
    setCommentDialogOpen(true);
  }, []);

  const canEditFolgaCampo = !!(user?.PERM_APONT || user?.PERM_ADMINISTRADOR);
  const { columns: rawColumns } = useNotesColumns(handleChangeFilters, handleCommentClick, canEditFolgaCampo, handleColumnFilterEnter);

  const { orderedColumns: columns, columnVisibilityModel, saveColumnOrder, removeColumnOrder } = usePersistedColumnOrder(
    TABLE_KEY,
    user!,
    rawColumns
  );

  const handleExportExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await NotesService.getAllForExport({
        filters: {
          ...filters,
          DATA_DE: commonFilters.DATA_DE,
          DATA_ATE: commonFilters.DATA_ATE,
          ATIVOS: commonFilters.ATIVOS,
        },
        searchTerm: commonFilters.searchTerm,
      });

      if (!response.data || response.data.length === 0) {
        dispatch(
          setFeedback({
            message: "Não há dados para exportar com os filtros aplicados",
            type: "error",
          })
        );
        return;
      }

      const formattedData = formatNotesForExcel(response.data, columns, columnVisibilityModel);

      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
      const fileName = `Apontamentos_${dateStr}`;

      exportToExcel(formattedData, fileName, 'Apontamentos');

      dispatch(
        setFeedback({
          message: `${response.data.length} registros exportados com sucesso`,
          type: "success",
        })
      );
    } catch (e: any) {
      dispatch(
        setFeedback({
          message: e.message || "Houve um erro ao exportar os dados",
          type: "error",
        })
      );
    } finally {
      setIsExporting(false);
    }
  }, [dispatch, filters, commonFilters, columns, columnVisibilityModel]);

  const handleCloseCommentDialog = useCallback(() => {
    setCommentDialogOpen(false);
    setSelectedCodapont(null);
  }, []);

  const handleCommentChange = useCallback(() => {
    dispatch(setRefreshNotes(!refreshNotes));
  }, [dispatch, refreshNotes]);

  const handleSearch = useCallback((nextCommonFilters?: CommonFilterValues) => {
    const sourceFilters = nextCommonFilters ?? commonFilters;
    dispatch(setPage(0));
    setAppliedQuery({
      filters: {
        ...filters,
        DATA_DE: sourceFilters.DATA_DE,
        DATA_ATE: sourceFilters.DATA_ATE,
        ATIVOS: sourceFilters.ATIVOS,
      },
      searchTerm: sourceFilters.searchTerm,
    });
  }, [dispatch, filters, commonFilters]);

  const handleApplyColumnOrder = (preferences: ColumnPreference[]) => {
    saveColumnOrder(preferences);
  };

  const removeSavedColumnOrder = async () => {
    await removeColumnOrder()
    setColumnOrderDialogOpen(false)
  }

  const handleRowClickApontamento = useCallback(
    (params: any) => {
      if (params.field === "actions" || params.field === "__check__") return;

      const rowId = params.row.CODAPONT;
      const isSelected = selectedApontamentos.includes(rowId);

      if (isSelected) {
        onSelectionChange(selectedApontamentos.filter((id) => id !== rowId));
      } else {
        onSelectionChange([...selectedApontamentos, rowId]);
      }
    },
    [selectedApontamentos, onSelectionChange]
  );

  const getRowClassName = useCallback(
    (params: any) => {
      if (!canEditFolgaCampo) return "";
      return isWithinNextTwoWeeks(params.row.DATA_ULTIMA_FOLGA_DE_CAMPO) ? "folga-warning" : "";
    },
    [canEditFolgaCampo]
  );

  const fetchData = useCallback(async () => {
    if (!appliedQuery) return;
    dispatch(setLoading(true));
    try {
      const response = await NotesService.getMany({
        filters: appliedQuery.filters,
        searchTerm: appliedQuery.searchTerm,
        page,
        pageSize,
      });
      dispatch(setRows(response.data));
      dispatch(setTotalRows(response.total));
    } catch (e: any) {
      dispatch(
        setFeedback({
          message: e.message || "Houve um erro ao buscar apontamentos",
          type: "error",
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, appliedQuery, page, pageSize, refreshNotes]);

  const fetchStatusOptions = useCallback(async () => {
    try {
      const statuses = await NotesService.getStatusApontamento();
      setStatusOptions(Array.isArray(statuses) ? statuses : []);
    } catch (e: any) {
      dispatch(
        setFeedback({
          message: e.message || "Houve um erro ao buscar os status de apontamento",
          type: "error",
        })
      );
    }
  }, [dispatch]);

  const handleProcessRowUpdate = useCallback(
    async (newRow: any, oldRow: any) => {
      const oldValue = normalizeDateValue(oldRow.DATA_ULTIMA_FOLGA_DE_CAMPO);
      const newValue = normalizeDateValue(newRow.DATA_ULTIMA_FOLGA_DE_CAMPO);

      if (oldValue === newValue) {
        return newRow;
      }

      try {
        const result = await NotesService.updateFolgaCampoByFuncionario(
          String(newRow.CHAPA),
          newValue
        );

        const updatedValue = normalizeDateValue(result.DATA_ULTIMA_FOLGA_DE_CAMPO);
        const updatedRows = rows.map((row: any) => {
          if (String(row.CHAPA) === String(newRow.CHAPA)) {
            return {
              ...row,
              DATA_ULTIMA_FOLGA_DE_CAMPO: updatedValue,
            };
          }
          return row;
        });

        dispatch(setRows(updatedRows));

        return {
          ...newRow,
          DATA_ULTIMA_FOLGA_DE_CAMPO: updatedValue,
        };
      } catch (e: any) {
        dispatch(
          setFeedback({
            message: e.message || "Houve um erro ao atualizar a data da última folga de campo",
            type: "error",
          })
        );

        return oldRow;
      }
    },
    [dispatch, rows]
  );

  useEffect(() => {
    if (hasBootstrappedQuery) return;

    setHasBootstrappedQuery(true);
    setAppliedQuery({
      filters: {
        ...filters,
        DATA_DE: commonFilters.DATA_DE,
        DATA_ATE: commonFilters.DATA_ATE,
        ATIVOS: commonFilters.ATIVOS,
      },
      searchTerm: commonFilters.searchTerm,
    });
  }, [hasBootstrappedQuery, filters, commonFilters]);

  useEffect(() => {
    if (appliedQuery) {
      fetchData();
    }
  }, [fetchData, appliedQuery]);

  useEffect(() => {
    fetchStatusOptions();
  }, [fetchStatusOptions]);

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
        <CommonFilters disabled={loading} onSearch={handleSearch} />

        <FormControlLabel
          control={
            <Checkbox
              checked={filters.COMENTADOS}
              onChange={(e) => handleChangeCheckbox("COMENTADOS", e.target.checked)}
              size="small"
              disabled={loading}
            />
          }
          label="Comentados"
          sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.SEM_ASSIDUIDADE}
              onChange={(e) => handleChangeCheckbox("SEM_ASSIDUIDADE", e.target.checked)}
              size="small"
              disabled={loading}
            />
          }
          label="Sem Assiduidade"
          sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }}
        />

        <Button
          sx={{ height: 32, borderRadius: 0, fontSize: 12 }}
          variant="contained"
          onClick={handleCleanFilter}
          disabled={loading}
        >
          Limpar filtros
        </Button>

        <Button
          sx={{ height: 32, borderRadius: 0, fontSize: 12 }}
          variant="outlined"
          onClick={openStatusMenu}
          disabled={loading || statusOptions.length === 0}
        >
          {filters.CODSTATUSAPONT_IN.length > 0
            ? `Status (${filters.CODSTATUSAPONT_IN.length})`
            : "Status"}
        </Button>

        <Menu
          anchorEl={statusMenuAnchorEl}
          open={Boolean(statusMenuAnchorEl)}
          onClose={closeStatusMenu}
          PaperProps={{ style: { maxHeight: 320, width: 280 } }}
        >
          {statusOptions.map((status) => {
            const checked = (filters.CODSTATUSAPONT_IN || []).includes(status.CODSTATUSAPONT);
            return (
              <MenuItem
                key={status.CODSTATUSAPONT}
                dense
                onClick={() => toggleStatusFilter(status.CODSTATUSAPONT, !checked)}
              >
                <Checkbox checked={checked} size="small" />
                <ListItemText primary={status.DESCRICAO} />
              </MenuItem>
            );
          })}
        </Menu>

        <Tooltip title="Ordenar colunas">
          <IconButton
            onClick={() => setColumnOrderDialogOpen(true)}
            sx={{ color: "primary.main", height: 26, width: 26, borderRadius: 0 }}
          >
            <OpenWithIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Button
          sx={{ height: 32, borderRadius: 0, fontSize: 12 }}
          variant="contained"
          onClick={handleExportExcel}
          disabled={isExporting || loading}
          startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
        >
          {isExporting ? 'Exportando...' : 'Exportar Excel'}
        </Button>

        <Button
          sx={{ height: 32, borderRadius: 0, fontSize: 12, marginLeft: "auto" }}
          variant="contained"
          color="primary"
          disabled={selectedApontamentos.length === 0 || (!user?.PERM_APONT && !user?.PERM_ADMINISTRADOR)}
          onClick={onApontarClick}
          title={(!user?.PERM_APONT && !user?.PERM_ADMINISTRADOR) ? "Você não tem permissão para apontar" : ""}
        >
          Apontar ({selectedApontamentos.length})
        </Button>
      </Box>

      <BaseDataTable
        apiRef={gridRef}
        rows={rows}
        disableColumnMenu
        disableColumnFilter
        rowHeight={26}
        columns={columns}
        columnVisibilityModel={columnVisibilityModel}
        loading={loading}
        checkboxSelection
        rowSelectionModel={selectedApontamentos}
        onRowSelectionModelChange={onSelectionChange}
        onCellClick={handleRowClickApontamento}
        getRowClassName={getRowClassName}
        getRowId={(row: any) => row.CODAPONT}
        theme={theme}
        paginationMode="server"
        rowCount={totalRows}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(model: { page: number; pageSize: number }) => {
          dispatch(setPage(model.page));
          dispatch(setPageSize(model.pageSize));
        }}
        processRowUpdate={handleProcessRowUpdate}
        pageSizeOptions={[25, 50, 100, 1000]}
        sx={{
          "& .MuiDataGrid-cell": {
            fontSize: "9.5px",
            px: 0.375,
          },
          "& .folga-warning": {
            backgroundColor: "#fff3cc !important",
          },
          "& .folga-warning:hover": {
            backgroundColor: "#ffe79a !important",
          },
          "& .folga-warning.Mui-selected": {
            backgroundColor: "#ffe08a !important",
          },
          "& .folga-warning.Mui-selected:hover": {
            backgroundColor: "#ffd866 !important",
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: theme.palette.primary.main + "30 !important",
          },
          "& .MuiDataGrid-row.Mui-selected:hover": {
            backgroundColor: theme.palette.primary.main + "40 !important",
          },
        }}
      />

      <NoteCommentDialog
        open={commentDialogOpen}
        onClose={handleCloseCommentDialog}
        codapont={selectedCodapont || 0}
        userName={user?.LOGIN || "SISTEMA"}
        onCommentChange={handleCommentChange}
      />
      <ColumnReorderDialog
        open={columnOrderDialogOpen}
        onClose={(() => {setColumnOrderDialogOpen(false)})}
        columns={columns
          .filter((col) => col.headerName)
          .map((col) => ({ field: col.field, headerName: col.headerName!, hidden: columnVisibilityModel[col.field] === false }))
        }
        onApply={handleApplyColumnOrder}
        onRemoveSavedOrder={removeSavedColumnOrder}
      />
    </>
  );
};

export default ApontamentosTab;

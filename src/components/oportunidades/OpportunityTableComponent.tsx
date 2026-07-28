import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Checkbox, IconButton, Stack, Tooltip, Typography, useTheme,} from "@mui/material";
import BaseTableToolBar from "../../components/shared/BaseTableToolBar";
import BaseDataTable from "../../components/shared/BaseDataTable";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useOpportunityColumns } from "../../hooks/oportunidades/useOpportunityColumns";
import { debounce } from "lodash";
import { setLoading, setRows, setSearchTerm, setTotals } from "../../redux/slices/oportunidades/opportunityTableSlice";
import OpportunityService from "../../services/oportunidades/OpportunityService";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { useNavigate } from "react-router-dom";
import { useOpportunityFilters } from "../../hooks/oportunidades/useOpportunityFilters";
import { useIsMobile } from "../../hooks/useIsMobile";
import { setCreating } from "../../redux/slices/oportunidades/opportunitySlice";
import { OpportunityTableFooter } from "../../components/oportunidades/OpportunityTableFooter";
import { FixedSizeGrid } from "react-window";
import OpportunityCard from "../../components/oportunidades/OpportunityCard";
import { GridCheckCircleIcon } from "@mui/x-data-grid";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import OpportunityFormModal from "../../components/oportunidades/OpportunityFormModal";
import { BaseAddButton } from "../../components/shared/BaseAddButton";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import { ColumnReorderDialog } from "../../components/shared/ColumnReorderDialog";
import { usePersistedColumnOrder, ColumnPreference } from "../../hooks/table/usePersistedColumnOrder";
const OPPORTUNITY_TABLE_KEY='opportunity-list'

const OpportunityTableComponent = () => {
const dispatch = useDispatch();
const user = useSelector((state: RootState) => state.user.user);
const navigate = useNavigate();
const {loading, rows, searchTerm } = useSelector((state: RootState) => state.opportunityTable);
const { columns: rawColumns } = useOpportunityColumns();
const theme=  useTheme();
const toolbarRef = React.useRef<HTMLDivElement>(null);
const [toolbarHeight, setToolbarHeight] = useState(0);
const [columnFiltersHeight, setColumnFiltersHeight] = useState(0);
const columnFiltersRef = React.useRef<HTMLDivElement>(null);
const { filters, handleChangeFilters, clearFilters , activeFilters} = useOpportunityFilters();
const [finalizados, setFinalizados] = useState(false);
const {isMobile } = useIsMobile();
const gridContainerRef = React.useRef<HTMLDivElement>(null);
const changeSearchTerm = (event: React.ChangeEvent<HTMLInputElement>) => {
  dispatch(setSearchTerm(event.target.value)); 
};
  const [columnOrderDialogOpen, setColumnOrderDialogOpen] = useState(false)

  const { orderedColumns: columns, columnVisibilityModel, saveColumnOrder, removeColumnOrder } = usePersistedColumnOrder(
      OPPORTUNITY_TABLE_KEY,
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

const handleChangeSearchTerm = debounce(changeSearchTerm, 500);

const openFormModal = () => {
  dispatch(setCreating(true));
}

const navigateToOppDetails = (id : number ) => { 
  navigate(`/oportunidades/${id}`);
};

const handleCleanFilters = ( ) => { 
    clearFilters();
}

const fetchData = useCallback(async () => {
  if (user) {
    dispatch(setLoading(true));
    try {
      const { opps, total, totalFatDolphin, totalFatDireto } =
        await OpportunityService.getMany({
          user: user,
          searchTerm,
          filters,
          finalizados,
        });
      dispatch(setRows(opps));
      dispatch(
          setTotals({
            total,
            totalFatDolphin,
            totalFatDireto,
          })
        );
      dispatch(setLoading(false));
    } catch (e: any) {
      dispatch(setLoading(false));
      setFeedback({
        message: `Erro ao buscar oportunidades: ${e.message}`,
        type: "error",
      });
    }
  }
}, [dispatch, searchTerm, filters, finalizados]);

useEffect(() => {
  fetchData();
}, [fetchData]);

useEffect(()=> {
  if (toolbarRef.current) {
    setToolbarHeight(toolbarRef.current.clientHeight);
  }
  if (columnFiltersRef.current) {
    setColumnFiltersHeight(columnFiltersRef.current.clientHeight);
  }
   //log heihgts
}, [toolbarRef.current, columnFiltersRef.current]);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
      }}
    >
      <Box
        sx={{
          height: "calc(100% - 50px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BaseTableToolBar handleChangeSearchTerm={handleChangeSearchTerm}>
          {!isMobile && (
            <Button
              variant="contained"
              onClick={handleCleanFilters}
              color="primary"
              sx={{ borderRadius: 0, height: 30, fontSize: "12px" }}
            >
              Limpar filtros
            </Button>
            
          )}
          
          <Tooltip title="Ordenar colunas">
            <IconButton
              onClick={() => setColumnOrderDialogOpen(true)}
              sx={{ color: "primary.main", height: 26, width: 26, borderRadius: 0 }}
            >
              <OpenWithIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <BaseAddButton 
          onClick={openFormModal}
          />
          <OpportunityFormModal />
          <Stack
            direction={"row"}
            alignItems={"center"}
            sx={{ padding: 0, gap: 1 }}
          >
            <Checkbox
              sx={{ padding: 0 }}
              checkedIcon={<CheckCircleIcon />}
              icon={<RadioButtonUncheckedIcon />}
              checked={finalizados}
              onChange={(e) => setFinalizados(e.target.checked)}
            />
            <Typography fontSize={"12px"} variant="body2" sx={{ padding: 0 }}>
              Finalizados
            </Typography>
          </Stack>
        </BaseTableToolBar>
        {isMobile ? (
          <Box
            ref={gridContainerRef}
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", mt: 2 }}
          >
            <FixedSizeGrid
              style={{ margin: "auto" }}
              columnWidth={gridContainerRef.current?.offsetWidth || 300}
              rowHeight={310}
              columnCount={1}
              rowCount={rows.length}
              width={gridContainerRef.current?.offsetWidth || 300}
              height={gridContainerRef.current?.offsetHeight || 400}
            >
              {({ columnIndex, rowIndex, style }) => {
                return (
                  <OpportunityCard
                    onClick={() =>
                      navigateToOppDetails(Number(rows[rowIndex].CODOS))
                    }
                    styles={style}
                    row={rows[rowIndex]}
                  />
                );
              }}
            </FixedSizeGrid>
          </Box>
        ) : (
          <BaseDataTable
            rows={rows}
            columns={columns}
            columnVisibilityModel={columnVisibilityModel}
            loading={loading}
            disableColumnMenu
            disableColumnFilter
            rowHeight={36}
            onRowClick={(params) => navigateToOppDetails(Number(params.id))}
            getRowId={(row: any) => row.CODOS}
            theme={theme}
            initialState={{
              sorting: {
                sortModel: [{ field: 'idProjeto', sort: 'desc' }]
              }
            }}
            slots={{
              footer: () => <OpportunityTableFooter />,
            }}
          />
        )}
      </Box>
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
    </Box>
    
  );
};

export default OpportunityTableComponent;

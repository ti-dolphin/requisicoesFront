import React, {  useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../redux/store";
import { Checklist } from "../../models/patrimonios/Checklist";
import { CheckListService } from "../../services/patrimonios/ChecklistService";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import BaseDataTable from "../../components/shared/BaseDataTable";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography, useTheme } from "@mui/material";
import {
  formatDateToISOstring,
  getDateFromDateString,
  getDateFromISOstring,
} from "../../utils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BaseTableColumnFilters from "../../components/shared/BaseTableColumnFilters";
import BaseTableToolBar from "../../components/shared/BaseTableToolBar";
import { debounce } from "lodash";
import CloseIcon from "@mui/icons-material/Close";
import ChecklistView from "./ChecklistView";
import { ChecklistFilters, setFilters, setRefresh, setRows, setSearchTerm } from "../../redux/slices/patrimonios/ChecklistTableSlice";
import { useIsMobile } from "../../hooks/useIsMobile";
import { FixedSizeGrid } from "react-window";
import ChecklistCard from "../../components/checklists/ChecklistCard";



const situations = [
  { value: "pendente", label: "Pendente" },
  { value: "cobrar", label: "Cobrar" },
  { value: "aprovar", label: "Aprovar" },
]

const ChecklistTable = () => {
  const theme = useTheme();
  const { id_patrimonio } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const {rows, filters, searchTerm, refresh} = useSelector((state: RootState) => state.checklistTable);
  const [from, setFrom] = useState<"patrimonio" | "checklists">("patrimonio");
  const [situation, setSituation] = React.useState<string | "cobrar" | "aprovar" | 'pendente'>("pendente");
  const [loading, setLoading] = React.useState(false);
  const  [checklistSelected, setChecklistSelected] = React.useState<Partial<Checklist> | null>(null);
  const {isMobile } = useIsMobile();
  const columns: GridColDef[] = [
    {
      field: "id_checklist_movimentacao",
      headerName: "ID",
      type: "number",
      minWidth: 100,
      flex: 0.2,
    },
    {
      field: "patrimonio_nome",
      headerName: "Patrimônio",
      type: "string",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "responsavel_nome",
      headerName: "Responsável",
      type: "string",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "realizado",
      headerName: "Realizado",
      flex: 0.3,
      type: "boolean",

      renderCell: (params) => (
        <Box sx={{ color: params.value ? "green" : "red" }}>
          {params.value ? <CheckCircleIcon /> : <CancelIcon />}
        </Box>
      ),
    },
    {
      field: "aprovado",
      headerName: "Aprovado",
      flex: 0.3,
      type: "boolean",
      renderCell: (params) => (
        <Box sx={{ color: params.value ? "green" : "red" }}>
          {params.value ? <CheckCircleIcon /> : <CancelIcon />}
        </Box>
      ),
    },
    {
      field: "data_realizado",
      headerName: "Data da realização",
      flex: 0.4,
      type: "date",
      // Quando o checklist foi aprovado sem ter data de realização registrada,
      // usamos a data de aprovação para que a coluna nunca fique vazia.
      valueGetter: (date: string, row: any) => {
        const value = date || row?.data_aprovado;
        return value ? getDateFromISOstring(value) : "";
      },
      minWidth: 150
    },
    {
      field: "data_aprovado",
      headerName: "Data da aprovação",
      flex: 0.4,
      type: "date",
      valueGetter: (date: string) => (date ? getDateFromISOstring(date) : ""),
      minWidth: 150
    },
  ];

  const handleChangeFilters = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = e.target.value;
    dispatch(setFilters({ ...filters, [field]: value }));
  };

  const openChecklistView  = (checklist: Partial<Checklist> ) => { 
    setChecklistSelected(checklist);
  }

  const handleRowClick = (checklist : Partial<Checklist> ) =>  {
    setChecklistSelected(checklist);
  } 

  const formatFilters = (filters: ChecklistFilters) => {
    const dateFilters = ["data_realizado", "data_aprovado"];
    const formattedFilters: any = { ...filters };
    dateFilters.forEach((field: string) => {
      const dateValue = getDateFromDateString(
        String(filters[field as keyof ChecklistFilters])
      );
      formattedFilters[field as keyof ChecklistFilters] = dateValue
        ? formatDateToISOstring(dateValue)
        : null;
    });

    const numericFields = ["id_checklist_movimentacao"];
    numericFields.forEach((field: string) => {
      formattedFilters[field as keyof ChecklistFilters] = filters[
        field as keyof ChecklistFilters
      ]
        ? Number(filters[field as keyof ChecklistFilters])
        : null;
    });

    return formattedFilters;
  };

  const handleChangeSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(setSearchTerm(value))
  };

  const debouncedHanleChangeSearchTerm = debounce(handleChangeSearchTerm, 500);

  const fetchChecklistsByPatrimony = React.useCallback(async () => {
    try {
      if (!id_patrimonio) return;
      setLoading(true);
      const params = {
        filters: formatFilters(filters),
        searchTerm,
        id_patrimonio: Number(id_patrimonio),
      };
      const data = await CheckListService.getMany(params);

      dispatch(setRows(data));
      setLoading(false);
    } catch (e) {
      setLoading(false);
      dispatch(
        setFeedback({
          message: "Houve um erro ao buscar os dados",
          type: "error",
        })
      );
    }
  }, [filters, searchTerm, id_patrimonio, dispatch, refresh]);

  const fetchChecklistsByUser = React.useCallback(async () => {
    try {
      if (!user) return;
      setLoading(true);
      const params = {
        situacao: situation,
        filters: formatFilters(filters),
        searchTerm,
      };
      const data = await CheckListService.getManyByUser(user.CODPESSOA, params);
      dispatch(setRows(data));
      setLoading(false);
    } catch (e) {
      dispatch(
        setFeedback({
          message: "Houve um erro ao buscar os dados",
          type: "error",
        })
      );
    }
  }, [filters, searchTerm, dispatch, situation, refresh]);

  const renderSituation = (checklist : Partial<Checklist> | null) => { 
    if(!checklist) return "";
    const pendente = !(checklist.aprovado || checklist.realizado);
    const aprovado = checklist.realizado && checklist.aprovado;
    const waitingAproval = checklist.realizado && !checklist.aprovado;
    if(pendente) return "Pendente";
    if(aprovado) return "Aprovado";
    if(waitingAproval) return "Aprovação pendente";
  }

  //useEffect
  React.useEffect(() => {
    if (id_patrimonio) {
      setFrom("patrimonio");
      fetchChecklistsByPatrimony();
      return;
    }
    setFrom('checklists')
    fetchChecklistsByUser();
  }, [fetchChecklistsByPatrimony, fetchChecklistsByUser]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: '100%',
        height: "100%",
      }}
    >
      <BaseTableToolBar handleChangeSearchTerm={debouncedHanleChangeSearchTerm}>
        {from === "checklists" && (
          <Stack direction={"row"} spacing={2}>
            {situations.map((st) => (
              <Button
                key={st.value}
                variant="contained"
                onClick={() => setSituation(st.value)}
                sx={{
                  backgroundColor:
                    st.value === situation ? "secondary.main" : "primary.main",
                  color: "white",
                  textTransform: "capitalize",
                  borderRadius: 0,
                }}
              >
                {st.label}
              </Button>
            ))}
          </Stack>
        )}
      </BaseTableToolBar>
      <BaseDataTable
        rows={rows}
        getRowId={(row) => row.id_checklist_movimentacao}
        columns={columns}
        loading={loading}
        onRowClick={(params: GridRowParams) => openChecklistView(params.row)} theme={theme}      />
      {isMobile && (
        <FixedSizeGrid
          columnCount={1}
          columnWidth={280}
          rowCount={rows.length}
          rowHeight={310}
          height={600}
          width={300}
        >
          {({ columnIndex, rowIndex, style }) => {
            const row = rows[rowIndex];
            return (
              <ChecklistCard
                styles={style}
                key={row.id_checklist_movimentacao}
                openChecklistView={openChecklistView}
                checklist={row}
              />
            );
          }}
        </FixedSizeGrid>
      )}

      <Dialog
        fullScreen
        open={Boolean(checklistSelected)}
        onClose={() => {
          setChecklistSelected(null);

          dispatch(setRefresh(!refresh));
        }}
      >
        <DialogTitle>
          <Typography
            component="a"
            variant="h6"
            color="primary.main"
            href={`/patrimonios/${checklistSelected?.patrimonio?.id_patrimonio}`}
          >
            {checklistSelected?.id_checklist_movimentacao} -{" "}
            {checklistSelected?.patrimonio_nome}
          </Typography>
          <Typography>
            Situação: {renderSituation(checklistSelected)}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <IconButton
            sx={{ position: "absolute", top: 0, right: 0 }}
            color="error"
            onClick={() => {
              setChecklistSelected(null);

              dispatch(setRefresh(!refresh));
            }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          {checklistSelected && (
            <ChecklistView
              id_checklist={checklistSelected?.id_checklist_movimentacao || 0}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ChecklistTable;

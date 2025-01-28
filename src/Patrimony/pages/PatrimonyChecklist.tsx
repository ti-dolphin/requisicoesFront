import {  useCallback, useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  AppBar,
  Paper,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridFooterContainer,
  GridPagination,
} from "@mui/x-data-grid";
import { MovementationChecklist } from "../types";
import { checklistContext } from "../context/checklistContext";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import { useNavigate, useParams } from "react-router-dom";
import ChecklistItemsModal from "../modals/ChecklistItemsModal";
import { dateTimeRenderer, getChecklistDataByPatrimonyId, renderValue } from "../utils";
import { ptBR } from "@mui/x-data-grid/locales";
import { ptBR as pickersPtBr } from "@mui/x-date-pickers/locales";
import { ptBR as corePtBr } from "@mui/material/locale";
import { FixedSizeList } from "react-window";
import ChecklistCard from "../components/ChecklistCard";
import { ChecklistColumnData } from "../../crm/types";
import { basicAppbarStyles } from "../../utilStyles";
import TableViewToggleButton from "../../components/TableViewToggleButton";

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  ptBR,
  pickersPtBr,
  corePtBr
);
const PatrimonyChecklist = () => {
  const navigate = useNavigate();
  const { id_patrimonio } = useParams();
  const { toggleChecklistOpen, refreshChecklist } =useContext(checklistContext);
  const [checklistData, setChecklistData] = useState<MovementationChecklist[]>(
    []
  );
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isCardViewActive, setIsCardViewActive] = useState<boolean>(false);
  const handleOpenChecklist = (row: MovementationChecklist) => {
    toggleChecklistOpen(row);
  };

  const handleBack = () => {
    navigate(`/patrimony`);
  };

  const getChecklistData = useCallback(async () => {
    const checkListData = await getChecklistDataByPatrimonyId(
      Number(id_patrimonio)
    );
    if (checkListData) {
      setChecklistData(checkListData);
    }
  }, [id_patrimonio]);

  useEffect(() => {
    getChecklistData();
    setIsCardViewActive(window.innerWidth < 768);
    setIsMobile(window.innerWidth < 768);
  }, [getChecklistData, refreshChecklist]);

  const columns: GridColDef[] = [
    {
      field: "nome_patrimonio",
      headerName: "Patrimônio",
      width: 300,
    },
    {
      field: "id_checklist_movimentacao",
      headerName: "Checklist",
      width: 100,
    },
    {
      field: "id_movimentacao",
      headerName: "Movimentação",
      width: 120,
    },
    {
      field: "data_criacao",
      headerName: "Data de Criação",
      width: 200,
      valueFormatter: (value) => (value ? dateTimeRenderer(value) : ""),
    },
    {
      field: "realizado",
      headerName: "Realizado",
      width: 100,
      valueFormatter: (value) => (value === 1 ? "Sim" : "Não"),
    },
    {
      field: "data_realizado",
      headerName: "Data de Realização",
      width: 150,
      valueFormatter: (value) => (value ? dateTimeRenderer(value) : ""),
    },
    {
      field: "aprovado",
      headerName: "Aprovado",
      width: 100,
      valueFormatter: (value) => (value === 1 ? "Sim" : "Não"),
    },
    {
      field: "data_aprovado",
      headerName: "Data de Aprovação",
      width: 150,
      valueFormatter: (value) => (value ? dateTimeRenderer(value) : ""),
    },
    {
      field: "descricao_projeto",
      headerName: "Projeto",
      width: 400,
    },
    {
      field: "nome_responsavel",
      headerName: "Responsável",
      width: 200,
    },
  ];
  const GridFooter = () => {
    return (
      <GridFooterContainer sx={{ paddingX: 6 }}>
        <Typography fontSize="small" color="blue">
          Total de checklists: {checklistData.length}
        </Typography>
        <GridPagination />
      </GridFooterContainer>
    );
  };
  

  return (
    <Box
      height="100vh"
      display="flex"
      width="100%"
      flexDirection="column"
      padding={0.5}
    >
      <AppBar position="static" sx={{ ...basicAppbarStyles }}>
        <Box display="flex" alignItems="center" flexGrow={1}>
          <IconButton
            sx={{
              color: "#F7941E",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.05)",
              },
            }}
            onClick={handleBack}
          >
            <ArrowLeftIcon />
          </IconButton>
          <Typography
            textAlign="left"
            fontSize="medium"
            fontFamily="Roboto"
            padding={2}
          >
            {checklistData?.length
              ? `Histórico de Checklists do Patrimônio | ${checklistData[0].nome_patrimonio} | 000${checklistData[0].id_patrimonio}`
              : "Não há checklists para este patrimônio"}
          </Typography>
          {isMobile && (
            <TableViewToggleButton
              isCardViewActive={isCardViewActive}
              setIsCardViewActive={setIsCardViewActive}
            />
          )}
        </Box>
      </AppBar>
      <Paper
        sx={{
          height: "calc(100% - 64px)", // Ajusta para ocupar a tela abaixo do AppBar
          marginTop: 2,
        }}
      >
        {!isCardViewActive && (
          <ThemeProvider theme={theme}>
            <DataGrid
              rows={checklistData}
              columns={columns}
              getRowId={(row) => row.id_checklist_movimentacao}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 30,
                  },
                },
              }}
              columnHeaderHeight={30}
              pageSizeOptions={[10, 20, 30]}
              rowHeight={30}
              onRowClick={({ row }) => handleOpenChecklist(row)}
              slots={{
                footer: GridFooter,
              }}
              sx={{
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#e7eaf6",
                },
                padding: 0.5,
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "Arial, sans-serif",
                fontSize: "12.5px",
                "& .MuiDataGrid-columnHeaders": {
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                  fontSize: 12,
                },

                "& .MuiDataGrid-row": {
                  ":nth-child(even)": {
                    backgroundColor: "#e7eaf6",
                  },
                },
                "& .MuiDataGrid-cell": {
                  paddingLeft: 1.2,
                },
              }}
            />
          </ThemeProvider>
        )}
        {isCardViewActive && (
          <FixedSizeList
            height={600}
            width="100%"
            itemSize={320}
            itemCount={checklistData.length}
            overscanCount={1}
          >
            {({ index, style, data }) => {
              const cardStyle = { ...style };
              const columns: ChecklistColumnData[] = [
                { label: "Patrimônio", dataKey: "nome_patrimonio" },
                { label: "Data de Criação", dataKey: "data_criacao" },
                { label: "Projeto", dataKey: "descricao_projeto" },
                { label: "Responsável", dataKey: "nome_responsavel" },
                { label: "Realizado", dataKey: "realizado" },
                { label: "Aprovado", dataKey: "aprovado" },
              ];
              return (
                <ChecklistCard
                  props={{ index, style: cardStyle, data }}
                  cardData={checklistData[index]}
                  key={0}
                  renderValue={renderValue}
                  handleOpenChecklist={handleOpenChecklist}
                  columns={columns}
                />
              );
            }}
          </FixedSizeList>
        )}
      </Paper>
      <ChecklistItemsModal />
    </Box>
  );
};

export default PatrimonyChecklist;

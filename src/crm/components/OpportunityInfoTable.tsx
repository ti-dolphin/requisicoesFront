import { useCallback, useContext, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import OpportunityTableSearchBar from "./OpportunityTableSearchBar";
import { OpportunityInfo } from "../types";
import { OpportunityInfoContext } from "../context/OpportunityInfoContext";
import { getOpportunities } from "../utils";
import { ptBR } from "@mui/x-data-grid/locales";
import { ptBR as pickersPtBr } from "@mui/x-date-pickers/locales";
import { ptBR as corePtBr } from "@mui/material/locale";
import { createTheme, ThemeProvider } from "@mui/material";

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

const columns: GridColDef<OpportunityInfo>[] = [
  { field: "numero_projeto", headerName: "Nº Projeto", width: 130 },
  { field: "numero_adicional", headerName: "Nº Adicional", width: 130 },
  { field: "status", headerName: "Status", width: 120 },
  {
    field: "descricao_projeto",
    headerName: "Descrição",
    width: 200,
    editable: false,
  },
  { field: "cliente", headerName: "Cliente", width: 150 },
  { field: "data_cadastro", headerName: "Cadastro", width: 120 },
  { field: "data_solicitacao", headerName: "Solicitação", width: 120 },
  { field: "data_envio_proposta", headerName: "Envio Proposta", width: 140 },
  {
    field: "data_fechamento",
    headerName: "Fechamento",
    width: 120,
    valueGetter: (_value, row) =>
      row.data_fechamento ? row.data_fechamento : "—", // Exibe um traço para valores nulos
  },
  { field: "vendedor", headerName: "Vendedor", width: 150 },
  { field: "gerente", headerName: "Gerente", width: 150 },
  { field: "valor_faturamento_dolphin", headerName: "Faturamento Dolphin" },
  { field: "valor_total", headerName: 'Valor Total' },
];

export default function OpportunityInfoTable() {


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rows, setRows ] = useState<OpportunityInfo[]>([]);
  const {refreshOpportunityInfo } = useContext(OpportunityInfoContext)
  const fetchOpportunities = useCallback(async () => {
    const opps = await getOpportunities();
    if(opps){ 
      setRows(opps);
    }
  }, []); 

  useEffect(() => {
    fetchOpportunities();
  }, [getOpportunities, refreshOpportunityInfo]);
  return (
    <Box
      sx={{
        width: "100%",
        paddingX: 2,
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        height: "800px",
        gap: 2,
      }}
    >
      <OpportunityTableSearchBar />
      <ThemeProvider theme={theme}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.numero_os} // Define `numero_projeto` como ID da linha
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 30,
              },
            },
          }}
          pageSizeOptions={[10, 20, 30]}
          disableRowSelectionOnClick
          sx={{
            minHeight: "300px",
          }}
        />
      </ThemeProvider>
    </Box>
  );
}

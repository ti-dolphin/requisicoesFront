import { useCallback, useContext, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import OpportunityTableSearchBar from "./OpportunityTableSearchBar";
import { dummyOpportunities } from "../dummy";
import { OpportunityInfo } from "../types";
import { OpportunityInfoContext } from "../context/OpportunityInfoContext";
import { getOpportunities } from "../utils";


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
  { field: "coordenador", headerName: "Coordenador", width: 150 },
];

export default function OpportunityInfoTable() {


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rows, setRows ] = useState(dummyOpportunities || []);
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
        gap: 2,
      }}
    >
      <OpportunityTableSearchBar />
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.numero_projeto} // Define `numero_projeto` como ID da linha
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10, 20]}
        disableRowSelectionOnClick
        sx={{
          minHeight: "300px",
        }}
      />
    </Box>
  );
}

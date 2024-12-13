import { useCallback, useContext, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  GridFooterContainer,
  GridPagination,
} from "@mui/x-data-grid";
import OpportunityTableSearchBar from "./OpportunityTableSearchBar";
import { OpportunityInfo } from "../types";
import { OpportunityInfoContext } from "../context/OpportunityInfoContext";
import { getOpportunities } from "../utils";
import { ptBR } from "@mui/x-data-grid/locales";
import { ptBR as pickersPtBr } from "@mui/x-date-pickers/locales";
import { ptBR as corePtBr } from "@mui/material/locale";
import { createTheme, ThemeProvider, Typography } from "@mui/material";

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
  { field: "numeroProjeto", headerName: "Nº Projeto", width: 130 }, // os.ID_PROJETO
  { field: "numeroAdicional", headerName: "Nº Adicional", width: 130 }, // os.ID_ADICIONAL
  { field: "nomeStatus", headerName: "Status", width: 120 }, // s.NOME
  {
    field: "nomeDescricaoProposta",
    headerName: "Descrição",
    width: 200,
    editable: false,
  }, // os.NOME
  { field: "nomeCliente", headerName: "Cliente", width: 150 }, // c.NOME
  { field: "nomeVendedor", headerName: "Vendedor", width: 150 }, // vendedor.NOME
  { field: "nomeGerente", headerName: "Gerente", width: 150 }, // gerente.NOME
  {
    field: "valorFaturamentoDolphin",
    headerName: "Faturamento Dolphin",
  }, // CONCAT('R$ ', FORMAT(os.VALORFATDOLPHIN, 2, 'de_DE'))
  {
    field: "valorFaturamentoDireto",
    headerName: "Faturamento Direto",
  }, // CONCAT('R$ ', FORMAT(os.VALORFATDIRETO, 2, 'de_DE'))
  {
    field: "valorTotal",
    headerName: "Valor Total",
  }, // CONCAT('R$ ', FORMAT(os.VALORTOTAL, 2, 'de_DE'))
  {
    field: "dataSolicitacao",
    headerName: "Solicitação",
    width: 120,
    valueFormatter: (value: Date) => {
      if (value) return new Date(value).toLocaleDateString("pt-BR");
      return "-";
    },
  }, // os.DATASOLICITACAO
  {
    field: "dataFechamento",
    headerName: "Fechamento",
    width: 120,
    valueFormatter: (value: Date) => {
      if (value) return new Date(value).toLocaleDateString("pt-BR");
      return "-";
    },
  }, // os.DATAENTREGA
  {
    field: "dataInteracao",
    headerName: "Data de Interação",
    valueFormatter: (value: Date) => {
      if (value) return new Date(value).toLocaleDateString("pt-BR");
      return "-";
    },
  }, // os.DATAINTERACAO
  {
    field: "dataInicio",
    headerName: "Data de Início",
    valueFormatter: (value: Date) => {
      if (value) return new Date(value).toLocaleDateString("pt-BR");
      return "-";
    },
  }, // os.DATAINICIO
  {
    field: "numeroOs",
    headerName: "Nº OS",
    width: 130,
  }, // os.CODOS
];


export default function OpportunityInfoTable() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rows, setRows] = useState<OpportunityInfo[]>([]);

  const { finishedOppsEnabled, refreshOpportunityInfo, dateFilters } =
    useContext(OpportunityInfoContext);

  const fetchOpportunities = useCallback(async () => {
    const opps = await getOpportunities(finishedOppsEnabled, dateFilters);
    if (opps) {
      setRows(opps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshOpportunityInfo, finishedOppsEnabled]);

  const GridFooter = () => {
    return (
      <GridFooterContainer
        sx={{
          color: "black",
          paddingX: 4,
          display: "flex",
          flexGrow: 1,
          flexWrap: "wrap",
          overFlowY: "scroll",
          zIndex: 20,
          backgroundColor: "white",
          borderRadius: 2,
          height: "5%",
        }}
        className="shadow-2xl"
      >
        <GridPagination
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            overflowY: "hidden",
            overflowX: "hidden",
            height: '30px'
          }}
        />
      </GridFooterContainer>
    );
  };

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities, refreshOpportunityInfo]);
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        paddingX: 0,
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        flex: 1,
      }}
    >
      <OpportunityTableSearchBar />
      <ThemeProvider theme={theme}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.numeroOs}
          rowHeight={30} // Define `numero_projeto` como ID da linha
          columnHeaderHeight={30}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 30,
              },
            },
          }}
          sx={{
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
          pageSizeOptions={[10, 20, 30]}
          disableRowSelectionOnClick
          slots={{
            footer: GridFooter,
          }}
        />
      </ThemeProvider>
      <Box
        sx={{
          padding: 1,
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        <Typography fontSize="small" color="blue">
          <span className="font-semibold tracking-wide"> Nº de Registros</span>{" "}
          {rows.length}
        </Typography>
        <Typography fontSize="small" color="blue">
          <span className="font-semibold tracking-wide">
            Faturamneto Dolphin:
          </span>{" "}
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(
            rows.reduce((acumulador, opp) => {
              const valorLimpo = String(opp.valorFaturamentoDireto)
                .replace("R$", "")
                .replace(/\./g, "")
                .replace(",", ".");
              return acumulador + Number(valorLimpo);
            }, 0)
          )}
        </Typography>
        <Typography fontSize="small" color="blue">
          <span className="font-semibold tracking-wide">Valor Total:</span>{" "}
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(
            rows.reduce((acumulador, opp) => {
              const valorLimpo = String(opp.valorTotal ? opp.valorTotal : 0)
                .replace("R$", "")
                .replace(/\./g, "")
                .replace(",", ".");
              return acumulador + Number(valorLimpo);
            }, 0)
          )}
        </Typography>
      </Box>
    </Box>
  );
}

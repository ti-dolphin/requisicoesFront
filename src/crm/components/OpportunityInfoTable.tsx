/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  GridFooterContainer,
  GridPagination,
  GridRowParams,
} from "@mui/x-data-grid";
import OpportunityTableSearchBar from "./OpportunityTableSearchBar";
import { OpportunityInfo } from "../types";
import { OpportunityInfoContext } from "../context/OpportunityInfoContext";
import { getOpportunities } from "../utils";
import { ptBR } from "@mui/x-data-grid/locales";
import { ptBR as pickersPtBr } from "@mui/x-date-pickers/locales";
import { ptBR as corePtBr } from "@mui/material/locale";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import { formatDate } from "../../generalUtilities";
import { userContext } from "../../Requisitions/context/userContext";

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
  { field: "numeroProjeto", headerName: "Nº Projeto" }, // os.ID_PROJETO
  { field: "numeroAdicional", headerName: "Nº Adicional" }, // os.ID_ADICIONAL
  { field: "nomeStatus", headerName: "Status" }, // s.NOME
  {
    field: "nomeDescricaoProposta",
    headerName: "Descrição",
    editable: false,
  }, // os.NOME
  { field: "nomeCliente", headerName: "Cliente" }, // c.NOME
  { field: "nomeVendedor", headerName: "Vendedor" }, // vendedor.NOME
  { field: "nomeGerente", headerName: "Gerente" }, // gerente.NOME
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
    valueFormatter: (value: Date) => {
      if (value) return formatDate(value);
      return "-";
    },
  }, // os.DATASOLICITACAO
  {
    field: "dataFechamento",
    headerName: "Fechamento",
    valueFormatter: (value: Date) => {
      if (value) return formatDate(value);
      return "-";
    },
  }, // os.DATAENTREGA
  {
    field: "dataInteracao",
    headerName: "Data de Interação", 
    valueFormatter: (value: Date) => {
      if (value) return formatDate(value);
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
  }, // os.CODOS
];


export default function OpportunityInfoTable() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user} = useContext(userContext);
  const [rows, setRows] = useState<OpportunityInfo[]>([]);
  const [allRows, setAllRows] = useState<OpportunityInfo[]>([]);
   const [isMobile, setIsMobile] = useState<boolean>(false);
  const [ isCardViewActive, setIsCardViewActive] = useState<boolean>(false);
  const {
    finishedOppsEnabled,
    refreshOpportunityInfo,
    dateFilters,
    setCurrentOppIdSelected,
  } = useContext(OpportunityInfoContext);

  const fetchOpportunities = useCallback(async () => {
    if(user){ 
      const opps = await getOpportunities(
        finishedOppsEnabled,
        dateFilters,
        user.CODPESSOA
      );
      if (opps) {
        setAllRows(opps);
        setRows(opps);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshOpportunityInfo, finishedOppsEnabled]);
  const selectOpportunity = (row: GridRowParams<OpportunityInfo>) => {
    console.log("row: ", row.row);
    setCurrentOppIdSelected(row.row.numeroOs);
  };
  const GridFooter = () => {
    return (
      <GridFooterContainer
        sx={{
          color: "black",
          paddingX: 4,
          paddingY: 0,
          display: "flex",
          justifyContent: "end",
          flexGrow: 1,
          flexWrap: "wrap",
          overFlowY: "scroll",
          zIndex: 20,
          backgroundColor: "#2B3990",
          borderRadius: 2,
          height: "30px",
        }}
        className="shadow-2xl"
      >
        <Box
          sx={{
            padding: 2,
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          <Typography fontSize="small" color="white">
            <span className="font-semibold tracking-wide">
              {" "}
              Nº de Registros
            </span>{" "}
            {rows.length}
          </Typography>
          <Typography fontSize="small" color="white">
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
          <Typography fontSize="small" color="white">
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
        <GridPagination
          sx={{
            padding: 0,
            display: "flex",
            maxWidth: "200px",
            alignItems: "center",
            justifyContent: "end",
            overflowY: "hidden",
            overflowX: "hidden",
            height: "30px",
            color: 'white'
          }}
        />
      </GridFooterContainer>
    );
  };

  useEffect(() => {
    fetchOpportunities();
    setIsMobile(window.innerWidth > 768);
    setIsCardViewActive(window.innerWidth > 768);
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
      <OpportunityTableSearchBar
        columns={columns}
        allRows={allRows}
        setRows={setRows}
      />
      {!isCardViewActive && (
        <ThemeProvider theme={theme}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.numeroOs}
            rowHeight={40} // Define `numero_projeto` como ID da linha
            columnHeaderHeight={40}
            autosizeOnMount
            autosizeOptions={{
              expand: true,
            }}
            onRowClick={(e) => selectOpportunity(e)}
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              fontWeight: "600",
              color: "#233142",
              "& .MuiDataGrid-columnHeaders": {
                fontWeight: "bold",
                color: "black",
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#ececec",
                },
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
                fontSize: 12,
              },

              "& .MuiDataGrid-row": {
                cursor: "pointer",
                ":nth-child(even)": {
                  backgroundColor: "#ececec",
                },
              },
              "& .MuiDataGrid-cell": {
                paddingLeft: 1.2,
              },
            }}
            autoPageSize
            // pageSizeOptions={[10, 20, 30]}
            disableRowSelectionOnClick
            slots={{
              footer: GridFooter,
            }}
          />
        </ThemeProvider>
      )}
      {/* {isCardViewActive &&

      } */}
    </Box>
  );
}

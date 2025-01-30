/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
import { Card, createTheme, Typography } from "@mui/material";
import { formatDate } from "../../generalUtilities";
import { userContext } from "../../Requisitions/context/userContext";
import { FixedSizeGrid } from "react-window";
import OpportunityCard from "./OpportunityCard";
import {OpportunityModal} from "../modals/OpportunityModal";

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

const gridCardColumns: { headerName: string; field: keyof OpportunityInfo }[] = [
  {
    field: "numeroOs",
    headerName: "Nº OS",
  },
  { field: "numeroProjeto", headerName: "Nº Projeto" },
  { field: "nomeDescricaoProposta", headerName: "Descrição" },
  { field: "nomeCliente", headerName: "Cliente" },
  {
    field: "valorTotal",
    headerName: "Valor Total",
  },
];



 const OpportunityInfoTable: React.FC = () => {
   // console.log("OpportunityInfoTable()");
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const windowWith = window.innerWidth;
   const { user } = useContext(userContext);
   const [rows, setRows] = useState<OpportunityInfo[]>([]);
   const [allRows, setAllRows] = useState<OpportunityInfo[]>([]);
   const [isMobile, setIsMobile] = useState<boolean>(false);
   const [gridRowCount, setGridRowCount] = useState<number>(0);
   const [cardWidth, setCardWidth] = useState<number>(0);
   const [isCardViewActive, setIsCardViewActive] = useState<boolean>(true);
   const [gridOuterContainerHeight, setgridOuterContainerHeight] = useState(0);
   const GridOuterContainerRef = useRef<HTMLDivElement>(null);
   const [gridColumnsCount, setGridColumnsCount] = useState<number>(0);
   const {
     finishedOppsEnabled,
     refreshOpportunityInfo,
     dateFilters,
     setCurrentOppIdSelected,
   } = useContext(OpportunityInfoContext);
   const columns: GridColDef<OpportunityInfo>[] = useMemo(
     () => [
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
     ],
     []
   );

   const calculateIsMobile = () => {
     setIsMobile(windowWith <= 768);
   };
   const calculateInitialCardViewActive = () => {
     setIsCardViewActive(windowWith <= 768);
   };

   const fetchOpportunities = useCallback(async () => {
     if (user) {
       const opps = await getOpportunities(
         finishedOppsEnabled,
         dateFilters,
         user.CODPESSOA
       );
       if (opps) {
         setAllRows(opps);
         setRows(opps);
         calculateGridLayoutProps(opps.length);
       }
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [refreshOpportunityInfo, finishedOppsEnabled]);

   const calculateGridHeight = () => {
     if (GridOuterContainerRef.current) {
       const height = GridOuterContainerRef.current.clientHeight;
       setgridOuterContainerHeight(height);
       return height;
     }
   };

   const calculateCardWidth = useCallback(() => {
     // Largura mínima e máxima do card
     const minCardWidth = 300;
     const maxCardWidth = 600;

     // Largura mínima e máxima da janela para cálculo proporcional
     const minWindowWidth = 320; // Largura mínima da tela (ex.: smartphones pequenos)
     const maxWindowWidth = 1200; // Largura máxima da tela (ex.: desktops)

     // Garantir que a largura da janela esteja dentro dos limites
     const clampedWindowWidth = Math.min(
       Math.max(windowWith, minWindowWidth),
       maxWindowWidth
     );

     // Calcular a largura do card proporcionalmente
     const cardWidth =
       minCardWidth +
       ((clampedWindowWidth - minWindowWidth) /
         (maxWindowWidth - minWindowWidth)) *
         (maxCardWidth - minCardWidth);

     // Arredondar o valor para evitar decimais desnecessários
     const roundedCardWidth = Math.round(cardWidth);

     // Atualizar o estado com a nova largura do card
     setCardWidth(roundedCardWidth);

     // Retornar a largura calculada (opcional)
     return roundedCardWidth;
     // const IsMobile = windowWith < 768;
     // console.log({IsMobile: IsMobile});
     // const cardWidth = IsMobile ? 300 : 400;
     // setCardWidth(cardWidth);
     // return cardWidth;
   }, [windowWith]);

   const calculateGridColumnsCount = useCallback(
     (cardWidth: number) => {
       const gridColumnsCount = Math.floor(windowWith / cardWidth);
       setGridColumnsCount(gridColumnsCount);
       return gridColumnsCount;
     },
     [windowWith]
   );

   const calculateGridRowCount = (
     registerCount: number,
     gridColumnsCount: number
   ) => {
     const gridRowCount = registerCount / gridColumnsCount;
     setGridRowCount(gridRowCount);
     return gridRowCount;
   };

   const calculateGridLayoutProps = useCallback(
     (registerCount: number) => {
       const gridHeight = calculateGridHeight();
       const cardWidth = calculateCardWidth();
       const gridColumnsCount = calculateGridColumnsCount(cardWidth);
       const gridRowCount = calculateGridRowCount(
         registerCount,
         gridColumnsCount
       );
       // console.log({
       //   gridHeight,
       //   cardWidth,
       //   gridColumnsCount,
       //   gridRowCount,
       // })
     },
     [calculateCardWidth, calculateGridColumnsCount, rows.length]
   );

   const selectOpportunity = (row: GridRowParams<OpportunityInfo>) => {
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
             color: "white",
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
       <OpportunityTableSearchBar
         columns={columns}
         allRows={allRows}
         setRows={setRows}
       />
       {
         // <ThemeProvider theme={theme}>
         //   <DataGrid
         //     rows={rows}
         //     columns={columns}
         //     getRowId={(row) => row.numeroOs}
         //     rowHeight={40} // Define `numero_projeto` como ID da linha
         //     columnHeaderHeight={40}
         //     autosizeOnMount
         //     autosizeOptions={{
         //       expand: true,
         //     }}
         //     onRowClick={(e) => selectOpportunity(e)}
         //     sx={{
         //       width: "100%",
         //       borderCollapse: "collapse",
         //       fontFamily: "Arial, sans-serif",
         //       fontSize: "12px",
         //       fontWeight: "600",
         //       color: "#233142",
         //       "& .MuiDataGrid-columnHeaders": {
         //         fontWeight: "bold",
         //         color: "black",
         //         "& .MuiDataGrid-columnHeader": {
         //           backgroundColor: "#ececec",
         //         },
         //       },
         //       "& .MuiDataGrid-columnHeaderTitle": {
         //         fontWeight: "bold",
         //         fontSize: 12,
         //       },
         //       "& .MuiDataGrid-row": {
         //         cursor: "pointer",
         //         ":nth-child(even)": {
         //           backgroundColor: "#ececec",
         //         },
         //       },
         //       "& .MuiDataGrid-cell": {
         //         paddingLeft: 1.2,
         //       },
         //     }}
         //     autoPageSize
         //     // pageSizeOptions={[10, 20, 30]}
         //     disableRowSelectionOnClick
         //     slots={{
         //       footer: GridFooter,
         //     }}
         //   />
         // </ThemeProvider>
       }
       {isCardViewActive && (
         <Box
           ref={GridOuterContainerRef}
           sx={{
             display: "flex",
             flexDirection: "column",
             alignItems: "center",
             padding: 1,
             width: "100%",
             flexGrow: 1,
           }}
         >
           {gridOuterContainerHeight &&
             gridRowCount &&
             cardWidth &&
             gridColumnsCount && (
               <FixedSizeGrid
                 columnCount={gridColumnsCount}
                 columnWidth={cardWidth} // Width of each column
                 height={gridOuterContainerHeight} // Height of the grid
                 rowCount={gridRowCount}
                 rowHeight={260} // Height of each row
                 width={gridColumnsCount * cardWidth + 20} // Width of the grid
               >
                 {({ columnIndex, rowIndex, style }) => (
                   <OpportunityCard
                     row={rows[rowIndex]}
                     gridCardColumns={gridCardColumns}
                     style={style}
                   />
                 )}
               </FixedSizeGrid>
             )}
         </Box>
       )}
       <OpportunityModal />
     </Box>
   );
 };

OpportunityInfoTable.displayName = "OpportunityInfoTable";

export default OpportunityInfoTable;

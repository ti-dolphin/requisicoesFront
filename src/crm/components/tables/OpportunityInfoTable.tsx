/* eslint-disable @typescript-eslint/no-unused-vars */
import { ThemeProvider } from "@emotion/react";
import { createTheme, Box, Typography } from "@mui/material";
import { GridColDef, GridRowParams, GridFooterContainer, GridPagination, DataGrid } from "@mui/x-data-grid";
import { useContext, useState, useRef, useMemo, useCallback, useEffect } from "react";
import { FixedSizeGrid } from "react-window";
import { formatDate, Loader } from "../../../generalUtilities";
import { userContext } from "../../../Requisitions/context/userContext";
import { OpportunityGridStyles } from "../../../utilStyles";
import { OpportunityInfoContext } from "../../context/OpportunityInfoContext";
import { OpportunityInfo } from "../../types";
import { getOpportunities } from "../../utils";
import CustomOpportunityRow from "../CustomOpportunityRow/CustomOpportunityRow";
import { OpportunityModal } from "../modals/OpportunityModal/OpportunityModal";
import OpportunityCard from "../OpportunityCard/OpportunityCard";
import OpportunityTableSearchBar from "../OpportunityTableSearchBar/OpportunityTableSearchBar";
import { ptBR } from "@mui/x-data-grid/locales";
import { ptBR as pickersPtBr } from "@mui/x-date-pickers/locales";
import { ptBR as corePtBr } from "@mui/material/locale";
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
  { field: "numeroAdicional", headerName: "Nº Adicional" }, // os.ID_ADICIONAL
  { field: "nomeDescricaoProposta", headerName: "Descrição" },
  { field: "nomeCliente", headerName: "Cliente" },
  {
    field: "valorTotal",
    headerName: "Valor Total",
  },
  { field: "nomeStatus", headerName: "Status" }, // s.NOME

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
  const [isCardViewActive, setIsCardViewActive] = useState<boolean>(false);
  const [gridOuterContainerHeight, setgridOuterContainerHeight] = useState(0);

  const GridOuterContainerRef = useRef<HTMLDivElement>(null);


  const [gridColumnsCount, setGridColumnsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
    console.log({ isMobile: window.innerWidth < 768 })
    setIsMobile(window.innerWidth < 768);
  }

  const calculateInitialCardViewActive = () => {
    setIsCardViewActive(windowWith <= 768);
  };

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true); // Ativa o loading

    if (user) {
      const opps = await getOpportunities(
        finishedOppsEnabled,
        dateFilters,
        user.CODPESSOA
      );
      if (opps) {
        setAllRows(opps);
        setRows(opps);
        calculateLayoutProps(opps.length);
      }
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshOpportunityInfo, finishedOppsEnabled]);

  const shouldShowGrid = () => {
    return (
      gridRowCount > 0 &&
      cardWidth > 0 &&
      gridColumnsCount > 0 &&
      isCardViewActive
    );
  };

  const calculateGridHeight = () => {
    if (GridOuterContainerRef.current) {
      const height = GridOuterContainerRef.current.clientHeight;
      console.log({ calculatedHeight: height })
      setgridOuterContainerHeight(height);
      return height;
    }
  };

  const calculateCardWidth = useCallback(() => {
    const minCardWidth = 300;
    const maxCardWidth = 600;
    const minWindowWidth = 320; // Largura mínima da tela (ex.: smartphones pequenos)
    const maxWindowWidth = 1200; // Largura máxima da tela (ex.: desktops)
    const clampedWindowWidth = Math.min(
      Math.max(windowWith, minWindowWidth),
      maxWindowWidth
    );
    const cardWidth =
      minCardWidth +
      ((clampedWindowWidth - minWindowWidth) /
        (maxWindowWidth - minWindowWidth)) *
      (maxCardWidth - minCardWidth);
    const roundedCardWidth = Math.round(cardWidth);
    setCardWidth(roundedCardWidth);
    return roundedCardWidth;
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

  const calculateLayoutProps = useCallback(
    (registerCount: number) => {
      const cardWidth = calculateCardWidth();
      const gridColumnsCount = calculateGridColumnsCount(cardWidth);
      const gridRowCount = calculateGridRowCount(
        registerCount,
        gridColumnsCount
      );
      const gridHeight = calculateGridHeight();
      console.log({
        cardWidth,
        gridColumnsCount,
        gridRowCount,
        gridHeight,
      })
      calculateInitialCardViewActive();
      //  calculateIsMobile();
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
          paddingX: 1,
          paddingY: 0,
          display: "flex",
          justifyContent: "space-between", // Alinha os itens nas extremidades
          alignItems: "center", // Centraliza verticalmente
          flexWrap: "nowrap", // Permite que o conteúdo quebre em várias linhas
          overflowX: "auto", // Permite rolagem horizontal se necessário
          overflowY: "hidden",
          zIndex: 20,
          backgroundColor: "#2B3990",
          borderRadius: 0,
          height: "auto", // Altura automática para acomodar o conteúdo
          minHeight: "52px", // Altura mínima
          gap: 1, // Espaçamento entre os itens
        }}
        className="shadow-2xl"
      >
        {/* Box com os textos */}
        <Box
          sx={{
            paddingTop: 1,
            display: isMobile ? 'none' : 'flex',
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            flexGrow: 1, // Ocupa o espaço disponível
            overflowX: "auto", // Permite rolagem horizontal se necessário
          }}
        >
          <Typography fontSize="small" color="white" >
            <span className="font-semibold tracking-wide">Nº de Registros</span>{" "}
            {rows.length}
          </Typography>
          <Typography fontSize="small" color="white">
            <span className="font-semibold tracking-wide">Faturamento Dolphin:</span>{" "}
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

        {/* Paginação */}
        <GridPagination
          sx={{
            padding: 0,
            width: "fit-content",
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
            overflowY: "hidden",
            height: "30px",
            color: "white",
            "& .MuiToolbar-gutters": {
              padding: 0,
              "& .MuiTablePagination-selectLabel": {
                display: "none", // Oculta o rótulo "Rows per page"
              },
            },
          }}
        />
      </GridFooterContainer>
    );
  };

  useEffect(() => {
    console.log("OpportunityInfoTable renderizou");
  })

  useEffect(() => {
    calculateIsMobile()
    fetchOpportunities();
  }, [fetchOpportunities, refreshOpportunityInfo]);
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        paddingX: 0,
        paddingY: 0,
        backgroundColor: "#fff",
        display: "flex",
        boxSizing: 'border-box',
        flexDirection: "column",
        gap: 0,
        flex: 1,
      }}
    >
      <OpportunityTableSearchBar
        columns={columns}
        allRows={allRows}
        setRows={setRows}
        isCardViewActive={isCardViewActive}
        setIsCardViewActive={setIsCardViewActive}
      />
      <Box
        ref={GridOuterContainerRef}
        sx={{
          display: 'flex',
          flexDirection: "column",
          alignItems: "center",
          boxSizing: 'border-box',
          width: "100%",
          flexGrow: 1,
        }}
      >
        {!isCardViewActive && !isLoading && gridOuterContainerHeight > 0 && (
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
              sx={{ ...OpportunityGridStyles, maxHeight: gridOuterContainerHeight }}
              onRowClick={selectOpportunity}
              disableRowSelectionOnClick
              slots={{
                footer: GridFooter,
                row: CustomOpportunityRow
              }}
            />
          </ThemeProvider>
        )}


        {!isLoading && shouldShowGrid() && (
          <FixedSizeGrid
            columnCount={gridColumnsCount}
            columnWidth={cardWidth} // Width of each column
            height={gridOuterContainerHeight} // Height of the grid
            rowCount={gridRowCount}
            rowHeight={320} // Height of each row
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

        {isLoading && (
          <Loader />
        )}


      </Box>

      <OpportunityModal />
    </Box>
  );
};

OpportunityInfoTable.displayName = "OpportunityInfoTable";

export default OpportunityInfoTable;

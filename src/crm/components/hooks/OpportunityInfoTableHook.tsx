import { Box, Typography } from "@mui/material";
import { GridColDef, GridFooterContainer, GridPagination, GridRowParams } from "@mui/x-data-grid";
import { useContext, useState, useRef, useMemo, useCallback, useEffect } from "react";
import { formatDate } from "../../../generalUtilities";
import { userContext } from "../../../Requisitions/context/userContext";
import { OpportunityInfoContext } from "../../context/OpportunityInfoContext";
import { OpportunityInfo } from "../../types";
import { getOpportunities } from "../../utils";


const UseOpportunityInfoTable = ( ) => { 
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
                cellClassName : 'description-cell'
            },
            { field: "nomeCliente", headerName: "Cliente" }, // c.NOME
            { field: "nomeVendedor", headerName: "Vendedor" }, // vendedor.NOME
            { field: "nomeGerente", headerName: "Gerente" }, // gerente.NOME
            {
                field: "valorFaturamentoDolphin",
                headerName: "Faturamento Dolphin",
            }, 
            {
                field: "valorFaturamentoDireto",
                headerName: "Faturamento Direto",
            }, 
            {
                field: "valorTotal",
                headerName: "Valor Total",
            },
            {
                field: "dataSolicitacao",
                headerName: "Solicitação",
                valueFormatter: (value: Date) => {
                    if (value) return formatDate(value);
                    return "-";
                },
            }, 
            {
                field: "dataFechamento",
                headerName: "Fechamento",
                valueFormatter: (value: Date) => {
                    if (value) return formatDate(value);
                    return "-";
                },
            },
            {
                field: "dataInteracao",
                headerName: "Data de Interação",
                valueFormatter: (value: Date) => {
                    if (value) return formatDate(value);
                    return "-";
                },
            },
            {
                field: "dataInicio",
                headerName: "Data de Início",
                valueFormatter: (value: Date) => {
                    if (value) return new Date(value).toLocaleDateString("pt-BR");
                    return "-";
                },
            }, 
            {
                field: "numeroOs",
                headerName: "Nº OS",
            }, 
        ],
        []
    );

    const calculateIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
    }

    const calculateInitialCardViewActive = () => {
        setIsCardViewActive(windowWith <= 768);
    };

    const fetchOpportunities = useCallback(async () => {
        setIsLoading(true);
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
            console.log(gridRowCount, gridHeight);
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
              display: isMobile ? "none" : "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              flexGrow: 1, // Ocupa o espaço disponível
              overflowX: "auto", // Permite rolagem horizontal se necessário
            }}
          >
            <Typography fontSize="small" color="white">
              <span className="font-semibold tracking-wide">
                {" "}
                Nº de Registros{" "}
              </span>{" "}
              {rows.length}
            </Typography>
            <Typography fontSize="small" color="white">
              <span className="font-semibold tracking-wide">
                {" "}
                Faturamento Dolphin:{" "}
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
              <span className="font-semibold tracking-wide">
                {" "}
                Valor Total:{" "}
              </span>{" "}
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
    calculateIsMobile()
    fetchOpportunities();
}, [fetchOpportunities, refreshOpportunityInfo]);

    return {
      // State Variables
      rows,
      allRows,
      isCardViewActive,
      gridOuterContainerHeight,
      gridColumnsCount,
      cardWidth,
      gridRowCount,
      isLoading,

      // Refs
      GridOuterContainerRef,

      // Functions
      setRows,
      setIsCardViewActive,
      shouldShowGrid,
      selectOpportunity,

      // Components
      columns,
      GridFooter,
    };
}
export default UseOpportunityInfoTable;

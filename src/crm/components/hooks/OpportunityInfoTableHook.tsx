import { Box, Tooltip, Typography } from "@mui/material";
import {
  GridColDef,
  GridFooterContainer,
  GridPagination,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  useContext,
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { formatDate } from "../../../generalUtilities";
import { userContext } from "../../../Requisitions/context/userContext";
import { OpportunityInfoContext } from "../../context/OpportunityInfoContext";
import { OpportunityInfo } from "../../types";
import { getOpportunities } from "../../utils";
import {
  Error as ErrorIcon, // Vermelho - Vencida
  Warning as WarningIcon, // Amarelo - A vencer
  CheckCircle as CheckIcon, // Verde - Em dia
  Help as HelpIcon, // Cinza - Sem data
} from "@mui/icons-material";

const StatusIconCell = ({ row }: { row: OpportunityInfo }) => {
  let icon = null;
  let tooltip = "";

  if (row.dataInteracao_vencida) {
    icon = <ErrorIcon color="error" />;
    tooltip = "Data vencida";
  } else if (row.dataInteracao_a_vencer) {
    icon = <WarningIcon color="warning" />;
    tooltip = "A vencer (próximos 5 dias)";
  } else if (row.dataInteracao_em_dia) {
    icon = <CheckIcon color="success" />;
    tooltip = "Em dia";
  } else {
    icon = <HelpIcon color="disabled" />;
    tooltip = "Sem data definida";
  }

  return (
    <Tooltip title={tooltip} arrow>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        {icon}
      </div>
    </Tooltip>
  );
};

const UseOpportunityInfoTable = () => {
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
// dataInteracao_vencida? : number;
//   dataInteracao_a_vencer? : number;
//   dataInteracao_em_dia? : number;

  const columns: GridColDef<OpportunityInfo>[] = useMemo(
    () => [
      {
        field: "",
        headerName: "Situação",
        width: 100,
        renderCell: (params) => <StatusIconCell row={params.row} />,
        sortable: false,
        filterable: false,
      },
      { field: "numeroProjeto", headerName: "Nº Projeto" }, // os.ID_PROJETO
      { field: "numeroAdicional", headerName: "Nº Adicional" }, // os.ID_ADICIONAL
      { field: "nomeStatus", headerName: "Status" }, // s.NOME
      {
        field: "nomeDescricaoProposta",
        headerName: "Descrição",
        editable: false,
        cellClassName: "description-cell",
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
          if (!value) return "-";
          return formatDate(value);
        },
        cellClassName: "dataInteracao-cell",
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
  };

  const calculateInitialCardViewActive = () => {
    if (!isCardViewActive) {
      setIsCardViewActive(windowWith <= 768);
    }
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
      rows.length > 0 &&
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
    console.log('row count: ', gridRowCount)
    setGridRowCount(gridRowCount);
    return gridRowCount;
  };

  const calculateLayoutProps = useCallback(
    (registerCount: number) => {
      const cardWidth = calculateCardWidth();
      const gridColumnsCount = calculateGridColumnsCount(cardWidth);
      calculateGridRowCount(registerCount, gridColumnsCount);
      calculateGridHeight();
      calculateInitialCardViewActive();
      //  calculateIsMobile();
    },
    [calculateCardWidth, calculateGridColumnsCount, rows, isCardViewActive]
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
            <span className="font-semibold tracking-wide"> Valor Total: </span>{" "}
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
    calculateIsMobile();
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
    calculateLayoutProps,
    // Components
    columns,
    GridFooter,
  };
};
export default UseOpportunityInfoTable;

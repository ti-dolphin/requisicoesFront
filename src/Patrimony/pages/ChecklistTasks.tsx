/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { userContext } from "../../Requisitions/context/userContext";
import { MovementationChecklist } from "../types";
import { dateTimeRenderer, getPatrimonyNotifications } from "../utils";
import { TableVirtuoso, TableComponents } from "react-virtuoso";
import ErrorIcon from "@mui/icons-material/Error";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { checklistContext } from "../context/checklistContext";
import ChecklistItemsModal from "../modals/ChecklistItemsModal";
import { useNavigate } from "react-router-dom";
import ChecklistFiltersMobileMenu from "../components/ChecklistFiltersMobileMenu";

interface ColumnData {
  dataKey: keyof MovementationChecklist;
  label: string;
  numeric?: boolean;
  width?: number;
}

const columns: ColumnData[] = [
  {
    width: 80,
    label: "Checklist",
    dataKey: "id_checklist_movimentacao",
    numeric: true,
  },
  {
    width: 100,
    label: "Movimentação",
    dataKey: "id_movimentacao",
    numeric: true,
  },
  {
    width: 180,
    label: "Data de Criação",
    dataKey: "data_criacao",
  },
  {
    width: 70,
    label: "Realizado",
    dataKey: "realizado",
    numeric: true,
  },
  {
    width: 70,
    label: "Aprovado",
    dataKey: "aprovado",
    numeric: true,
  },

  {
    width: 180,
    label: "Data de Realização",
    dataKey: "data_realizado",
  },

  {
    width: 180,
    label: "Data de Aprovação",
    dataKey: "data_aprovado",
  },
  {
    label: "Patrimônio",
    dataKey: "nome_patrimonio",
    width: 300,
    numeric: false,
  },
  {
    width: 500,
    label: "Projeto",
    dataKey: "descricao_projeto",
    numeric: false,
  },
  {
    width: 200,
    label: "Responsável",
    dataKey: "nome_responsavel",
    numeric: true,
  },
];

const VirtuosoTableComponents: TableComponents<MovementationChecklist> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: "separate", tableLayout: "fixed" }}
    />
  ),
  TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

const ChecklistTasks = () => {
  const [notifications, setNotifications] =
    useState<MovementationChecklist[]>();
  const [filteredNotificaitonsByUser, setFilteredNotificaitonsByUser] =
    useState<MovementationChecklist[]>([]);
  const [currentStatusFilterSelected, setCurrentStatusFilterSelected] =
    useState<string>("");
  const [currentFilteredByStatus, setCurrentFilteredByStatus] = useState<
    MovementationChecklist[]
  >([]);
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useContext(userContext);
  const {
    toggleChecklistOpen,
    refreshChecklist,
    currentColumnFilters,
    setCurrentColumnFilters,
  } = useContext(checklistContext);
  const navigate = useNavigate();

  const getNotifications = useCallback(async () => {
    console.log("getNotifications");
    if (user) {
      const notifications = await getPatrimonyNotifications(user);
      console.log("notifications: ", notifications);
      const filteredNotifications = notifications.filter(
        (notification: MovementationChecklist) => {
          if (responsableForTypeNotification(notification)) {
            return notification;
          }
          if (responsableForPatrimonyNotification(notification)) {
            return notification;
          }
        }
      );
      setNotifications(filteredNotifications);
      setFilteredNotificaitonsByUser(filteredNotifications);
    }
  }, []);

  const handleChangeColumnFilter = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    column: ColumnData
  ) => {
    const { value } = e.target;
    const changedColumnFilters = currentColumnFilters.map((columnfilter) =>
      columnfilter.dataKey === column.dataKey
        ? {
            ...columnfilter,
            filterValue: value,
          }
        : columnfilter
    );

    setCurrentColumnFilters(changedColumnFilters);
    const activeFilters = changedColumnFilters.filter(
      (filter) => filter.filterValue.trim() !== ""
    );
    const filteredNotifications = currentFilteredByStatus?.filter(
      (notification) => {
        return activeFilters.every((filter) => {
          const { dataKey, filterValue } = filter;
          if (
            dataKey === "id_checklist_movimentacao" ||
            dataKey === "id_movimentacao"
          ) {
            console.log("coluna numérica");
            return (
              String(notification[dataKey as keyof MovementationChecklist]) ===
              String(filterValue)
            );
          }
          if (dataKey === "data_realizado" || dataKey === "data_criacao") {
            // Filtrar por valores de data renderizados
            const renderedDate = renderDateValue(dataKey, notification);
            return renderedDate?.includes(filterValue);
          }
          // Filtro padrão (string contém valor do filtro)
          return String(notification[dataKey as keyof MovementationChecklist])
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      }
    );
    setFilteredNotificaitonsByUser(filteredNotifications || []);
    //getActiveFilters
    //filter the notifications state variable accordingly to the active filters and set the result to the filteredNotificaitonsByUser using  setFilteredNotificaitonsByUser
  };

  function fixedHeaderContent() {
    return (
      <TableRow sx={{ backgroundColor: "#2B3990" }}>
        {columns.map((column) => (
          <TableCell
            key={column.dataKey}
            variant="head"
            align={column.numeric || false ? "left" : "left"}
            sx={{ width: column.width, paddingY: 0.4 }}
          >
            <Typography fontSize="small" fontFamily="Roboto" color="white">
              {column.label}
            </Typography>
            <TextField
              id="standard-basic"
              label=""
              variant="standard"
              onChange={(e) => handleChangeColumnFilter(e, column)}
              sx={{
                fontSize: "10px", // Tamanho da fonte do texto digitado
                "& .MuiInput-underline:before": {
                  borderBottom: "1px solid white", // Linha padrão
                },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                  borderBottom: "2px solid white", // Linha ao passar o mouse
                },
                "& .MuiInput-underline:after": {
                  borderBottom: "2px solid white", // Linha ao focar no campo
                },
              }}
              InputProps={{
                sx: {
                  color: "white",
                  "&:hover:not(.Mui-disabled):before": {
                    borderBottom: "2px solid white", // Linha ao passar o mouse
                  },
                  "&:after": {
                    borderBottom: "2px solid white", // Linha ao focar no campo
                  },

                  height: "1rem",
                },
              }}
            />
          </TableCell>
        ))}
      </TableRow>
    );
  }

  const responsableForPatrimonyNotification = (
    notification: MovementationChecklist
  ) => {
    return isMovimentationResponsable(notification) && !notification.realizado;
  };

  const responsableForTypeNotification = (
    notification: MovementationChecklist
  ) => {
    if (isTypeResponsable(notification)) {
      if (!notification.aprovado && notification.realizado) {
        return true; //para aprovação
      }
      //para aprovar
      if (
        !notification.aprovado &&
        !notification.realizado &&
        isLate(notification)
      ) {
        return true;
      }
    }
    return false;
  };

  const isTypeResponsable = (checklist: MovementationChecklist) => {
    return checklist.responsavel_tipo === user?.responsavel_tipo;
  };

  const isMovimentationResponsable = (checklist: MovementationChecklist) => {
    console.log(
      "isMoveRespnsable: ",
      checklist.responsavel_movimentacao === user?.CODPESSOA
    );
    return checklist.responsavel_movimentacao === user?.CODPESSOA;
  };

  const handleBack = () => {
    navigate("/patrimony");
  };
  const isLate = (row: MovementationChecklist) => {
    const creationDate = new Date(row.data_criacao);
    const today = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);
    return creationDate < threeDaysAgo && !row.realizado;
  };

  const renderDateValue = (dataKey: string, row: MovementationChecklist) => {
    const date = dateTimeRenderer(
      row[dataKey as keyof MovementationChecklist] || ""
    );
    return date === "Invalid Date, Invalid Date" ? "" : date;
  };

  const toBeAproved = (row: MovementationChecklist) => {
    return row.realizado && !row.aprovado;
  };

  function rowContent(_index: number, row: MovementationChecklist) {
    const isDateValue = (column: ColumnData) => {
      return (
        column.dataKey === "data_aprovado" ||
        column.dataKey === "data_realizado" ||
        column.dataKey === "data_criacao"
      );
    };

    const renderValue = (column: ColumnData) => {
      if (column.dataKey === "aprovado") {
        return (
          <ErrorIcon
            sx={{
              color:
                toBeAproved(row) && isTypeResponsable(row) ? "#ff9a3c" : "gray",
            }}
          ></ErrorIcon>
        );
      }

      if (column.dataKey === "realizado") {
        return toBeDone(row) ? (
          <ErrorIcon
            sx={{
              color: isLate(row) ? "red" : "#ff9a3c",
            }}
          ></ErrorIcon>
        ) : (
          <CheckCircleIcon
            sx={{
              color: "green",
            }}
          />
        );
        // <ErrorIcon
        //   sx={{
        //     color: toBeDone(row) ? (isLate(row) ? "red" : "#ff9a3c") : "gray",
        //   }}
        // ></ErrorIcon>
      }
      return row[column.dataKey];
    };

    const handleOpenChecklist = (row: MovementationChecklist) => {
      toggleChecklistOpen(row);
    };
    const toBeDone = (row: MovementationChecklist) => {
      return !row.aprovado && !row.realizado;
    };

    return (
      <React.Fragment>
        {columns.map((column) => (
          <TableCell
            sx={{
              cursor: "pointer",
              paddingY: "0.5rem",
            }}
            onClick={() => handleOpenChecklist(row)}
            key={column.dataKey}
            align={column.numeric || false ? "left" : "left"}
          >
            <Typography fontSize="small">
              {isDateValue(column)
                ? renderDateValue(column.dataKey, row)
                : renderValue(column)}
            </Typography>
          </TableCell>
        ))}
      </React.Fragment>
    );
  }
  const filterByStatus = (
        checklistStatus: string,
    e?: React.MouseEvent<HTMLButtonElement>

  ) => {
    if (checklistStatus === "atrasados" && notifications) {
      setCurrentStatusFilterSelected("atrasados");
      const filteredByStatus = notifications.filter(
        (notification) => notification.atrasado
      );
      setFilteredNotificaitonsByUser(filteredByStatus);
      setCurrentFilteredByStatus(filteredByStatus);
      return;
    }
    if (checklistStatus === "aprovar" && notifications) {
      setCurrentStatusFilterSelected("aprovar");
      const filteredByStatus = notifications.filter((notification) =>
        toBeAproved(notification)
      );
      setFilteredNotificaitonsByUser(filteredByStatus);
      setCurrentFilteredByStatus(filteredByStatus);
      return;
    }
    if (checklistStatus === "problemas" && notifications) {
      setCurrentStatusFilterSelected("problemas");
      const filteredByStatus = notifications.filter(
        (notification) => notification.problema
      );
      setFilteredNotificaitonsByUser(filteredByStatus);
      setCurrentFilteredByStatus(filteredByStatus);
      return;
    }
    setCurrentStatusFilterSelected("todos");
    setCurrentFilteredByStatus(notifications || []);
    setFilteredNotificaitonsByUser(notifications || []);
  };

 useEffect(() => {
   // Função para atualizar o estado com base no tamanho da tela
   const checkIsMobile = () => {
     setIsMobile(window.matchMedia("(max-width: 768px)").matches);
   };

   // Verifica o estado inicial
   checkIsMobile();

   // Adiciona um listener para mudanças no tamanho da janela
   window.addEventListener("resize", checkIsMobile);

   // Remove o listener ao desmontar o componente
   return () => {
     window.removeEventListener("resize", checkIsMobile);
   };
 }, []);

  useEffect(() => {
    getNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshChecklist]);

  return (
    <Box
      sx={{
        height: "85vh",
        width: "100%",
        padding: {
          xs: 0.2,
          sm: 2,
          md: 3,
          lg: 2,
          xl: 1,
        },
      }}
    >
      <Box>
        <AppBar
          position="static"
          sx={{
            boxShadow: "none",

            backgroundColor: "#2B3990",
            height: {
              xs: "8rem",
              sm: "5rem",
              md: "4rem",
              lg: "4rem",
              xl: "3rem",
            },
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "center",
            flexGrow: 1,
            paddingX: "2rem",

          }}
        >
          <Box display="flex" alignItems="center" left={2} width={{xs: '90%', sm: '80%', md: '70%', lg: '60%', xl: '20%'}} >
            <IconButton
              onClick={handleBack}
              sx={{
                color: "#F7941E",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                },
                zIndex: 1000, // Coloca o ícone acima do modal
              }}
            >
              <ArrowLeftIcon />
            </IconButton>
            <Typography
              variant="h6"
              textAlign="center"
              fontSize="medium"
              fontFamily="Roboto"
              padding={2}
            >
              {notifications?.length
                ? `Checklists Pendentes`
                : `Não há checklists pendentes`}
            </Typography>
          </Box>
          {isMobile && user?.responsavel_tipo && (
            <ChecklistFiltersMobileMenu filterByStatus={filterByStatus} />
          )}
          {!isMobile && user?.responsavel_tipo && (
            <Stack direction={"row"} spacing={2} alignItems="center">
              <Button
                id="atrasados"
                onClick={(e) => filterByStatus("atrasados")}
                sx={{
                  color: "white",
                  backgroundColor:
                    currentStatusFilterSelected === "atrasados"
                      ? "#f1b963"
                      : "#F7941E",
                  "&:hover": {
                    backgroundColor: "#f1b963",
                  },
                  height: "1.4rem",
                  fontSize: "12px",
                }}
              >
                Atrasados
              </Button>
              <Button
                onClick={(e) => filterByStatus("aprovar")}
                sx={{
                  color: "white",
                  backgroundColor:
                    currentStatusFilterSelected === "aprovar"
                      ? "#f1b963"
                      : "#F7941E",
                  "&:hover": {
                    backgroundColor: "#f1b963",
                  },
                  height: "1.4rem",
                  fontSize: "12px",
                }}
              >
                para aprovar
              </Button>
              <Button
                onClick={(e) => filterByStatus("problemas")}
                sx={{
                  color: "white",
                  backgroundColor:
                    currentStatusFilterSelected === "problemas"
                      ? "#f1b963"
                      : "#F7941E",
                  "&:hover": {
                    backgroundColor: "#f1b963",
                  },
                  height: "1.4rem",
                  fontSize: "12px",
                }}
              >
                Problemas
              </Button>
              <Button
                onClick={(e) => filterByStatus("todos")}
                sx={{
                  color: "white",
                  backgroundColor:
                    currentStatusFilterSelected === "todos" ||
                    currentStatusFilterSelected === ""
                      ? "#f1b963"
                      : "#F7941E",
                  "&:hover": {
                    backgroundColor: "#f1b963",
                  },
                  height: "1.4rem",
                  fontSize: "12px",
                }}
              >
                Todos
              </Button>
            </Stack>
          )}
        </AppBar>
      </Box>
      <TableVirtuoso
        data={filteredNotificaitonsByUser}
        components={{
          ...VirtuosoTableComponents,
          TableRow: (props) => (
            <TableRow
              {...props}
              sx={{
                cursor: "pointer",
                "&:hover": { backgroundColor: "#e7eaf6" },
              }}
            />
          ),
        }}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
      <Box
        display="flex"
        justifyContent="flex-end"
        paddingY="0.4rem"
        paddingX="2rem"
      >
        {filteredNotificaitonsByUser && (
          <Typography
            variant="body2"
            color="blue"
            fontWeight="semibold"
            fontFamily="Roboto"
          >
            Total de Checklists: {filteredNotificaitonsByUser.length}
          </Typography>
        )}
      </Box>
      <ChecklistItemsModal />
    </Box>
  );
};

export default ChecklistTasks;

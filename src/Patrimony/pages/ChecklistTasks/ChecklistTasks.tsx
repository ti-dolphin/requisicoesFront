/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Box,
  Paper,
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
import { userContext } from "../../../Requisitions/context/userContext";
import { MovementationChecklist } from "../../types";
import {
  dateTimeRenderer,
  getPatrimonyNotifications,
  renderValue,
} from "../../utils";
import { TableVirtuoso, TableComponents } from "react-virtuoso";
import { checklistContext } from "../../context/checklistContext";
import ChecklistItemsModal from "../../components/modals/ChecklistItemsModal/ChecklistItemsModal";
import { useNavigate } from "react-router-dom";
import { FixedSizeList } from "react-window";
import ChecklistCard from "../../components/ChecklistCard/ChecklistCard";
import { ChecklistColumnData } from "../../../crm/types";
import ChecklistAppBar from "../../components/ChecklistAppBar/ChecklistAppBar";

const columns: ChecklistColumnData[] = [
  {
    width: 80,
    label: "Checklist",
    dataKey: "id_checklist_movimentacao",
    numeric: true,
  },
  {
    width: 80,
    label: "Patrimônio",
    dataKey: "id_patrimonio",
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
  const { user } = useContext(userContext);
  const {
    toggleChecklistOpen,
    refreshChecklist,
    currentColumnFilters,
    setCurrentColumnFilters,
    filteredNotificationsByUser,
    currentStatusFilterSelected,
    setCurrentStatusFilterSelected,
    currentFilteredByStatus,
    setCurrentFilteredByStatus,
    setFilteredNotificationsByUser,
  } = useContext(checklistContext);

  const [isMobile, setIsMobile] = useState(false);

  const [isCardViewActive, setIsCardViewActive] = useState(false);

  const navigate = useNavigate();

  const filterByActiveColumnFilters = useCallback(
    (
      columnFilters: { dataKey: string; filterValue: string }[],
      notifications: MovementationChecklist[]
    ) => {
      const activeFilters = columnFilters.filter(
        (filter) => filter.filterValue.trim() !== ""
      );

      if (activeFilters.length > 0) {
        const filteredNotifications = notifications?.filter((notification) => {
          return activeFilters.every((filter) => {
            const { dataKey, filterValue } = filter;
            if (
              dataKey === "id_checklist_movimentacao" ||
              dataKey === "id_movimentacao"
            ) {
              console.log("coluna numérica");
              return (
                String(
                  notification[dataKey as keyof MovementationChecklist]
                ) === String(filterValue)
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
        });
        return filteredNotifications;
      }
      return notifications;
    },
    []
  );

  const getNotifications = useCallback(async () => {
    console.log("currentColumn filters: ", currentColumnFilters);
    if (user) {
      const notifications = await getPatrimonyNotifications(
        user,
        currentStatusFilterSelected
      );
      setCurrentFilteredByStatus(notifications);
      const filteredByUser = filterByActiveColumnFilters(
        currentColumnFilters,
        notifications
      );
      setFilteredNotificationsByUser(filteredByUser);
    }
  }, [
    currentColumnFilters,
    currentStatusFilterSelected,
    filterByActiveColumnFilters,
    setCurrentFilteredByStatus,
    setFilteredNotificationsByUser,
    user,
  ]);

  const handleChangeColumnFilter = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    column: ChecklistColumnData
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
    const filteredByColumnsNotifications = filterByActiveColumnFilters(
      changedColumnFilters,
      currentFilteredByStatus
    );
    console.log(
      "filteredByColumnsNotifications",
      filteredByColumnsNotifications
    );
    setFilteredNotificationsByUser(filteredByColumnsNotifications || []);
  };

  function fixedHeaderContent() {
    return (
      <TableRow sx={{ backgroundColor: "#2B3990", borderRadius: "none" }}>
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
            {column.dataKey !== "realizado" &&
              column.dataKey !== "aprovado" && (
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
              )}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  const handleBack = () => {
    navigate("/patrimony");
  };

  const renderDateValue = (dataKey: string, row: MovementationChecklist) => {
    const date = dateTimeRenderer(
      row[dataKey as keyof MovementationChecklist] || ""
    );
    return date === "Invalid Date, Invalid Date" ? "" : date;
  };

  const handleOpenChecklist = (row: MovementationChecklist) => {
    toggleChecklistOpen(row);
  };

  function rowContent(_index: number, row: MovementationChecklist) {
    const isDateValue = (column: ChecklistColumnData) => {
      return (
        column.dataKey === "data_aprovado" ||
        column.dataKey === "data_realizado" ||
        column.dataKey === "data_criacao"
      );
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
                : user && renderValue(column, row, user)}
            </Typography>
          </TableCell>
        ))}
      </React.Fragment>
    );
  }

  const filterByStatus = (checklistStatus: string) => {
    if (checklistStatus === "atrasados") {
      console.log("atrasados");
      setCurrentStatusFilterSelected("atrasados");
      return;
    }
    if (checklistStatus === "aprovar") {
      console.log("aprovar");
      setCurrentStatusFilterSelected("aprovar");
      return;
    }
    if (checklistStatus === "problemas") {
      console.log("problemas");
      setCurrentStatusFilterSelected("problemas");
      return;
    }
    if (checklistStatus === "todos") {
      console.log("todos");
      setCurrentStatusFilterSelected("todos");
      return;
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    console.log("searching for: ", value);
    const filteredNotifications = currentFilteredByStatus.filter(
      (notification) =>
        notification.nome.toLowerCase().includes(value.toLowerCase()) ||
        notification.descricao_projeto
          ?.toLowerCase()
          .includes(value.toLowerCase()) ||
        notification.nome_responsavel
          ?.toLowerCase()
          .includes(value.toLowerCase())
    );
    setFilteredNotificationsByUser(filteredNotifications);
  };

  useEffect(() => {
    // Função para atualizar o estado com base no tamanho da tela
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
      setIsCardViewActive(window.innerWidth <= 768);
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
  }, [refreshChecklist, currentStatusFilterSelected]);

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
      {user && (
        <ChecklistAppBar
          setIsCardViewActive={setIsCardViewActive}
          isCardViewActive={isCardViewActive}
          handleSearch={handleSearch}
          handleBack={handleBack}
          filterByStatus={filterByStatus}
          user={user}
          currentStatusFilterSelected={currentStatusFilterSelected}
          isMobile={isMobile}
        />
      )}

      {/* Non Mobile Table View */}
      {filteredNotificationsByUser && !isCardViewActive && (
        <TableVirtuoso
          data={filteredNotificationsByUser}
          style={{ borderRadius: 0 }}
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
      )}
      {/* Mobile Table view */}
      {filteredNotificationsByUser && isCardViewActive && (
        <FixedSizeList
          height={640}
          width="100%"
          itemSize={320}
          itemCount={filteredNotificationsByUser.length}
          overscanCount={1}
        >
          {({ index, style, data }) => {
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
                handleOpenChecklist={handleOpenChecklist}
                renderValue={renderValue}
                key={index}
                props={{ index, style, data }}
                columns={columns}
                cardData={filteredNotificationsByUser[index]}
              />
            );
          }}
        </FixedSizeList>
      )}
      {/* Table Footer */}
      <Box
        display="flex"
        justifyContent="flex-end"
        paddingY="0.4rem"
        paddingX="2rem"
      >
        {filteredNotificationsByUser && (
          <Typography
            variant="body2"
            color="blue"
            fontWeight="semibold"
            fontFamily="Roboto"
          >
            Total de Checklists: {filteredNotificationsByUser.length}
          </Typography>
        )}
      </Box>
      <ChecklistItemsModal />
    </Box>
  );
};

export default ChecklistTasks;

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  AppBar,
} from "@mui/material";
import { MovementationChecklist } from "../types";
import { checklistContext } from "../context/checklistContext";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import { useNavigate, useParams } from "react-router-dom";
import ChecklistItemsModal from "../modals/ChecklistItemsModal";
import { dateTimeRenderer, getChecklistDataByPatrimonyId } from "../utils";

const PatrimonyChecklist = () => {
  const navigate = useNavigate();
  const { id_patrimonio } = useParams();
  const { toggleChecklistOpen, refreshChecklist } =useContext(checklistContext);
  const [checklistData, setChecklistData] =
    useState<MovementationChecklist[]>();

  const handleOpenChecklist = (row: MovementationChecklist) => {
    const { id_patrimonio, id_movimentacao, id_checklist_movimentacao } = row;
    console.log({ id_patrimonio, id_movimentacao, id_checklist_movimentacao });
    toggleChecklistOpen(row);
  };

  const handleBack = () => {
    navigate(`/patrimony`);
  };

  const getChecklistData = async () => {
    const checkListData = await getChecklistDataByPatrimonyId(
      Number(id_patrimonio)
    );
    if (checkListData) {
      console.log("checklist data: ", checkListData);
      setChecklistData(checkListData);
    }
  };
  const dateRenderer = (value?: string | number | null) => {
    if (typeof value === "string") {
      const date = value.substring(0, 10).replace(/-/g, "/");
      const time = value.substring(11, 19);
      let formatted = `${date}, ${time}`;
      const localeDate = new Date(formatted).toLocaleDateString();
      formatted = `${localeDate}, ${time}`;
      return formatted;
    }
  };

  const renderColumnValue = (
    dataKey: string,
    value: string | number | null | undefined
  ) => {
    if (dataKey === "aprovado") {
      return value === 1 ? "Sim" : "Não";
    }
    if (dataKey === "realizado") {
      return value === 1 ? "Sim" : "Não";
    }
    if (dataKey === "data_criacao") {
      return dateRenderer(value);
    }
    if (dataKey === "data_aprovado") {
      return dateRenderer(value);
    }
    if (dataKey === "data_realizado") {
      const date = dateTimeRenderer(value || "")
      if(date === 'Invalid Date, Invalid Date'){ 
        return '';
      }
      return date;
    }
    return value;
  };

  useEffect(() => {
    getChecklistData();
  }, [refreshChecklist]);

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      padding={{
        xs: 0.2,
        sm: 2,
        md: 3,
        lg: 2,
        xl: 1,
      }}
    >
      <Box>
        <AppBar
          position="static"
          sx={{
            boxShadow: "none",
            backgroundColor: "#2B3990",
            display: "flex",
            height: "fit-content",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: "0.4rem",
            paddingX: "2rem",
          }}
        >
          <Box display="flex" alignItems="center" flexGrow={1} flexShrink={1}>
            <IconButton
              sx={{
                color: "#F7941E",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                },
                zIndex: 1000, // Coloca o ícone acima do modal
              }}
              onClick={handleBack}
            >
              <ArrowLeftIcon />
            </IconButton>
            <Typography
              
              textAlign="left"
              fontSize="medium"
              fontFamily={"Roboto"}
              padding={2}
            >
              {checklistData?.length
                ? `Historico de Checklists do Patrimônio | ${checklistData[0].nome_patrimonio} | 000${checklistData[0].id_patrimonio}`
                : "Não há checklists para este patrimônio"}
            </Typography>
          </Box>
        </AppBar>
      </Box>
      <TableContainer
        sx={{ boxShadow: "none", border: "1px solid #e3e3e3" }}
        component={Paper}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#2B3990" }}>
              {columns.map((column) => (
                <TableCell key={column.dataKey} width={column.width}>
                  <Typography
                    fontSize="small"
                    fontFamily="Roboto"
                    color="white"
                  >
                    {column.label}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {checklistData &&
              checklistData.map((row) => (
                <TableRow
                  onClick={() => handleOpenChecklist(row)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#e7eaf6",
                    },
                  }}
                  key={row.id_checklist_movimentacao}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.dataKey}
                      width={column.width}
                      sx={{ paddingY: "0.5rem" }}
                    >
                      <Typography fontSize="small">
                        {renderColumnValue(column.dataKey, row[column.dataKey])}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Box
          display="flex"
          justifyContent="flex-end"
          paddingY="0.4rem"
          paddingX="2rem"
        >
          {checklistData && (
            <Typography
              variant="body2"
              color="blue"
              fontWeight="semibold"
              fontFamily="Roboto"
            >
              Total de Checklists: {checklistData.length}
            </Typography>
          )}
        </Box>
      </TableContainer>
      <ChecklistItemsModal />
    </Box>
  );
};

type Column = {
  label: string;
  dataKey: keyof MovementationChecklist;
  width: number;
};
const columns: Column[] = [
  {
    label: "Checklist",
    dataKey: "id_checklist_movimentacao",
    width: 100, // Ajuste de largura para caber bem na tabela
  },
  {
    label: "Movimentação",
    dataKey: "id_movimentacao",
    width: 120, // Um pouco mais largo devido ao número de caracteres
  },
  {
    label: "Data de Criação",
    dataKey: "data_criacao",
    width: 120, // Suficiente para acomodar a data
  },

  {
    label: "Realizado",
    dataKey: "realizado",
    width: 100,
  },
  {
    label: "Data de Realização",
    dataKey: "data_realizado",
    width: 130, // Pode precisar de espaço adicional para valores ou "N/A"
  },
  {
    label: "Aprovado",
    dataKey: "aprovado",
    width: 100, // Compacto como 'Realizado'
  },
  {
    label: "Data de Aprovação",
    dataKey: "data_aprovado",
    width: 130, // Similar a 'Data Realizado'
  },
  { 
    label: 'Projeto',
    dataKey: 'descricao_projeto',
    width: 150, 
  },
  { 
    label: 'Responsável',
    dataKey: 'nome_responsavel',
    width: 150, 
  }
];



export default PatrimonyChecklist;

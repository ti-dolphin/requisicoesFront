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
  Stack,
  IconButton,
  AppBar,
  styled,
  InputBase,
  Toolbar,
} from "@mui/material";
import { MovementationChecklist } from "../types";
import { checklistContext } from "../context/checklistContext";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import { useNavigate, useParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ChecklistItemsModal from "../modals/ChecklistItemsModal";
import { dateTimeRenderer, getChecklistDataByPatrimonyId } from "../utils";

const PatrimonyChecklist = () => {
  const navigate = useNavigate();
  const { id_patrimonio } = useParams();
  const { toggleChecklistOpen, refreshChecklist } =
    useContext(checklistContext);
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
        return 'Não Realizado';
      }
      return 
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
        lg: 4,
        xl: 5,
      }}
      gap={4}
    >
      <IconButton
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          color: "#2B3990",
          fontSize: "small",
          fontWeight: "bold",
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

      <Stack></Stack>
      <Box>
        <AppBar
          position="static"
          sx={{
            boxShadow: "none",
            backgroundColor: "#2B3990",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: "0.4rem",
            paddingX: "2rem",
          }}
        >
          <Box display="flex" flexWrap="wrap">
            <Typography
              variant="h6"
              textAlign="center"
              fontSize="medium"
              padding={2}
            >
              Histórico de Checklists
            </Typography>
            <Stack direction="row" alignItems="center">
              <Toolbar>
                <Stack direction="row" alignItems="center">
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search…"
                    inputProps={{ "aria-label": "search" }}
                  />
                </Stack>
              </Toolbar>
            </Stack>
          </Box>
        </AppBar>
      </Box>
      <TableContainer
        sx={{ boxShadow: "none", border: "1px solid #e3e3e3" }}
        component={Paper}
      >
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.dataKey} width={column.width}>
                  <Typography
                    fontSize="small"
                    fontWeight="bold"
                    textAlign="center"
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
                      backgroundColor: "#F5F5F5",
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
                      <Typography fontSize="small" textAlign="center">
                        {renderColumnValue(column.dataKey, row[column.dataKey])}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
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
    label: "Observação",
    dataKey: "observacao",
    width: 200, // Largura maior para texto livre
  },
];

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export default PatrimonyChecklist;

import {
  Dispatch,
  SetStateAction,
  useContext,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { userContext } from "../../../context/userContext";
import AddRequisitionModal from "../../../components/modals/AddRequisitionModal";
import { BaseButtonStyles, buttonStylesMobile } from "../../../../utilStyles";
import { orange } from "@mui/material/colors";
import typographyStyles from "../../../utilStyles";
import { Requisition } from "../../../types";

const kanbanFiltersByProfile = {
  director: [
    { label: "Backlog", statuses: ["Em edição"] },
    {
      label: "Acompanhamento",
      statuses: [
        "Em cotação",
        "Requisitado",
        "Aprovação Gerente",
        "Aprovação Diretoria",
        "Gerar OC",
      ],
    },
    {
      label: "A Fazer",
      statuses: ["Aprovação Diretoria"],
    },
    { label: "Tudo", statuses: [] },
  ],
  manager: [
    { label: "Backlog", statuses: ["Em edição"] },
    {
      label: "Acompanhamento",
      statuses: [
        "Em cotação",
        "Requisitado",
        "Aprovação Diretoria",
        "Gerar OC",
      ],
    },
    {
      label: "A Fazer",
      statuses: ["Aprovação Gerente"],
    },
    { label: "Tudo", statuses: [] },
  ],
  purchaser: [
    { label: "A Fazer", statuses: ["Requisitado", "Gerar OC"] },
    {
      label: "Fazendo",
      statuses: ["Em cotação", "Gerar OC"],
    },
    {
      label: "Acompanhamento",
      statuses: ["Aprovação Gerente", "Aprovação Diretoria"],
    },
    { label: "Concluído", statuses: ["OC Gerada"] },
    { label: "Tudo", statuses: [] },
  ],
  responsible: [
    { label: "Backlog", statuses: ["Em edição"] },
    {
      label: "Acompanhamento",
      statuses: [
        "Em cotação",
        "Requisitado",
        "Aprovação Gerente",
        "Aprovação Diretoria",
        "Gerar OC",
        "OC Gerada",
      ],
    },
    { label: "Tudo", statuses: [] },
  ],
};

interface Props {
  filteredRows: Requisition[];
  setFilteredRows: Dispatch<SetStateAction<Requisition[]>>;
  allRows: Requisition[]; // Adicionamos todas as requisições para filtragem
}

const SearchAppBar = ({ setFilteredRows, allRows }: Props) => {
  const { user } = useContext(userContext);
  const navigate = useNavigate();
  const subFilters = ["Minhas", "Todas"];
  const [filterMenu, setFilterMenu] = useState<null | HTMLElement>(null);
  const [kanbanFilter, setKanbanFilter] = useState<{
    label: string;
    statuses: string[];
  } | null>(null);
  const [availableKanbanFilters, setAvailableKanbanFilters] = useState<{ label: string; statuses: string[] }[]>([]);
  const [subFilter, setSubFilter] = useState<string>("Todas");

  const filterMenuOpen = Boolean(filterMenu);

  const determineUserProfile = () => {
    if (user?.PERM_DIRETOR && user.PERM_DIRETOR > 0) {
      console.log("director");
      return "director"; // Diretor
    }
    if (user?.CODGERENTE) {
      return "manager"; // Gerente
    }
    if (user?.PERM_COMPRADOR && user.PERM_COMPRADOR > 0) {
      return "purchaser"; // Comprador
    }
    return "responsible"; // Responsável
  };

  useEffect(() => {
    const profile = determineUserProfile();
    const filters = kanbanFiltersByProfile[profile];
    setAvailableKanbanFilters(filters);
    const defaulFilter = filters.find((filter) => filter.label === "A Fazer");
    if (defaulFilter) {
      setKanbanFilter(defaulFilter);
      return;
    }
    setKanbanFilter(filters[0]);
  }, [user]);

  useEffect(() => {
    if (!kanbanFilter) return;
    const applyKanbanFilter = (rows: Requisition[]) => {
      if (kanbanFilter.statuses.length > 0) {
        const rowsInCurrentKanbanFilter = rows.filter((row) =>
          kanbanFilter.statuses.includes(row.status?.nome || "")
        );
        if (
          kanbanFilter.label === "Acompanhamento" &&
          determineUserProfile() === "manager"
        ) {
          //gerente acompanha as que ele é resopnsável ou gerente do projeto
          const managerMonitoringRows = rowsInCurrentKanbanFilter.filter(
            (row) => row.projeto_gerente?.gerente?.CODPESSOA === user?.CODPESSOA || 
            row.responsavel_pessoa?.CODPESSOA === user?.CODPESSOA
          );
          return managerMonitoringRows;
        }
        if (
          kanbanFilter.label === "Acompanhamento" &&
          determineUserProfile() === "responsible"
        ) {
          console.log('acompanhamneto responsável')
          //gerente acompanha as que ele é resopnsável ou gerente do projeto
          const managerMonitoringRows = rowsInCurrentKanbanFilter.filter(
            (row) =>
              row.responsavel_pessoa?.CODPESSOA === user?.CODPESSOA
          );
          return managerMonitoringRows;
        }


        if(kanbanFilter.label === "Backlog"){ 
            const backlogRows = rowsInCurrentKanbanFilter.filter(
              (row) => row.responsavel_pessoa?.CODPESSOA === user?.CODPESSOA
            );
            return backlogRows;
        }
        
        return rowsInCurrentKanbanFilter;
      }
      return rows;
    };
    const applySubFilter = (rows: Requisition[]) => {
      if (subFilter === "Minhas" && user) {
        if (determineUserProfile() === "manager") {
          return rows.filter(
            (row) =>
              row.projeto_gerente?.gerente?.CODPESSOA === user.CODPESSOA ||
              row.alterado_por_pessoa?.CODPESSOA === user.CODPESSOA ||
              row.responsavel_pessoa?.CODPESSOA === user.CODPESSOA
          );
        }
        return rows.filter(
          (row) =>
            row.alterado_por_pessoa?.CODPESSOA === user.CODPESSOA ||
            row.responsavel_pessoa?.CODPESSOA === user.CODPESSOA
        );
      }
      return rows;
    };

    const filterRows = () => {
      let filteredRows = allRows;
      filteredRows = applyKanbanFilter(filteredRows);
      filteredRows = applySubFilter(filteredRows);
      setFilteredRows(filteredRows);
    };

    filterRows();
  }, [kanbanFilter, subFilter, allRows, user]);

  const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenu(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterMenu(null);
  };

  const handleSelectFilter = (filter: string) => {
    localStorage.setItem("currentSubFilter", JSON.stringify({ label: filter }));
    setSubFilter(filter);
    handleCloseFilter();
  };

  const handleChangeKanbanFilter = (filter: {
    label: string;
    statuses: string[];
  }) => {
    setKanbanFilter(filter);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <AppBar
        sx={{
          backgroundColor: "#2B3990",
          height: "fit-content",
          display: "flex",
          boxShadow: "none",
          padding: 1,
        }}
        position="static"
      >
        <IconButton
          onClick={() => navigate(`/home`)}
          sx={{ position: "absolute" }}
        >
          <ArrowCircleLeftIcon sx={{ color: "white" }} />
        </IconButton>
        <Typography
          sx={{ ...typographyStyles.heading2, marginX: 6, color: "white" }}
        >
          Requisições de Materiais / Serviços
        </Typography>
        <Toolbar sx={{ padding: 0, marginX: 2 }}>
          <Stack direction="row" width="100%" gap={1} alignItems="center">
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "end",
                overflow: "scroll",
                padding: 1,
                borderRight: {
                  xs: "1px solid white",
                  md: "none",
                },
                gap: "0.5rem",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {availableKanbanFilters.map((filter) => (
                <Button
                  key={filter.label}
                  sx={{
                    ...BaseButtonStyles,
                    minWidth: 80,
                    "&:hover": {
                      backgroundColor: orange[200],
                    },
                    backgroundColor:
                      kanbanFilter?.label === filter.label
                        ? orange[200]
                        : "orange",
                  }}
                  onClick={() => handleChangeKanbanFilter(filter)}
                >
                  <Typography
                    color="white"
                    sx={{ textTransform: "underline" }}
                    fontSize="small"
                  >
                    {filter.label}
                  </Typography>
                </Button>
              ))}
              <IconButton
                id="basic-button"
                aria-controls={filterMenuOpen ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={filterMenuOpen ? "true" : undefined}
                onClick={handleClickFilter}
                sx={{ ...buttonStylesMobile }}
              >
                <FilterAltIcon sx={{ color: "white" }} />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={filterMenu}
                open={filterMenuOpen}
                onClose={handleCloseFilter}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                {subFilters.map((filter) => (
                  <MenuItem
                    key={filter}
                    sx={{
                      backgroundColor:
                        subFilter === filter ? "#e3e3e3" : "white",
                    }}
                    onClick={() => handleSelectFilter(filter)}
                  >
                    {filter}
                  </MenuItem>
                ))}
              </Menu>
            </Stack>
            <AddRequisitionModal />
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default SearchAppBar;

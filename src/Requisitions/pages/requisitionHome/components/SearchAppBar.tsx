import {
  Dispatch,
  SetStateAction,
  useState,
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
import AddRequisitionModal from "../../../components/modals/AddRequisitionModal";
import { BaseButtonStyles, buttonStylesMobile } from "../../../../utilStyles";
import { orange } from "@mui/material/colors";
import typographyStyles from "../../../utilStyles";
import { kanban_requisicao, Requisition } from "../../../types";



interface Props {
  filteredRows: Requisition[];
  setFilteredRows: Dispatch<SetStateAction<Requisition[]>>;
  allRows: Requisition[]; // Adicionamos todas as requisições para filtragem
  kanbans: kanban_requisicao[];
  setKanban: Dispatch<SetStateAction<kanban_requisicao | undefined>>;
  setSubFilter: Dispatch<SetStateAction<string>>;
  subFilter: string;
  currentKanban: kanban_requisicao | undefined;
}


const SearchAppBar = ({
  kanbans,
  setKanban,
  setSubFilter,
  subFilter,
  currentKanban
}: Props) => {
  const navigate = useNavigate();
  const [filterMenu, setFilterMenu] = useState<null | HTMLElement>(null);
  const filterMenuOpen = Boolean(filterMenu);
  const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenu(event.currentTarget);
  };
  const handleCloseFilter = () => {
    setFilterMenu(null);
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
              {" "}
              {kanbans.map((kanban, index) => (
                <Button
                  key={index}
                  sx={{
                    ...BaseButtonStyles,
                    backgroundColor:
                      kanban === currentKanban ? orange[200] : orange[500],
                    "&:hover": { backgroundColor: orange[200] },
                  }}
                  onClick={() => setKanban(kanban)}
                >
                  {kanban.nome}
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
                {["Minhas", "Todas"].map((filter) => (
                  <MenuItem
                    key={filter}
                    sx={{
                      backgroundColor:
                        subFilter === filter ? orange[200] : "white",
                    }}
                    onClick={() => setSubFilter(filter)}
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

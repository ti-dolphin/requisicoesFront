import React from "react";
import {
  AppBar,
  Box,
  IconButton,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ChecklistFiltersMobileMenu from "./ChecklistFiltersMobileMenu";
import { basicAppbarStyles } from "../../utilStyles";
import { Search, SearchIconWrapper, StyledInputBase } from "../utils";
import SearchIcon from "@mui/icons-material/Search";
import TableViewToggleButton from "../../components/TableViewToggleButton";

interface ChecklistAppBarProps {
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBack: () => void; // Função para o botão de voltar
  filterByStatus: (status: string) => void; // Função para aplicar o filtro
  currentStatusFilterSelected: string; // Filtro selecionado atualmente
  isMobile: boolean; // Determina se é uma visualização mobile
  user?: {
    responsavel_tipo?: boolean; // Verifica se o usuário tem tipo de responsável
  };
  setIsCardViewActive: React.Dispatch<React.SetStateAction<boolean>>;
  isCardViewActive: boolean; 
}

const ChecklistAppBar: React.FC<ChecklistAppBarProps> = ({
  handleBack,
  filterByStatus,
  currentStatusFilterSelected,
  isMobile,
  user,
  handleSearch,
  isCardViewActive,
  setIsCardViewActive,
}) => {
  return (
    <Box>
      <AppBar
        position="static"
        sx={{
          ...basicAppbarStyles,
          alignItems: {
            xs: "center",
            md: "start"
          },
          
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          left={2}
          gap={1}
          width={{ xs: "90%", sm: "80%", md: "70%", lg: "60%", xl: "20%" }}
        >
          <IconButton
            onClick={handleBack}
            sx={{
              color: "#F7941E",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.05)",
              },
              zIndex: 1000,
            }}
          >
            <ArrowLeftIcon />
          </IconButton>
          <Typography
            textAlign="center"
            fontSize="medium"
            fontFamily="Roboto"
            padding={2}
          >
            Checklists Pendentes
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
              onChange={handleSearch}
            />
          </Search>
          <TableViewToggleButton
            isCardViewActive={isCardViewActive}
            setIsCardViewActive={setIsCardViewActive}
          />
        </Box>
         
        {/* Responsable for type buttons */}
        {isMobile && user?.responsavel_tipo && (
          <ChecklistFiltersMobileMenu filterByStatus={filterByStatus} />
        )}
        {!isMobile && user?.responsavel_tipo && (
          <Stack direction={"row"} spacing={2} alignItems="center">
            {["atrasados", "aprovar", "problemas", "todos"].map((status) => (
              <Button
                key={status}
                id={status}
                onClick={() => filterByStatus(status)}
                sx={{
                  color: "white",
                  backgroundColor:
                    currentStatusFilterSelected === status ||
                    (status === "todos" && currentStatusFilterSelected === "")
                      ? "#f1b963"
                      : "#F7941E",
                  "&:hover": {
                    backgroundColor: "#f1b963",
                  },
                  height: "1.4rem",
                  fontSize: "12px",
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </Stack>
        )}
      </AppBar>
    </Box>
  );
};

export default ChecklistAppBar;

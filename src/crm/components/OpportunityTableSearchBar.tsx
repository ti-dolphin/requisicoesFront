import {
  alpha,
  AppBar,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputBase,
  Stack,
  styled,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import { useNavigate } from "react-router-dom";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { OpportunityInfoContext } from "../context/OpportunityInfoContext";
import React, { useContext, useState } from "react";
import { defaultDateFilters } from "../context/OpportunityInfoContext";
import OpportunityModal from "../modals/OpportunityModal";
import AddIcon from "@mui/icons-material/Add";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { GridColDef } from "@mui/x-data-grid";
import { OpportunityInfo } from "../types";
import { BaseButtonStyles, buttonStylesMobile } from "../../utilStyles";

interface OpportunityTableSearchBarProps {
  columns: GridColDef<OpportunityInfo>[];
  allRows: OpportunityInfo[];
  setRows: React.Dispatch<React.SetStateAction<OpportunityInfo[]>>;
}
const OpportunityTableSearchBar = ({
  columns,
  allRows,
  setRows
}: OpportunityTableSearchBarProps) => {

  const {
    setFinishedOppsEnabled,
    dateFilters,
    setDateFilters,
    toggleRefreshOpportunityInfo,
    toggleCreatingOpportunity,
  } = useContext(OpportunityInfoContext);
  const [dateFiltersActive, setDateFiltersActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  }));

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
      height: 20,
      padding: theme.spacing(0.5, 0.5, 0.5, 0),
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

  const dateParams = [
    {
      dataKey: "data_inicio",
      label: "De Início",
      isFromParam: true,
    },
    {
      dataKey: "data_inicio",
      label: "Até Início",
      isFromParam: false,
    },
    {
      dataKey: "data_interacao",
      label: "De Interação",
      isFromParam: true,
    },
    {
      dataKey: "data_interacao",
      label: "Até Interação",
      isFromParam: false,
    },
    {
      dataKey: "data_fechamento",
      label: "De Fechamento",
      isFromParam: true,
    },
    {
      dataKey: "data_fechamento",
      label: "Até Fechamento",
      isFromParam: false,
    },
  ];

  const navigate = useNavigate();

  const handleChangeShowFinishedOpps = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { checked } = e.target;
    setFinishedOppsEnabled(checked);
  };

  const handleSearchWithDateParams = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    console.log(e);
    toggleRefreshOpportunityInfo();
  };

  const handleChangeDateFilters = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dateFilterReceived: {
      dataKey: string;
      label: string;
      isFromParam: boolean;
    }
  ) => {
    const { value } = e.target;
    console.log("value: ", value);

    let changedDateFitlers = [];
    console.log("isFromParam: ", dateFilterReceived.isFromParam);
    if (dateFilterReceived.isFromParam) {
      changedDateFitlers = dateFilters.map((currentDateFilter) =>
        currentDateFilter.dateFilterKey === dateFilterReceived.dataKey
          ? { ...currentDateFilter, from: value }
          : currentDateFilter
      );
    } else {
      changedDateFitlers = dateFilters.map((currentDateFilter) =>
        currentDateFilter.dateFilterKey === dateFilterReceived.dataKey
          ? { ...currentDateFilter, to: value }
          : currentDateFilter
      );
    }
    console.log("changedDateFitlers: ", changedDateFitlers);
    setDateFilters(changedDateFitlers);
  };

  const handleCleanDateFilters = () => {
    setDateFilters(defaultDateFilters);
    toggleRefreshOpportunityInfo();
  };

  const handleGeneralSerarch = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);
    const newFilteredRows = allRows.filter((row) =>
      columns.some((column) => {
        const cellValue = row[column.field as keyof OpportunityInfo];
        return cellValue && String(cellValue).toLowerCase().includes(value);
      })
    );
    setRows(newFilteredRows);
  };

  return (
    <AppBar
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "static",
        backgroundColor: "#2B3990",
        alignItems: "start",
        justifyContent: "center",
        zIndex: 10,
        height: "fit-content",
        gap: 0.4,
        padding: 1,
        boxShadow: "none",
      }}
    >
      <Stack direction="row" alignItems="center" padding={0}>
        <IconButton onClick={() => navigate("/home")}>
          <ArrowLeftIcon sx={{ color: "white" }} />
        </IconButton>
        <Typography color="white" fontSize="medium" fontFamily="Roboto">
          Controle de Propostas e Oportunidades
        </Typography>
      </Stack>

      <Toolbar
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          height: "fit-content",
          justifyContent: "start",
          flexWrap: "wrap", // Permite que o conteúdo quebre para uma nova linha
          width: "100%",
          gap: {
            xs: 4,
            sm: 3,
            md: 2,
            lg: 1,
          },
          overflowX: "auto", // Scroll horizontal automático
          "&::-webkit-scrollbar": {
            padding: "10px",
            width: "4px", // Largura da barra de rolagem
            height: "2px",
          },
          "&::-webkit-scrollbar-thumb": {
            height: "2px",
            backgroundColor: "white", // Cor da barra de rolagem
            borderRadius: "4px", // Bordas arredondadas
          },
          overflowY: "hidden", // Remove o scroll vertical
          padding: 1, // Remove possíveis espaçamentos extras
        }}
      >
        <Search
          sx={{
            maxWidth: {
              xs: 200,
              sm: 200,
              md: 250,
            },
            padding: 0.1,
            border: "0.5px solid #e3e3e3",
          }}
        >
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            onChange={(e) => handleGeneralSerarch(e)}
            placeholder="Buscar..."
            value={searchValue}
            inputProps={{ "aria-label": "search", height: 20 }}
          />
        </Search>

        <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
          {dateFiltersActive && (
            <>
              <Button
                onClick={(e) => handleSearchWithDateParams(e)}
                sx={BaseButtonStyles}
              >
                <Typography
                  fontSize="small"
                  fontFamily="Roboto"
                  fontWeight="semibold"
                >
                  Pesquisar
                </Typography>
              </Button>
              <Button onClick={handleCleanDateFilters} sx={BaseButtonStyles}>
                <Typography
                  fontSize="small"
                  fontFamily="Roboto"
                  fontWeight="semibold"
                >
                  Limpar Filtros
                </Typography>
              </Button>
            </>
          )}
          <IconButton
            onClick={toggleCreatingOpportunity}
            sx={buttonStylesMobile}
          >
            <AddIcon sx={{ color: "#2B3990" }} />
          </IconButton>
          {!dateFiltersActive && (
            <Tooltip title="Mostrar filtros">
              <IconButton 
                sx={buttonStylesMobile}
                onClick={() => setDateFiltersActive(!dateFiltersActive)}
              >
                <FilterAltIcon sx={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          )}
          <FormControlLabel
            control={
              <Checkbox
                onChange={handleChangeShowFinishedOpps}
                checkedIcon={<CheckBoxIcon sx={{ color: "white" }} />}
                sx={{
                  color: "white",
                  "& .Mui-checked": {
                    color: "white",
                  },
                }}
              />
            }
            label="Listar Finalizados"
          />
        </Stack>

        {dateFiltersActive && (
          <AnimatePresence>
            <motion.div
              key="filters"
              initial={{ opacity: 0, y: 0 }} // Início da animação
              animate={{ opacity: 1, y: 0 }} // Animação quando aparece
              exit={{ opacity: 0, y: -20 }} // Animação ao desaparecer
              transition={{ duration: 0.3 }} // Configuração de duração
            >
              <FormControl
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 1.5,
                  borderRadius: 0.5,
                  zIndex: 20,
                }}
              >
                {dateParams.map((dateFilter, index) => (
                  <Stack key={index}>
                    <Typography
                      fontSize="small"
                      fontFamily="Roboto"
                      fontWeight="semibold"
                    >
                      {dateFilter.label}
                    </Typography>
                    <TextField
                      key={index}
                      type="date"
                      size="small"
                      onChange={(e) => handleChangeDateFilters(e, dateFilter)}
                      InputProps={{
                        sx: {
                          borderRadius: 1,
                          height: 30,
                          backgroundColor: "white",
                          color: "black",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                            borderColor: "white",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid",
                            borderColor: "#8dc6ff",
                          },
                          maxWidth: 150,
                        },
                      }}
                      value={
                        dateFilter.isFromParam
                          ? dateFilters.find(
                              (filter) =>
                                filter.dateFilterKey === dateFilter.dataKey
                            )?.from
                          : dateFilters.find(
                              (filter) =>
                                filter.dateFilterKey === dateFilter.dataKey
                            )?.to
                      }
                    />
                  </Stack>
                ))}
                <Tooltip title="Fechar filtros">
                  <IconButton
                    onClick={() => setDateFiltersActive(!dateFiltersActive)}
                  >
                    <CloseIcon sx={{ color: "white" }} />
                  </IconButton>
                </Tooltip>
              </FormControl>
            </motion.div>
          </AnimatePresence>
        )}
      </Toolbar>

      <OpportunityModal />
    </AppBar>
  );
};

export default OpportunityTableSearchBar;

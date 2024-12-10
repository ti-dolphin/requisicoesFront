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
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import { useNavigate } from "react-router-dom";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { OpportunityInfoContext } from "../context/OpportunityInfoContext";
import React, { useContext } from "react";
import { defaultDateFilters } from "../context/OpportunityInfoContext";
import CreateOpportunityModal from "../modals/CreateOpportunityModal";
import AddIcon from "@mui/icons-material/Add";

const OpportunityTableSearchBar = () => {
  const {
    setFinishedOppsEnabled,
    dateFilters,
    setDateFilters,
    toggleRefreshOpportunityInfo,
    toggleCreatingOpportunity,
  } = useContext(OpportunityInfoContext);

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

  return (
    <AppBar
      sx={{
        position: "static",
        backgroundColor: "#2B3990",
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        zIndex: 10,
        height: "fit-content",
        gap: 1,
        alignItems: "start",
        padding: 1,
        overFlow: "scroll",
        boxShadow: "none",
      }}
    >
      <Stack direction="row" alignItems="center">
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
          alignItems: "start",
          justifyContente: "start",
          flexWrap: "wrap",
          width: "100%",
          gap: {
            xs: 4,
            sm: 4,
            md: 4,
            lg: 4,
          },

          overflowX: "scroll",
        }}
      >
        <Search
          sx={{
            maxWidth: {
              xs: 200,
              sm: 200,
              md: 250,
            },
            transform: "translate(0, 23px)",
            padding: 0.1,
            border: "0.5px solid #e3e3e3",
          }}
        >
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Buscar..."
            inputProps={{ "aria-label": "search", height: 20 }}
          />
        </Search>

        <Stack gap={1}>
          <FormControl
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
              borderRadius: 0.5,
            }}
          >
            {dateParams.map((dateFilter, index) => (
              <Stack gap={0.5}>
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
                      backgroundColor: "#e7eaf6",
                      color: "black",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                        borderColor: "white", // Cor da borda normal
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        border: "2px solid",
                        borderColor: "#8dc6ff", // Cor da borda no hover
                      },
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
          </FormControl>
          <Stack direction="row" gap={2} alignItems="center">
            <Button
              onClick={(e) => handleSearchWithDateParams(e)}
              sx={{
                color: "white",
                backgroundColor: "#F7941E",
                "&:hover": {
                  backgroundColor: "#f1b963",
                },
              }}
            >
              <Typography
                fontSize="small"
                fontFamily="Roboto"
                fontWeight="semibold"
              >
                Pesquisar
              </Typography>
            </Button>
            <Button
              onClick={handleCleanDateFilters}
              sx={{
                color: "white",
                backgroundColor: "#F7941E",
                "&:hover": {
                  backgroundColor: "#f1b963",
                },
              }}
            >
              <Typography
                fontSize="small"
                fontFamily="Roboto"
                fontWeight="semibold"
              >
                Limpar Filtros
              </Typography>
            </Button>
            <IconButton
              onClick={toggleCreatingOpportunity}
              sx={{
                backgroundColor: "#F7941E",
                color: "white",
                "&:hover": { backgroundColor: "#f1b963" },
              }}
            >
              <AddIcon sx={{ color: "#2B3990" }} />
            </IconButton>
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
        </Stack>
      </Toolbar>
      <CreateOpportunityModal />
    </AppBar>
  );
};

export default OpportunityTableSearchBar;

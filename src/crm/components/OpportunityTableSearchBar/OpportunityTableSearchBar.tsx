import {
  alpha,
  AppBar,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputBase,
  Stack,
  styled,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { OpportunityInfoContext } from "../../context/OpportunityInfoContext";
import React, { Dispatch, memo, SetStateAction, useCallback, useContext, useMemo, useState } from "react";
import { defaultDateFilters } from "../../context/OpportunityInfoContext";
import AddIcon from "@mui/icons-material/Add";
import { GridColDef } from "@mui/x-data-grid";
import { OpportunityInfo } from "../../types";
import { BaseButtonStyles, buttonStylesMobile } from "../../../utilStyles";
import TableViewToggleButton from "../../../components/TableViewToggleButton";
import { useNavigate } from "react-router-dom";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { styles } from "./OpportunityTableSearchBar.styles";
import OpportunityFilters from "../modals/OpportunityFilterModal/OpportunityFilters";

interface OpportunityTableSearchBarProps {
  columns: GridColDef<OpportunityInfo>[];
  allRows: OpportunityInfo[];
  setRows: React.Dispatch<React.SetStateAction<OpportunityInfo[]>>;
  setIsCardViewActive: Dispatch<SetStateAction<boolean>>;
  isCardViewActive: boolean;
}
const OpportunityTableSearchBar = memo(
  ({
    columns,
    allRows,
    setRows,
    isCardViewActive,
    setIsCardViewActive,
  }: OpportunityTableSearchBarProps) => {
    const navigate = useNavigate();
    const {
      setFinishedOppsEnabled,
      dateFilters,
      setDateFilters,
      toggleRefreshOpportunityInfo,
      toggleCreatingOpportunity,
    } = useContext(OpportunityInfoContext);
    const [dateFiltersActive, setDateFiltersActive] = useState(false);

    const setRowsMemo = useCallback(
      (newRows: OpportunityInfo[]) => setRows(newRows),
      [setRows]
    );
    const columnsMemo = useMemo(() => columns, [columns]);
    const allRowsMemo = useMemo(() => allRows, [allRows]);

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
        paddingLeft: `calc(1em + ${theme.spacing(4)})`
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

    const handleChangeShowFinishedOpps = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const { checked } = e.target;
      setFinishedOppsEnabled(checked);
    };

    const handleSearchWithDateParams = (
      _e: React.MouseEvent<HTMLButtonElement>
    ) => {
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

      let changedDateFitlers = [];
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
   
      setDateFilters(changedDateFitlers);
    };

    const handleCleanDateFilters = () => {
      setDateFilters(defaultDateFilters);
      toggleRefreshOpportunityInfo();
    };

    const handleGeneralSearch = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const value = e.target.value.toLowerCase();
      const newFilteredRows = allRowsMemo.filter((row) =>
        columnsMemo.some((column) => {
          const cellValue = row[column.field as keyof OpportunityInfo];
          return cellValue && String(cellValue).toLowerCase().includes(value);
        })
      );
      setRowsMemo(newFilteredRows);
    };
    return (
      <AppBar sx={styles.appBar}>
        <Stack>
          <Stack sx={styles.stack}>
            <IconButton onClick={() => navigate("/home")}>
              <ArrowLeftIcon sx={{ color: "white" }} />
            </IconButton>
            <Typography color="white" fontSize="medium" fontFamily="Roboto">
              Controle de Propostas e Oportunidades
            </Typography>
          </Stack>

          <Toolbar sx={styles.toolbar}>
            <Search sx={styles.search}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                onChange={handleGeneralSearch}
                placeholder="Buscar..."
                inputProps={{
                  "aria-label": "search",
                  height: 20,
                  width: 100,
                }}
              />
            </Search>

            <Stack sx={styles.stackButtons}>
              {dateFiltersActive && (
                <>
                  <Button
                    onClick={handleSearchWithDateParams}
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
                  <Button
                    onClick={handleCleanDateFilters}
                    sx={BaseButtonStyles}
                  >
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
                    <DateRangeIcon sx={{ color: "white" }} />
                  </IconButton>
                </Tooltip>
              )}
              <TableViewToggleButton
                isCardViewActive={isCardViewActive}
                setIsCardViewActive={setIsCardViewActive}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    onChange={handleChangeShowFinishedOpps}
                    checkedIcon={<CheckBoxIcon sx={{ color: "white" }} />}
                    sx={styles.checkbox}
                  />
                }
                label="Listar Finalizados"
              />
            </Stack>
          </Toolbar>
        </Stack>

        <OpportunityFilters
          columns={columns}
          allRows={allRows}
          setRows={setRows}
          dateFiltersActive={dateFiltersActive}
          dateFilters={dateFilters}
          handleChangeDateFilters={handleChangeDateFilters}
          dateParams={dateParams}
          setDateFiltersActive={setDateFiltersActive}
        />
      </AppBar>
    );
  }
);
OpportunityTableSearchBar.displayName = "OpportunityTableSearchBar";

export default OpportunityTableSearchBar;

import {
  AppBar,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import { OpportunityInfoContext } from "../../context/OpportunityInfoContext";
import React, { Dispatch, memo, SetStateAction,  useContext, useState } from "react";
import { defaultDateFilters } from "../../context/OpportunityInfoContext";
import AddIcon from "@mui/icons-material/Add";
import { GridColDef } from "@mui/x-data-grid";
import { OpportunityInfo } from "../../types";
import { BaseButtonStyles, buttonStylesMobile } from "../../../utilStyles";
import TableViewToggleButton from "../../../components/TableViewToggleButton";
import { useNavigate } from "react-router-dom";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { styles } from "./OpportunityTableSearchBar.styles";
import OpportunityFilters from "../modals/OpportuntiyFilters/OpportunityFilters";

interface OpportunityTableSearchBarProps {
  columns: GridColDef<OpportunityInfo>[];
  rows: OpportunityInfo[];
  allRows: OpportunityInfo[];
  setRows: React.Dispatch<React.SetStateAction<OpportunityInfo[]>>;
  setIsCardViewActive: Dispatch<SetStateAction<boolean>>;
  isCardViewActive: boolean;
  calculateLayoutProps: (registerCount: number) => void;
}
const OpportunityTableSearchBar = memo(
  ({
    columns,
    allRows,
    setRows,
    isCardViewActive,
    setIsCardViewActive,
    calculateLayoutProps
  }: OpportunityTableSearchBarProps) => {
    const navigate = useNavigate();
    const {
      dateFilters,
      setDateFilters,
      toggleRefreshOpportunityInfo,
      toggleCreatingOpportunity,
    } = useContext(OpportunityInfoContext);
    const [dateFiltersActive, setDateFiltersActive] = useState(false);
   

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
          calculateLayoutProps={calculateLayoutProps}
        />
      </AppBar>
    );
  }
);

OpportunityTableSearchBar.displayName = "OpportunityTableSearchBar";

export default OpportunityTableSearchBar;

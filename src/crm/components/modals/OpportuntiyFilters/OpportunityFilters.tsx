import React, { useCallback, useEffect, useState } from "react";
import {
  Client,
  DateFilter,
  OpportunityInfo,
  OpportunityOptionField,
  Status,
} from "../../../types";
import { alpha, Box, Checkbox, FormControl, FormControlLabel, IconButton, InputBase, Stack, styled, TextField, Tooltip } from "@mui/material";
import styles from "./OpportunityFilters.styles";
import { GridColDef } from "@mui/x-data-grid";
import { fetchAllClients, fetchManagers, fetchSalers, fetchStatusList } from "../../../utils";
import typographyStyles from "../../../../Requisitions/utilStyles";
import { AnimatePresence, motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {debounce} from 'lodash';
import FilterField from "../../FilterField/FilterField";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

interface props {
  allRows: OpportunityInfo[];
  setRows: React.Dispatch<React.SetStateAction<OpportunityInfo[]>>;
  columns: GridColDef<OpportunityInfo>[];
  dateFiltersActive: boolean;
  dateFilters: DateFilter[];
  handleChangeDateFilters: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dateFilterReceived: {
      dataKey: string;
      label: string;
      isFromParam: boolean;
    }
  ) => void;
  dateParams: {
    dataKey: string;
    label: string;
    isFromParam: boolean;
  }[];
  setDateFiltersActive: React.Dispatch<React.SetStateAction<boolean>>;
  calculateLayoutProps: (registerCount: number) => void;
  handleChangeShowFinishedOpps: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

const createFilters = (columns: GridColDef<OpportunityInfo>[]) => {
  return columns.reduce((acc: { [key: string]: any }, column) => {
    acc[column.field] = {
      label: column.headerName,
      dataKey: column.field,
      values: [], // Inicialmente vazio
    };

    return acc
  }, {});
};

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
     color: 'black'
   },
 }));

const OpportunityFilters = ({
  columns,
  allRows,
  setRows,
  dateFiltersActive,
  handleChangeDateFilters,
  dateParams,
  dateFilters,
  setDateFiltersActive,
  calculateLayoutProps,
  handleChangeShowFinishedOpps,
}: props) => {
  const filteredColumns = columns.filter((column) => {
    if (
      column.field !== "dataSolicitacao" &&
      column.field !== "dataFechamento" &&
      column.field !== "dataInteracao" &&
      column.field !== "dataInicio" &&
      column.field !== "valorFaturamentoDolphin" &&
      column.field !== "valorFaturamentoDireto" &&
      column.field !== "valorTotal"
    ) {
      return true;
    }
    return false;
  });

  const [filters, setFilters] = React.useState<any>(
    createFilters(filteredColumns)
  );

  const [clientOptions, setClientOptions] = useState<OpportunityOptionField[]>(
    []
  );
  const [responsableOptions, setResponsableOptions] = useState<any>();

  const [managerOptions, setManagerOptions] = useState<any>();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchManagerOptions = async () => {
    const managers = await fetchManagers();
    if (managers) {
      const options = managers.map((manager: any) => ({
        label: manager.NOME,
        id: manager.CODPESSOA,
        object: "manager",
        key: manager.CODPESSOA,
      }));
      setManagerOptions(options);
    }
  };

  const fetchSalerOps = useCallback(async () => {
    const salers = await fetchSalers(0);
    const options = salers.map((saler: any) => ({
      label: saler.NOME,
      id: saler.CODPESSOA,
      object: "saler",
      key: saler.CODPESSOA,
    }));
    setResponsableOptions(options);
  }, []);

  const fetchClientOps = useCallback(async () => {
    const clients = await fetchAllClients(0);
    const options = clients.map((client: Client) => ({
      label: client.NOMEFANTASIA,
      id: client.CODCLIENTE,
      object: "client",
      key: client.CODCLIENTE,
    }));

    setClientOptions(options);
  }, [setClientOptions]);

  const [statusOptions, setStatusOptions] = useState<OpportunityOptionField[]>(
    []
  );
  const fetchStatusOps = useCallback(async () => {
    const statusList = await fetchStatusList();
    const options =
      statusList.map((status: Status) => ({
        label: status.NOME,
        id: status.CODSTATUS,
        object: "status",
        key: status.CODSTATUS,
      })) || [];
    setStatusOptions(options);
  }, [setStatusOptions]);

  const updateFilterValues = (dataKey: string, values: string[]) => {
    setFilters((prevFilters: any) => ({
      ...prevFilters,
      [dataKey]: {
        ...prevFilters[dataKey],
        values,
      },
    }));

    filterRows(
      {
        ...filters,
        [dataKey]: {
          ...filters[dataKey],
          values,
        },
      },
      searchTerm
    );
  };

  const filterRows = (currentFilters: any, valueReceived?: string) => {
    console.log("filterRows");
    const composedFilteredRow: OpportunityInfo[] = [];
    const filterKeys = Object.keys(currentFilters);
    allRows.forEach((opportunity) => {
      let shouldInclude = true; // Assume que a linha deve ser incluída inicialmente
      for (let dataKey of filterKeys) {
        const filterValues = currentFilters[dataKey].values;
        if (filterValues.length > 0) {
          const oppIncludesValue = filterValues.some((filterValue: any) => {
            const searchTerm = String(filterValue).toUpperCase();
            return opportunity[dataKey as keyof OpportunityInfo]
              ?.toString()
              .toUpperCase()
              .includes(searchTerm);
          });
          if (!oppIncludesValue) {
            shouldInclude = false;
            break;
          }
        }
      }
      if (shouldInclude) {
        composedFilteredRow.push(opportunity);
      }
    });

    if (valueReceived) {
      const filteredRows = composedFilteredRow.filter((row: OpportunityInfo) =>
        columns.some((column) => {
          const cellValue = row[column.field as keyof OpportunityInfo];
          return (
            cellValue && String(cellValue).toLowerCase().includes(searchTerm)
          );
        })
      );
      calculateLayoutProps(filteredRows.length);
      setRows(filteredRows);
      return;
    }
    const filteredRows = composedFilteredRow.filter((row: OpportunityInfo) =>
      columns.some((column) => {
        const cellValue = row[column.field as keyof OpportunityInfo];
        return (
          (cellValue && String(cellValue).toLowerCase().includes(searchTerm)) ||
          !searchTerm ||
          !valueReceived
        );
      })
    );
    calculateLayoutProps(filteredRows.length);
    setRows(filteredRows);
    return filteredRows;
  };

  const debouncedSearch = debounce((value: string, filters: any) => {
    filterRows(filters, value);
  }, 400); // 300ms de atraso

  const handleGeneralSearch = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    debouncedSearch(value, filters);
  };

  useEffect(() => {
    fetchStatusOps();
    fetchClientOps();
    fetchSalerOps();
    fetchManagerOptions();
    filterRows(filters, searchTerm);
  }, [allRows]);

  return (
    <Box sx={styles.mainContainer}>
      <Search sx={styles.search}>
        <SearchIconWrapper>
          <SearchIcon sx={{ color: "black" }} />
        </SearchIconWrapper>
        <StyledInputBase
          onChange={handleGeneralSearch}
          placeholder="Buscar..."
          value={searchTerm}
          autoFocus
          inputProps={{
            "aria-label": "search",
            height: 20,
            width: 100,
          }}
        />
      </Search>
      <Box sx={styles.container}>
        {statusOptions &&
          responsableOptions &&
          clientOptions &&
          Object.values(filters).map((filter: any) => (
            <Box key={filter.dataKey}>
              {
                <FilterField
                  filter={filter}
                  updateFilterValues={updateFilterValues}
                  clientOptions={clientOptions}
                  responsableOptions={responsableOptions}
                  statusOptions={statusOptions}
                  managerOptions={managerOptions}
                  styles={styles}
                  filters={filters}
                />
              }
            </Box>
          ))}
        <FormControlLabel
        sx={{color: 'black'}}
          control={
            <Checkbox
              onChange={handleChangeShowFinishedOpps}
              checkedIcon={<CheckBoxIcon sx={{ color: "black" }} />}
              
            />
          }
          
          label="Listar Finalizados"
        />
      </Box>
      {dateFiltersActive && (
        <AnimatePresence>
          <motion.div
            key="filters"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FormControl sx={styles.formControl}>
              {dateParams.map((dateFilter, index) => (
                <Stack key={index}>
                  <TextField
                    key={index}
                    type="date"
                    size="small"
                    onChange={(e) => handleChangeDateFilters(e, dateFilter)}
                    InputProps={{ sx: typographyStyles.smallText }}
                    label={dateFilter.label}
                    InputLabelProps={{
                      shrink: true,
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
                  <CloseIcon sx={{ color: "red" }} />
                </IconButton>
              </Tooltip>
            </FormControl>
          </motion.div>
        </AnimatePresence>
      )}
    </Box>
  );
};

export default OpportunityFilters;

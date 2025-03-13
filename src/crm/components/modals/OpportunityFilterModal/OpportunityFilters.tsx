import React, { useCallback, useEffect, useState } from "react";
import {
  Client,
  DateFilter,
  OpportunityInfo,
  OpportunityOptionField,
  Status,
} from "../../../types";
import { Autocomplete, Box, Checkbox, Chip, FormControl, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import styles from "./OpportunityFilters.styles";
import { GridColDef } from "@mui/x-data-grid";
import { fetchAllClients, fetchManagers, fetchSalers, fetchStatusList } from "../../../utils";
import typographyStyles from "../../../../Requisitions/utilStyles";
import { AnimatePresence, motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";

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

const OpportunityFilters = ({
  columns,
  allRows,
  setRows,
  dateFiltersActive,
  handleChangeDateFilters,
  dateParams,
  dateFilters,
  setDateFiltersActive
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


  const fetchManagerOptions = async ( ) => { 
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
  }

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
    console.log({ clientOptions: options });

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
    console.log({
      ...filters,
      [dataKey]: {
        ...filters[dataKey],
        values,
      },
    });
    filterRows({
      ...filters,
      [dataKey]: {
        ...filters[dataKey],
        values,
      },
    });
  };

  const filterRows = (currentFilters: any) => {
    console.log({ currentFilters });
    const filteredRows: OpportunityInfo[] = [];
    const filterKeys = Object.keys(currentFilters);
    allRows.forEach((opportunity) => {
      let shouldInclude = true; // Assume que a linha deve ser incluída inicialmente
      for (let dataKey of filterKeys) {
        const filterValues = currentFilters[dataKey].values;
        // Se houver valores no filtro, verifica se a linha atende a pelo menos um deles
        if (filterValues.length > 0) {
          const oppIncludesValue = filterValues.some((filterValue: any) => {
            const searchTerm = String(filterValue).toUpperCase();
            return opportunity[dataKey as keyof OpportunityInfo]
              ?.toString()
              .toUpperCase()
              .includes(searchTerm);
          });
          // Se a linha não atender a nenhum valor do filtro atual, não deve ser incluída
          if (!oppIncludesValue) {
            shouldInclude = false;
            break; // Sai do loop interno, pois a linha já não atende a um dos filtros
          }
        }
      }
      // Se a linha atender a todos os filtros, adiciona ao array de linhas filtradas
      if (shouldInclude) {
        filteredRows.push(opportunity);
      }
    });

    console.log({ filteredRows });
    setRows(filteredRows);
  };

  const renderFilterField = (filter: any) => {
    const { dataKey, label } = filter;

    // Campos com opções (Autocomplete com Checkboxes)
    if (
      dataKey === "nomeCliente" ||
      dataKey === "nomeVendedor" ||
      dataKey === "nomeStatus" ||
      dataKey === 'nomeGerente'
    ) {
      const options =
        dataKey === "nomeCliente"
          ? clientOptions
          : dataKey === "nomeVendedor"
          ? responsableOptions
          : dataKey === 'nomeStatus' ? statusOptions 
          : managerOptions
          console.log({managerOptions});
      if(options){ 
 return (
   <Autocomplete
     key={dataKey}
     multiple
     options={options}
     disableCloseOnSelect
     getOptionKey={(option: any) => option.id}
     getOptionLabel={(option) => option.label}
     renderTags={(optionArray: any, getTagProps) =>
       optionArray.map((option: any, index: number) => {
         const { key, ...tagProps } = getTagProps({ index });
         return (
           <Chip
             variant="outlined"
             label={option.label}
             key={key}
             {...tagProps}
             sx={{ display: "none" }}
           />
         );
       })
     }
     renderOption={(props, option, { selected }) => (
       <Box>
         <li {...props}>
           <Checkbox style={{ marginRight: 8 }} checked={selected} />
           <Typography sx={typographyStyles.smallText}>
             {option.label}
           </Typography>
         </li>
       </Box>
     )}
     value={options.filter((option: any) =>
       filters[dataKey].values.includes(option.label)
     )}
     onChange={(_, newValue) => {
       updateFilterValues(
         dataKey,
         newValue.map((option) => option.label)
       );
     }}
     renderInput={(params) => (
       <TextField
         {...params}
         InputLabelProps={{ shrink: true, sx: { color: "black" } }}
         sx={{
           "& .MuiOutlinedInput-root": {
             padding: 0.5,
           },
         }}
         InputProps={{
           ...params.InputProps,
           sx: styles.input,
         }}
         label={label}
       />
     )}
   />
 );
      }
     
    }
    return (
      <TextField
        key={dataKey}
        label={label}
        value={filters[dataKey].values.join(", ")} // Exibe os valores como texto
        onChange={(e) =>
          updateFilterValues(dataKey, e.target.value.split(", "))
        }
        fullWidth
        InputLabelProps={{
          shrink: true,
          sx: {
            color: "black",
          },
        }}
        InputProps={{ sx: styles.input }}
      />
    );
  };

  useEffect(() => {
    fetchStatusOps();
    fetchClientOps();
    fetchSalerOps();
    fetchManagerOptions();
    filterRows(filters);
  }, [allRows]);

  return (
    <Box sx={styles.mainContainer}>
      <Box sx={styles.container}>
        {statusOptions &&
          responsableOptions &&
          clientOptions &&
          Object.values(filters).map((filter: any) => (
            <Box key={filter.dataKey}>{renderFilterField(filter)}</Box>
          ))}
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

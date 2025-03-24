import { Autocomplete, Chip, Box, Checkbox, Typography, TextField } from "@mui/material";
import typographyStyles from "../../../Requisitions/utilStyles";
import { OpportunityOptionField } from "../../types";

interface props {
  filter: any;
  updateFilterValues: (dataKey: string, values: string[]) => void;
  clientOptions: OpportunityOptionField[];
  responsableOptions: any;
  statusOptions: OpportunityOptionField[];
  managerOptions: any;
  styles :any;
  filters: any;
}

const FilterField = ({
  filter,
  updateFilterValues,
  clientOptions,
  responsableOptions,
  statusOptions,
  managerOptions,
  styles,
  filters
}: props) => {
  const { dataKey, label } = filter;

  // Campos com opções (Autocomplete com Checkboxes)
  if (
    dataKey === "nomeCliente" ||
    dataKey === "nomeVendedor" ||
    dataKey === "nomeStatus" ||
    dataKey === "nomeGerente"
  ) {
    const options =
      dataKey === "nomeCliente"
        ? clientOptions
        : dataKey === "nomeVendedor"
        ? responsableOptions
        : dataKey === "nomeStatus"
        ? statusOptions
        : managerOptions;
    if (options) {
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
                sx: {
                  ...styles.input,
                  borderRadius: 1
                },
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
      onChange={(e) => updateFilterValues(dataKey, e.target.value.split(", "))}
      fullWidth
      InputLabelProps={{
        shrink: true,
        sx: {
          color: "black",
        },
      }}
      InputProps={{ sx: { 
        ...styles.input,
        borderRadius: 1
      } }}
    />
  );
};
export default FilterField;

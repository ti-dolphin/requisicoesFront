import { Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';

import styles from './RequisitionFields.styles';
import typographyStyles from '../../utilStyles';
import { Option } from "../../types";
import { AnimatePresence, motion } from "framer-motion";
import { alertAnimation, BaseButtonStyles } from "../../../utilStyles";
import Alert, { AlertColor } from "@mui/material/Alert";
import { useRequisitionFields } from "./hooks";
import RequisitionFileList from '../RequisitionFileList/RequisitionFileList';
import { formatDate } from '../../../generalUtilities';
import { green, red } from '@mui/material/colors';
const fields = [
  { label: "Observação", key: "OBSERVACAO" , type: 'text', autoComplete: false},
];

const RequisitionFields = () => {
  const {
    isEditing,
    requisitionData,
    optionsState,
    alert,
    handleChangeAutoComplete,
    handleChangeTextField,
    renderAutoCompleteValue,
    renderOptions,
    handleSave,
    handleFocus,
    handleCancelEditing,
    renderValue,
  } = useRequisitionFields();

  return (
    <Box sx={styles.fieldsGridContainer}>
      <Stack direction="column" gap={2} alignItems="start">
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            gap: 1,
            width: "100%",
            flexDirection: {
              xs: "column",
              md: "row",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              minWidth: 300,
              flexGrow: 1,
              flexDirection: "column",
              padding: 1,
              gap: 1,
              border: "1px solid #ccc",
              borderRadius: 2,
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              sx={{ ...typographyStyles.bodyText, fontWeight: "bold" }}
            >
              Detalhes da requisição
            </Typography>
            {requisitionData && (
              <Stack gap={0.5}>
                <Typography sx={typographyStyles.bodyText}>
                  <strong className="text-gray-500">Criada:</strong>{" "}
                  {formatDate(requisitionData.data_criacao)}
                </Typography>
                <Typography sx={typographyStyles.bodyText}>
                  <strong className="text-gray-500">Atualizada:</strong>{" "}
                  {formatDate(requisitionData.data_alteracao)}
                </Typography>
                <Typography sx={typographyStyles.bodyText}>
                  <strong className="text-gray-500">Requisitante:</strong>{" "}
                  {requisitionData.responsavel_pessoa?.NOME}
                </Typography>
                <Typography sx={typographyStyles.bodyText}>
                  <strong className="text-gray-500">Tipo:</strong>{" "}
                  {requisitionData.typeOption?.label}
                </Typography>
              </Stack>
            )}
          </Box>
          {requisitionData && (
            <RequisitionFileList
              requisitionId={requisitionData.ID_REQUISICAO}
            />
          )}
        </Box>
      </Stack>
      {requisitionData && optionsState && (
        <Box sx={styles.fieldsGrid}>
          {fields.map((field) => {
            if (field.autoComplete) {
              return (
                <Autocomplete
                  onFocus={handleFocus}
                  key={field.key}
                  getOptionLabel={(option: Option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(
                    event: React.SyntheticEvent,
                    value: Option | null
                  ) => handleChangeAutoComplete(event, value, field)}
                  disablePortal
                  sx={styles.autoComplete}
                  options={renderOptions(field)}
                  value={renderAutoCompleteValue(field)}
                  renderInput={(params) => (
                    <TextField {...params} label={field.label} />
                  )}
                />
              );
            }
            return (
              <TextField
                key={field.key}
                label={field.label}
                sx={{
                  gridColumn: {
                    xs: "span 2",
                  },
                }}
                multiline
                value={renderValue(field)}
                onFocus={handleFocus}
                onChange={(e) => handleChangeTextField(e, field)}
              ></TextField>
            );
          })}
        </Box>
      )}
      <AnimatePresence>
        {isEditing && (
          <motion.div {...alertAnimation}>
            <Stack direction="row" sx={styles.actionsStack}>
              <Button
                onClick={handleSave}
                sx={{ 
                  ...BaseButtonStyles,
                  backgroundColor: green[700],
                  "&:hover": { backgroundColor: green[500] },
                }}
                className="shadow-md"
              >
                Salvar Alterações
              </Button>
         
              <Button
                onClick={handleCancelEditing}
                sx={{
                  ...BaseButtonStyles,
                  backgroundColor: red[700],
                  "&:hover": { backgroundColor: red[600] },
                }}
                className="shadow-md"
              >
                Cancelar edição
              </Button>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alert && (
          <motion.div {...alertAnimation}>
            <Alert severity={alert.severity as AlertColor}>
              {alert.message}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default RequisitionFields;
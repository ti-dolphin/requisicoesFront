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
const fields = [
  { label: "Descrição", key: "DESCRIPTION", type: "text", autoComplete: false },
  { label: "Observação", key: "OBSERVACAO", type: "text", autoComplete: false },
  {
    label: "Responsável",
    key: "responsableOption",
    optionName: "responsableOptions",
    type: "text",
    autoComplete: true,
  },
  {
    label: "Projeto",
    key: "projectOption",
    optionName: "projectOptions",
    type: "text",
    autoComplete: true,
  },
  {
    label: "Tipo",
    key: "typeOption",
    optionName: "typeOptions",
    type: "text",
    autoComplete: true,
  },
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
        
       <Box sx={{display: 'flex', flexGrow: 1, gap: 1, width: '100%', flexDirection: { 
        xs: 'column',
        md: 'row'
       }}}>
          <Box sx={{ display: 'flex', minWidth: 300, flexGrow: 1, flexDirection: 'column', padding: 1, gap: 1, borderRadius: 2 }}>
            <Typography sx={typographyStyles.bodyText}>
              Detalhes da requisição
            </Typography>
            {requisitionData && (
              <Typography sx={typographyStyles.bodyText}>
                Ultima atualização:{" "}
                {formatDate(requisitionData?.data_alteracao)}
              </Typography>
            )}
            {requisitionData && (
              <Typography sx={typographyStyles.bodyText}>
                Criada em:{" "}
                {formatDate(requisitionData?.data_criacao)}
              </Typography>
            )}
           </Box>
          {requisitionData && <RequisitionFileList requisitionId={requisitionData.ID_REQUISICAO} />}
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
                  getOptionLabel={(option: Option) => option.label} // Certifique-se de usar a propriedade 'label'
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  } // Comparação correta
                  onChange={(
                    event: React.SyntheticEvent,
                    value: Option | null
                  ) => handleChangeAutoComplete(event, value, field)}
                  disablePortal
                  sx={styles.autoComplete}
                  options={renderOptions(field)} // Deve retornar um array de objetos 'Option'
                  value={renderAutoCompleteValue(field)} // Deve ser um objeto 'Option' ou null
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
                    md: "span 1",
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
                sx={BaseButtonStyles}
                className="shadow-md"
              >
                Salvar Alterações
              </Button>
              <Button
                onClick={handleCancelEditing}
                sx={BaseButtonStyles}
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
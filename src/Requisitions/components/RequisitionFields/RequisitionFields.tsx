import { Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';
import {  fetchRequsitionById, Requisition, updateRequisition } from '../../utils';
import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import styles from './RequisitionFields.styles';
import typographyStyles from '../../utilStyles';
import { userContext } from '../../context/userContext';
import { dateTimeRenderer } from '../../../Patrimony/utils';
import { AlertInterface, Option, OptionsState } from '../../types';
import { AnimatePresence, motion } from 'framer-motion';
import { alertAnimation, BaseButtonStyles } from '../../../utilStyles';
import Alert, { AlertColor } from '@mui/material/Alert';
const fields = [
  { label: "Descrição", key: "DESCRIPTION", type: 'text', autoComplete: false },
  { label: "Observação", key: "OBSERVACAO", type: 'text', autoComplete: false },
   { label: "Responsável", key: "responsableOption", optionName: 'responsableOptions', type: 'text', autoComplete: true },
  { label: 'Projeto', key: 'projectOption', optionName: 'projectOptions', type: 'text', autoComplete: true },
  { label: 'Tipo', key: 'typeOption', optionName: 'typeOptions', type: 'text', autoComplete: true, },

];

const RequisitionFields = () => {

  const { id } = useParams();
  const { user } = useContext(userContext);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [requisitionData, setRequisitionData] = useState<Requisition>();
  const [optionsState, setOptionsState] = useState<OptionsState>();
  const [alert, setAlert] = useState<AlertInterface>();

  const fetchRequisitionData = async () => {
    const data = await fetchRequsitionById(Number(id));
    if (data) {
      setRequisitionData({ ...data });
      setOptionsState({
        projectOption: data.projectOption,
        responsableOption: data.responsableOption,
        typeOption: data.typeOption,
        projectOptions: data.projectOptions,
        responsableOptions: data.responsableOptions,
        typeOptions : data.typeOptions
      })
    }
  };

  const userAllowedToEdit = () => {
    if (requisitionData?.STATUS === 'Em edição') {
      return (user?.PERM_COMPRADOR || user?.CODPESSOA === requisitionData?.ID_RESPONSAVEL);
    }
    return user?.PERM_COMPRADOR;
  }

  const displayAlert = async (severety : string, message: string ) => { 
      setTimeout(() => { 
        setAlert(undefined);
      }, 3000);
      setAlert({ severety, message });
      return;
  } 

  const renderValue = (field: any) => {
    if (field.type === 'date' && requisitionData) {
      return dateTimeRenderer(requisitionData[field.key as keyof Requisition] as string);
    }
    if (field.autocomplete) {
      return "autocomplete"
    }
    return requisitionData && requisitionData[field.key as keyof Requisition]
  }

  const handleChangeAutoComplete = (e: any, value: any, field: any) => {
    console.log(e)
    if (requisitionData) {
      if (field.key === 'projectOption') {
        setOptionsState({
          ...optionsState,
          projectOption : value
        })
        setRequisitionData({
          ...requisitionData,
          ID_PROJETO: value.id
        });
      
        return
      }
      if (field.key === 'typeOption') {
        setOptionsState({
          ...optionsState,
          typeOption: value
        })
        setRequisitionData({
          ...requisitionData,
          TIPO: value.id
        });
        
        return;
      }
      if (field.key === 'responsableOption') {
        setOptionsState({
          ...optionsState,
          responsableOption: value
        })
        setRequisitionData({
          ...requisitionData,
          ID_RESPONSAVEL: value.id
        });
       
        return;
      }
    }
  }

  const handleChangeTextField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field : any ) =>  {
      const { value  } = e.target;
      if(requisitionData){ 
        console.log({
          ...requisitionData,
          [field.key]: value
        })
        setRequisitionData({
          ...requisitionData,
          [field.key]: value
        });
      }
  }

  const renderAutoCompleteValue = (field: any) => {
    const value : Option | undefined = optionsState && optionsState[field.key as keyof OptionsState] as Option;
    if(value) return value; 
  }

  const renderOptions = (field : any )=>  { 
   if(optionsState){ 
     const options = optionsState[field.optionName as keyof OptionsState] as Option[];
     return options;
   }
   return [{label: 'Sem opções', id: 0}];
  }

  const handleSave = async ( ) =>  {
    if (requisitionData && user) {
      console.log('requisitionData: ',requisitionData);
      setIsEditing(false)
       try {
         const response = await updateRequisition(user?.CODPESSOA, requisitionData );
         if (response.status === 200) { 
           displayAlert('success', 'Requsição atualizada com sucesso!')
         }
       }catch(e : any){
          displayAlert('warning', e.message);
       }
    }
  }

  const handleFocus = async (e: React.FocusEvent<HTMLInputElement | HTMLDivElement | HTMLTextAreaElement> ) => { 
    const {target} = e;
    console.log({target});
    if(userAllowedToEdit()){
      setIsEditing(true);
      return;
    }
    await  displayAlert('warning', 'Não é permitido editar a requisição');
    target.blur();
  }
  const handleCancelEditing = ( ) =>  {
    setIsEditing(false);
    fetchRequisitionData();
  }

  useEffect(() => {
    fetchRequisitionData()
  }, []);

  return (
    <Box sx={styles.fieldsGridContainer}>
      <Stack direction="row" gap={2} alignItems="center">
        <Typography sx={typographyStyles.heading1}>Detalhes da requisição</Typography>
        <Typography sx={typographyStyles.heading2}>
          Ultima atualização: {dateTimeRenderer(requisitionData?.LAST_UPDATE_ON)} 
        </Typography>
         /
        <Typography sx={typographyStyles.heading2}>
          Criada em: {dateTimeRenderer(requisitionData?.CREATED_ON)}
        </Typography>
      </Stack>
      {
        requisitionData && optionsState && (
          <Box sx={styles.fieldsGrid}>
            {fields.map((field) => {
              if (field.autoComplete) {
                return (
                  <Autocomplete
                    onFocus={handleFocus}
                    // onBlur={() => setIsEditing(false)}
                    key={field.key}
                    getOptionKey={(option: {
                      label: string;
                      id: number;
                    }) => option.id}
                    onChange={(event: React.SyntheticEvent, value: Option | null) => handleChangeAutoComplete(event, value, field)}
                    disablePortal
                    sx={styles.autoComplete}
                    options={renderOptions(field)}
                    value={renderAutoCompleteValue(field)}                
                    renderInput={(params) => <TextField {...params} label={field.label} />}
                  />
                )
              }
              return (
                <TextField
                  key={field.key}
                  label={field.label}
                  multiline
                  value={renderValue(field)}
                  onFocus={handleFocus}
                  onChange={(e ) => handleChangeTextField(e, field)}
                  // onBlur={() => setIsEditing(false)}
                >
                </TextField>
              )
            })}
          </Box>
        )
      }
      <AnimatePresence>
        {isEditing && (
          <motion.div {...alertAnimation}>
            <Stack direction="row" sx={styles.actionsStack}>
              <Button onClick={handleSave} sx={BaseButtonStyles} className="shadow-md">
                Salvar Alterações
              </Button>
              <Button onClick={handleCancelEditing} sx={BaseButtonStyles} className="shadow-md">
                Cancelar edição
              </Button>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alert && (
          <motion.div {...alertAnimation}>
            <Alert severity={alert.severety as AlertColor}>{alert.message}</Alert>
          </motion.div>
        )}
      </AnimatePresence>

    </Box>
  )
}

export default RequisitionFields
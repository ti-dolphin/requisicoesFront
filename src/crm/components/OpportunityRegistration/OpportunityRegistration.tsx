import React, { MutableRefObject, useCallback, useContext, useEffect, useState } from 'react'
import { Client, Field, Guide, OpportunityOptionField, Status } from '../../types'
import { Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, Box, TextField } from '@mui/material'
import { Project } from '../../../Requisitions/types'
import { fetchProjectOptionsByUser } from '../../../Requisitions/utils'
import { fetchAllClients, fetchClientFromFirstProjectOption, fetchStatusList } from '../../utils'
import { styles } from './OpportunityRegistration.styles'
import { userContext } from '../../../Requisitions/context/userContext'

interface props {
    guide: Guide
    guidesReference: MutableRefObject<Guide[] | undefined>
}

interface OpportunityRegistrationFields {
    idProjeto: number;
    numeroAdicional: number;
    nome: string;
    codStatus: number;
    fkCodCliente: number;
    dataSolicitacao: Date;
    dataInicio: Date;
    dataEntrega: Date;
}

const OpportunityRegistration = ({ guide, guidesReference }: props) => {
    const {user } = useContext(userContext);

    const [statusOptions, setStatusOptions] = useState<OpportunityOptionField[]>(
        []
    );
    const [clientOptions, setClientOptions] = useState<OpportunityOptionField[]>(
        []
    );
    const [projectOptions, setProjectOptions] = useState<
        OpportunityOptionField[]
    >([]);
    const [isEditing, setIseEditing] = useState<boolean>(false);

    const [opportunityRegistration, setOpportunityRegistration] = useState<OpportunityRegistrationFields>({
            idProjeto: guide.fields[0].data,
            numeroAdicional: guide.fields[1].data,
            nome: guide.fields[2].data,
            codStatus: guide.fields[3].data,
            fkCodCliente: guide.fields[4].data,
            dataSolicitacao: guide.fields[5].data,
            dataInicio: guide.fields[6].data,
            dataEntrega: guide.fields[7].data,
        });

    const renderOptions = (column: {
        label: string;
        dataKey: string;
        autoComplete?: boolean;
    }) => {
        if (column.dataKey === "idProjeto") return projectOptions;
        if (column.dataKey === "codStatus") return statusOptions;
        if (column.dataKey === "fkCodCliente") return clientOptions;
    };

    const changeReference = (field: Field ) => { 
        if(guidesReference.current){
            const guideIndex = guidesReference.current.indexOf(guide);
            const fieldIndex = guidesReference.current[guideIndex].fields.findIndex(referenceField => referenceField.dataKey === field.dataKey);
            guidesReference.current[guideIndex].fields[fieldIndex] = field;     
        }
    }

    const handleChangeTextField = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        receivedField: Field
    ) => {
        const { value } = e.target;
        if (receivedField.type === 'text') {
                receivedField.data = value;
                setOpportunityRegistration({
                    ...opportunityRegistration,
                    [receivedField.dataKey] : value
                });
                changeReference(receivedField);
            
        }
        if (receivedField.type === 'date') {
            receivedField.data = value;
            setOpportunityRegistration({
                ...opportunityRegistration,
                [receivedField.dataKey]: value
            });
            changeReference(receivedField);

        }
        return;
    };

    const handleChangeAutoComplete = (
        field: Field,
        _event: React.SyntheticEvent<Element, Event>,
        value: OpportunityOptionField | null,
        _reason: AutocompleteChangeReason,
        _details?:
            | AutocompleteChangeDetails<{ label: string; id: number; object: string }>
            | undefined,
    ) => {
        setOpportunityRegistration({
            ...opportunityRegistration,
            [field.dataKey]: value?.id
        });
        field.data = value?.id;
        changeReference(field);
    };

    const editableField = (field: Field) => {
        return  field.dataKey !== 'numeroAdicional'
    }

    const setDefaultClientWhenNotDefined = async () =>  {
    const clientNotDefined =  !(opportunityRegistration.fkCodCliente as any !== '-')
   
      if (clientNotDefined && opportunityRegistration.idProjeto) {
        const clientFromFirstProject = await fetchClientFromFirstProjectOption(
          opportunityRegistration.idProjeto
        );
        setOpportunityRegistration({
          ...opportunityRegistration,
          fkCodCliente: clientFromFirstProject.id,
        });
        if (guidesReference.current) {
          guide.fields[4].data = clientFromFirstProject.id;
          guidesReference.current[0] = guide;
        }

        return;
      }
    }
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

    const fetchProjectsOps = useCallback(async () => {
        const projects = await fetchProjectOptionsByUser(user?.CODPESSOA || 0);
        const options =
            (projects &&
                projects.map((project: Project) => ({
                    label: project.DESCRICAO,
                    id: project.ID,
                    object: "project",
                    key: project.ID,
                }))) ||
            [];
        setProjectOptions([...options]);
    }, [setProjectOptions]);

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

    const renderAutoCompleteValue = (
        field: Field
    ): OpportunityOptionField => {
        if (field.dataKey === "idProjeto") {
            const optionValueSelected = projectOptions.find(
                (option) => option.id === field.data
            );
            if (optionValueSelected) return optionValueSelected;
        }
        if (field.dataKey === "codStatus") {
            const optionValueSelected = statusOptions.find(
                (option) => option.id === field.data
            );
            if (optionValueSelected) return optionValueSelected;
        }
        if (field.dataKey === "fkCodCliente") {
            const optionValueSelected = clientOptions.find(
                (option) => option.id === opportunityRegistration.fkCodCliente
            );
          
            if (optionValueSelected) return optionValueSelected;
        }
        return {
            label: "",
            id: 0,
            object: "",
            key: 0,
        };
    };
    
    useEffect(() => {
      fetchClientOps();
      fetchProjectsOps();
      fetchStatusOps();
    }, []);

    useEffect(() => {
    if(!isEditing){ 
        setOpportunityRegistration({
          idProjeto: guide.fields[0].data,
          numeroAdicional: guide.fields[1].data,
          nome: guide.fields[2].data,
          codStatus: guide.fields[3].data,
          fkCodCliente: guide.fields[4].data,
          dataSolicitacao: guide.fields[5].data,
          dataInicio: guide.fields[6].data,
          dataEntrega: guide.fields[7].data,
        });
    }
    }, [guide]); 

    useEffect(( )=> { 
        if(clientOptions && opportunityRegistration){ 
            setDefaultClientWhenNotDefined();
        }
    }, [clientOptions, guide])


    return (
        <Box sx={styles.container}>
            {opportunityRegistration && 
                <Box sx={styles.formGrid}>
                    {
                        guide.fields.map((field, index) => {
                            if (editableField(field) && !field.autoComplete && field.dataKey !== 'codOs') {
                                return (
                                    <TextField
                                        key={index}
                                        sx={{gridColumn: field.dataKey === 'nome' || field.type === 'date' ?  'span 2': null}}
                                        type={field.type}
                                        label={field.label}
                                        onChange={(e) => handleChangeTextField(e, field)}
                                        value={opportunityRegistration[field.dataKey as keyof OpportunityRegistrationFields]}
                                        InputLabelProps={{
                                            shrink: true
                                        }}
                                        onFocus={() => setIseEditing(true)}
                                    >
                                    </TextField>
                                )
                            }
                            if (editableField(field) && field.autoComplete) {
                                return (
                                    <Autocomplete
                                         sx={{gridColumn: 'span 2'}}
                                        value={renderAutoCompleteValue(field)}
                                        key={field.dataKey}
                                        disablePortal
                                        getOptionKey={(option: OpportunityOptionField) => option.key}
                                        disabled={field.dataKey === "idProjeto"}
                                        onChange={(_event: React.SyntheticEvent<Element, Event>, value: OpportunityOptionField | null, _reason: AutocompleteChangeReason, _details?: AutocompleteChangeDetails<{
                                            label: string;
                                            id: number;
                                            object: string;
                                        }> | undefined) => handleChangeAutoComplete(field, _event, value, _reason, _details,)}
                                        options={renderOptions(field) || []}
                                        renderInput={(params) =>
                                            <TextField {...params}
                                                label={field.label}
                                                InputLabelProps={{ shrink: true }}
                                            />}
                                    />
                                )
                            }

                        })
                    }

                </Box>
            }
            </Box>
    )
}

export default OpportunityRegistration
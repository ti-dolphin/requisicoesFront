/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useState } from "react";
import { OpportunityInfoContext } from "../context/OpportunityInfoContext";
import Box from "@mui/material/Box";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Button,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { fetchAllProjects } from "../../Requisitions/utils";
import { fetchAllClients, fetchSalers, fetchStatusList, opportunityInputFields, postOpportunity } from "../utils";
import {  Client, Opportunity, OpportunityColumn, OpportunityOptionField, Pessoa, Status } from "../types";
import CloseIcon from "@mui/icons-material/Close";


const CreateOpportunityModal = () => {

  const fetchClientOps = async () =>  {
    const clients = await fetchAllClients();
    const options = clients.map((client : Client) => ({ 
      label: client.NOME,
      id: client.CODCLIENTE,
      object: 'client'
    } ));
    setClientOptions([...options]);
  }

  const fetchProjectsOps = async () => {
    const projects = await fetchAllProjects();
    const options =
      (projects &&
        projects.map((project) => ({
          label: project.DESCRICAO,
          id: project.ID,
          object: 'project'
        }))) ||
      [];
    setProjectOptions([...options]);
  };
  const fetchStatusOps = async () => {
    const statusList = await fetchStatusList();
    const options = statusList.map(( status : Status ) => ({
      label: status.NOME,
      id: status.CODSTATUS,
      object: 'status'
    })) || [];
    setStatusOptions(options);
  };

  const fetchSalerOps = async () => {
    const salers = await fetchSalers();
    const options = salers.map((saler : Pessoa) => ({label : saler.NOME, id: saler.CODPESSOA, object: 'saler'}));
    setSalerOptions(options);
  };

  const { creatingOpportunity, toggleCreatingOpportunity, toggleRefreshOpportunityInfo } = useContext(
    OpportunityInfoContext
  );
  const handleClose = () => toggleCreatingOpportunity();
  const [adicional, setAdicional] = useState(false);
  const [opportunity, setCurrentOpportunity] = useState<Opportunity>({
    codOs: 0, // Exemplo de código de OS (AUTO_INCREMENT, não precisa definir)
    codTipoOs: 1, // Valor padrão para o tipo de OS (campo com valor padrão '1')
    codCCusto: null, // Opcional
    obra: null, // Opcional
    dataSolicitacao: new Date(), // Data atual (pode ser null se não obrigatório)
    dataNecessidade: new Date(), // Data atual (pode ser null se não obrigatório)
    docReferencia: null, // Opcional
    listaMateriais: null, // Opcional
    dataInicio: null, // Opcional
    dataPrevEntrega: null, // Opcional
    dataEntrega: null, // Opcional
    codStatus: 1, // Valor padrão para o status (campo com valor padrão '1')
    nome: "", // Nome obrigatório
    descricao: null, // Opcional
    atividades: null, // Opcional
    prioridade: 0, // Valor padrão (campo com valor padrão '0')
    solicitante: 1, // Valor padrão para o solicitante (campo com valor padrão '1')
    responsavel: 1, // Valor padrão para o responsável (campo com valor padrão '1')
    codDisciplina: 1, // Valor padrão para o código de disciplina (campo com valor padrão '1')
    gut: 1, // Valor padrão para o GUT (campo com valor padrão '1')
    gravidade: 1, // Valor padrão para a gravidade (campo com valor padrão '1')
    urgencia: 1, // Valor padrão para urgência (campo com valor padrão '1')
    tendencia: 1, // Valor padrão para tendência (campo com valor padrão '1')
    dataLiberacao: null, // Opcional
    relacionamento: 1, // Valor padrão para relacionamento (campo com valor padrão '1')
    fkCodCliente: "-", // Valor padrão (campo com valor padrão '-')
    fkCodColigada: 0, // Valor padrão para código de coligada (campo com valor padrão '0')
    valorFatDireto: 0.0, // Valor padrão (campo com valor padrão '0.00')
    valorServicoMO: 0.0, // Valor padrão (campo com valor padrão '0.00')
    valorServicoMatAplicado: 0.0, // Valor padrão (campo com valor padrão '0.00')
    valorMaterial: 0.0, // Valor padrão (campo com valor padrão '0.00')
    valorTotal: 0.0, // Valor padrão (campo com valor padrão '0.00')
    codSegmento: 1, // Valor padrão para código de segmento (campo com valor padrão '1')
    codCidade: 0, // Valor padrão para código de cidade (campo com valor padrão '0')
    valorLocacao: 0.0, // Valor padrão (campo com valor padrão '0.00')
    idAdicional: 0, // Valor padrão (campo com valor padrão '0')
    idProjeto: 0, // Valor padrão (campo com valor padrão '0')
    dataInteracao: "1111-11-11", // Valor padrão (campo com valor padrão '1111-11-11')
    valorFatDolphin: 0.0, // Valor padrão para faturamento Dolphin (campo com valor padrão '0.00')
    principal: true, // Valor padrão (campo com valor padrão '1')
    valorComissao: 0.0, // Valor obrigatório
    idMotivoPerdido: 1, // Valor obrigatório (campo não pode ser nulo)
    observacoes: null, // Opcional
    descricaoVenda: null, // Opcional
    emailVendaEnviado: false, // Valor padrão (campo com valor padrão '0')
  });

  const [isAdicionalChoiceOpen, setIsAdicionalChoiceOpen] = useState(true);
  const [projectOptions, setProjectOptions] = useState<
   OpportunityOptionField[]
  >([]);
  const [salerOptions, setSalerOptions] = useState<
   OpportunityOptionField[]
  >([]);
  const [statusOptions, setStatusOptions] = useState<
   OpportunityOptionField[]
  >([]);
  const [clientOptions, setClientOptions] = useState<{
    label: string;
    id: number;
    object: string;
  }[]>([]);

  const handleChangeAutoComplete = (
    _event: React.SyntheticEvent<Element, Event>,
     value:OpportunityOptionField | null,
    _reason: AutocompleteChangeReason,
    _details?:
      | AutocompleteChangeDetails<{ label: string; id: number, object: string }>
      | undefined
  ) => {
      if(value?.object==='project'){ 
        console.log("handleChangeAutoComplete: ", {
          ...opportunity,
          numero_projeto: value?.id,
        });
        setCurrentOpportunity({...opportunity, idProjeto: value?.id });
        return;
      }
      
      if(value?.object === 'status'){ 
        console.log("handleChangeAutoComplete: ", {
          ...opportunity,
          status: value?.label,
        });
        setCurrentOpportunity({...opportunity, codStatus: value?.id });
        return;
      }
      if(value?.object === 'saler'){
        console.log("handleChangeAutoComplete: ", {
          ...opportunity,
          vendedor: value?.label,
        }); 
        setCurrentOpportunity({...opportunity, responsavel: value?.id });
        return;
      }
  };

  const handleChangeTextField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    column: OpportunityColumn
  ) => {
      const  {value } = e.target;
      console.log("handleChangeTextField: ", {
        ...opportunity,
        [column.dataKey]: value,
      });
      setCurrentOpportunity({...opportunity, [column.dataKey]: value });
  };

  const isDateField = (dataKey: string): boolean => dataKey.startsWith("data");

  const handleAdicionalChoice = (isAdicional: boolean) => {
    setAdicional(isAdicional);
    setIsAdicionalChoiceOpen(false);
  };

  const renderOptions = (column: {
    label: string;
    dataKey: string;
    autoComplete?: boolean;
  }) => {
    if (column.dataKey === "idProjeto") return projectOptions;
    if (column.dataKey === "responsavel") return salerOptions;
    if (column.dataKey === "codStatus") return statusOptions;
    if (column.dataKey === "fkCodCliente") return clientOptions;
  };

  const handleSaveOpportunity = async ( ) => { 
    // Implementar o salvamento da proposta na API
    console.log("Salvando proposta: ", opportunity);
    const response = await postOpportunity(opportunity);
    if(response?.status === 200) {
       handleClose()
      toggleRefreshOpportunityInfo();
    }
  };

  React.useEffect(() => {
    fetchProjectsOps();
    fetchStatusOps();
    fetchSalerOps();
    fetchClientOps();
  }, [creatingOpportunity, adicional]);

  return (
    <Modal
      open={creatingOpportunity}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",

          boxShadow: 24,
          height: "80%",
          overFlow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          p: 2,
        }}
      >
        <IconButton  sx={{
          position: 'absolute',
          right: 1,
          top: 1
        }}onClick={handleClose}>
          <CloseIcon />
        </IconButton>
        {" "}
        <Typography fontFamily="Roboto">Nova Proposta</Typography>
        <Stack
          maxHeight="80%"
          width="100%"
          gap={1}
          padding={1}
          overflow="scroll"
        >
          {opportunityInputFields.map((column) =>
            column.dataKey === "idProjeto" && !adicional ? (
              ""
            ) : column.autoComplete ? (
              <Autocomplete
                disablePortal
                onChange={handleChangeAutoComplete}
                options={renderOptions(column) || []}
                sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} label={column.label} />
                )}
              />
            ) : (
              
             column.dataKey === 'descricao' && adicional ?'' : //na coluna descrição, se for adicional não renderizar campo pois já tem
               <TextField
                key={column.dataKey}
                label={column.label}
                placeholder={column.label}
                type={column.type}
                onChange={(e) => handleChangeTextField(e, column)}
                InputLabelProps={
                  isDateField(column.dataKey) ? { shrink: true } : undefined
                }
                variant="outlined"
                fullWidth
                margin="normal"
              />
            )
          )}
        </Stack>
        <Button variant="outlined" onClick={handleSaveOpportunity}>
          <Typography fontFamily="Roboto" fontSize="small">
            Salvar
          </Typography>
        </Button>
        <Modal
          open={isAdicionalChoiceOpen}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              height: "20%",
              overFlow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              p: 2,
            }}
          >
            A proposta é um adicional?
            <Stack direction="row" gap={1}>
              <Button
                onClick={() => handleAdicionalChoice(true)}
                variant="contained"
                color="primary"
              >
                Sim
              </Button>
              <Button
                onClick={() => handleAdicionalChoice(false)}
                variant="contained"
                color="primary"
              >
                Não
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </Modal>
  );
};

export default CreateOpportunityModal;

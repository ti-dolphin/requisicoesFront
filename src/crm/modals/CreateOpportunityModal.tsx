/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useState } from "react";
import { OpportunityInfoContext } from "../context/OpportunityInfoContext";
import Box from "@mui/material/Box";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { fetchAllProjects } from "../../Requisitions/utils";
import { fetchAllClients, fetchSalers, fetchStatusList } from "../utils";
import {  Client, OpportunityColumn, OpportunityInfo, OpportunityOptionField, Pessoa, Status } from "../types";

const columns: OpportunityColumn[] = [
  {
    label: "Projeto",
    dataKey: "numero_projeto",
    autoComplete: true,
  },
  {
    label: "Status",
    dataKey: "status",
    autoComplete: true,
  },
  {
    label: "Descrição",
    dataKey: "descricao_projeto",
  },
  {
    label: "Cliente",
    dataKey: "cliente",
    autoComplete: true,
  },
  {
    label: "Data de Solicitação",
    dataKey: "data_solicitacao",
  },
  {
    label: "Data de Envio da Proposta",
    dataKey: "data_envio_proposta",
  },
  {
    label: "Data de Fechamento",
    dataKey: "data_fechamento",
  },
  {
    label: "Data de Interação",
    dataKey: "data_interacao",
  },

  {
    label: "Vendedor",
    dataKey: "vendedor",
    autoComplete: true,
  },

  {
    label: "Valor Faturamento Dolphin",
    dataKey: "valor_faturamento_dolphin",
  },
  {
    label: "Valor Faturamento Direto",
    dataKey: "valor_faturamento_direto",
  },
  { label: "Valor Total", dataKey: "valor_total" },
];

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

  const { creatingOpportunity, toggleCreatingOpportunity } = useContext(
    OpportunityInfoContext
  );
  const handleClose = () => toggleCreatingOpportunity();
  const [adicional, setAdicional] = useState(false);
  const [opportunity, setCurrentOpportunity] = useState<OpportunityInfo>({
    numero_os: 0,
    numero_projeto: 0,
    numero_adicional: 0,
    status: "Novo", // Default: status inicial
    descricao_proposta: "Descrição padrão", // Default
    cliente: "Cliente padrão", // Default
    data_cadastro: new Date(), // Default: data atual
    data_solicitacao: new Date(), // Default: data atual
    data_envio_proposta: new Date(), // Default: data atual
    data_fechamento: new Date(), // Default: data atual
    data_interacao: new Date(), // Default: data atual
    data_inicio: new Date(), // Default: data atual
    data_necessidade: new Date(), // Default: data atual
    data_prev_fechamento: new Date(), // Default: data atual
    vendedor: "Vendedor padrão", // Default
    gerente: "Gerente padrão", // Default
    valor_faturamento_dolphin: 0, // Default: sem valor'
    valor_faturamento_direto: 0, // Default: sem valor
    valor_total: 0, // Default: sem valor
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
        setCurrentOpportunity({...opportunity, numero_projeto: value?.id });
        return;
      }
      if(value?.object === 'status'){ 
        console.log("handleChangeAutoComplete: ", {
          ...opportunity,
          status: value?.label,
        });
        setCurrentOpportunity({...opportunity, status: value?.label });
        return;
      }
      if(value?.object === 'saler'){
        console.log("handleChangeAutoComplete: ", {
          ...opportunity,
          vendedor: value?.label,
        }); 
        setCurrentOpportunity({...opportunity, vendedor: value?.label });
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

  const isDateField = (dataKey: string): boolean => dataKey.startsWith("data_");

  const handleAdicionalChoice = (isAdicional: boolean) => {
    setAdicional(isAdicional);
    setIsAdicionalChoiceOpen(false);
  };

  const renderOptions = (column: {
    label: string;
    dataKey: string;
    autoComplete?: boolean;
  }) => {
    if (column.dataKey === "numero_projeto") return projectOptions;
    if (column.dataKey === "vendedor") return salerOptions;
    if (column.dataKey === "status") return statusOptions;
    if(( column.dataKey === 'cliente')) return clientOptions;
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
        {" "}
        <Typography fontFamily="Roboto">Nova Proposta</Typography>
        <Stack
          maxHeight="80%"
          width="100%"
          gap={1}
          padding={1}
          overflow="scroll"
        >
          {columns.map((column) =>
            column.dataKey === "numero_projeto" && !adicional ? (
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
              <TextField
                key={column.dataKey}
                label={column.label}
                placeholder={column.label}
                type={isDateField(column.dataKey) ? "date" : "text"}
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
        <Button variant="outlined">
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

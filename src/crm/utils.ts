import { AxiosRequestConfig } from "axios";
import api from "../api";
import { DateFilter, Opportunity, OpportunityColumn } from "./types";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import { Person } from "../Requisitions/types";
dayjs.extend(utc);
dayjs.extend(timezone);


export const fetchPersonList = async () => {
  try {
    const response = await api.get<Person[]>("/pessoa");
    return response.data;
  } catch (e) {
    console.log(e);
  }
}
export const updateOpportunity = async (opportunity : Opportunity ) =>  { 
  try {
    const response = await api.put("opportunity/update",  opportunity );
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOpportunities = async (
  finished: boolean,
  dateFilters: DateFilter[],
  codpessoa: number
) => {
  try {
    const response = await api.get("/opportunity", {
      params: { finished, dateFilters, codpessoa },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchStatusList = async () => {
  try {
    const response = await api.get("/opportunity/status");
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export const fetchSalers = async () => {
  try {
    const response = await api.get("/opportunity/saler");
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export const getOpportunityById = async (oppId: number) => {
  try {
    console.log("getOpportunityById");
    const response = await api.get(`/opportunity/${oppId}`);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export const fetchAllClients = async () => {
  try {
    const respoonse = await api.get("/opportunity/client");
    return respoonse.data;
  } catch (e) {
    console.log('fetchAllClients: ', e);
  }
};

export const createOpportunity = async (opp: Opportunity) => {
  try {
    const response = await api.post(`opportunity/create`, { ...opp });
    return response;
  } catch (e) {
    console.log(e);
  }
};



export const createAdicional = async (opportunity : Opportunity ) =>  { 
  try{ 
    const response = await api.post(`opportunity/create`, opportunity);
    return response.data;
  }catch(e){ 
    console.log(e);
  }
};

export const createOpportunityFiles = async (oppId : number, files: FormData ) =>  { 
  const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { 
          oppId
      },
      data: files,
    };
    try{
      const response = await api.post(`opportunity/files`, files, config);
      return response;
    }catch(e){
      console.log(e);
    }
};
export const fetchOpportunityFilesById = async (oppId : number) => {
  console.log("fetchOpportunityFilesById");
  try {
    const response = await api.get(`/opportunity/files`, { 
      params: { oppId },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export const opportunityInputFields: OpportunityColumn[] = [
  {
    label: "Nº Projeto",
    dataKey: "idProjeto", // Alinhado com a propriedade idProjeto da interface
    autoComplete: true,
    type: "number", // Tipo numérico
  },
  // {
  //   label: "Nº Adicional",
  //   dataKey: "idAdicional", // Alinhado com a propriedade idAdicional da interface
  //   type: "number", // Tipo numérico
  // },
  {
    label: "Status",
    dataKey: "codStatus", // Alinhado com a propriedade codStatus da interface
    autoComplete: true,
    type: "number", // Tipo numérico
  },
  {
    label: "Descrição da Proposta",
    dataKey: "nome", // Alinhado com a propriedade descricao da interface
    type: "text", // Tipo texto
  },
  // { 
  //   label: 'Descrição do Projeto',
  //   dataKey: 'descricao',
  //   type: 'text'
  // },
  {
    label: "Cliente",
    dataKey: "fkCodCliente", // Alinhado com a propriedade fkCodCliente da interface
    autoComplete: true,
    type: "text", // Tipo texto
  },
  {
    label: "Data de Solicitação",
    dataKey: "dataSolicitacao", // Alinhado com a propriedade dataSolicitacao da interface
    type: "Date", // Tipo data e hora
  },
  {
    label: "Data de Fechamento",
    dataKey: "dataEntrega", // Alinhado com a propriedade dataEntrega da interface
    type: "date", // Tipo data e hora
  },
  {
    label: "Data de Interação",
    dataKey: "dataInteracao", // Alinhado com a propriedade dataInteracao da interface
    type: "date", // Tipo data e hora
  },
  {
    label: "Data de Início",
    dataKey: "dataInicio", // Alinhado com a propriedade dataInicio da interface
    type: "date", // Tipo data e hora
  },
  {
    label: "Vendedor",
    dataKey: "responsavel", // Alinhado com a propriedade responsavel da interface
    autoComplete: true,
    type: "text", // Tipo texto
  },
  {
    label: "Valor Faturamento Dolphin",
    dataKey: "valorFatDolphin", // Alinhado com a propriedade valorFatDolphin da interface
    type: "number", // Tipo numérico
  },
  {
    label: "Valor Faturamento Direto",
    dataKey: "valorFatDireto", // Alinhado com a propriedade valorFatDireto da interface
    type: "number", // Tipo numérico
  },
  {
    label: "Valor Total",
    dataKey: "valorTotal", // Alinhado com a propriedade valorTotal da interface
    type: "number", // Tipo numérico
  },
  {
    label: "Valor Comissão",
    dataKey: "valorComissao", // Alinhado com a propriedade valorComissao da interface
    type: "number", // Tipo numérico
  },
  // {
  //   label: "Valor Serviço MO",
  //   dataKey: "valorServicoMO", // Alinhado com a propriedade valorServicoMO da interface
  //   type: "number", // Tipo numérico
  // },
  // {
  //   label: "Valor Serviço Mat Aplicado",
  //   dataKey: "valorServicoMatAplicado", // Alinhado com a propriedade valorServicoMatAplicado da interface
  //   type: "number", // Tipo numérico
  // },
  // {
  //   label: "Valor Material",
  //   dataKey: "valorMaterial", // Alinhado com a propriedade valorMaterial da interface
  //   type: "number", // Tipo numérico
  // },
  // {
  //   label: "Valor Locação",
  //   dataKey: "valorLocacao", // Alinhado com a propriedade valorLocacao da interface
  //   type: "number", // Tipo numérico
  // },
  {
    label: "Observações",
    dataKey: "observacoes", // Alinhado com a propriedade observacoes da interface
    type: "text", // Tipo texto
  },
  // {
  //   label: "Descrição da Venda",
  //   dataKey: "descricaoVenda", // Alinhado com a propriedade descricaoVenda da interface
  //   type: "text", // Tipo texto
  // },
  // {
  //   label: "Email Venda Enviado",
  //   dataKey: "emailVendaEnviado", // Alinhado com a propriedade emailVendaEnviado da interface
  //   type: "checkbox", // Tipo checkbox
  // },
  // {
  //   label: "Principal",
  //   dataKey: "principal", // Alinhado com a propriedade principal da interface
  //   type: "checkbox", // Tipo checkbox
  // },

  // {
  //   label: "Motivo Perdido",
  //   dataKey: "idMotivoPerdido", // Alinhado com a propriedade idMotivoPerdido da interface
  //   type: "number", // Tipo numérico
  // }
];


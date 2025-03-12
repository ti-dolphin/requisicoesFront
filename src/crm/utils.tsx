import { AxiosRequestConfig } from "axios";
import api from "../api";
import { Client, DateFilter, Opportunity, OpportunityColumn } from "./types";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import { Person } from "../Requisitions/types";
import { User } from "../Requisitions/context/userContext";



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
export const updateOpportunity = async (opportunity : Opportunity, user?: User ) =>  { 
  try {
    const response = await api.put("opportunity/update",  opportunity, { 
      params: {user}
    } );
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

export const fetchSalers = async (projectId: number) => {
  try {
    const response = await api.get("/opportunity/saler",  {
      params:  {
        projectId
      }
    });
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

export const fetchAllClients = async (projectId: number) => {
  try {
    const respoonse = await api.get("/opportunity/client", {
      params: {
        projectId
      },
    });
    return respoonse.data;
  } catch (e) {
    console.log("fetchAllClients: ", e);
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


export const patrimonyInfoColumns: PatrimonyInfoColumnData[] = [
  {
    width: 90, // Reduzi um pouco para economizar espaço
    label: "Patrimônio",
    dataKey: "id_patrimonio",
  },
  {
    width: 90, // Mantive um tamanho razoável para a visualização do nome
    label: "Nome",
    dataKey: "nome",
  },
  {
    width: 80,
    label: "Valor de Compra",
    dataKey: "valor_compra",
  },
  {
    width: 170,
    label: "Tipo",
    dataKey: "nome_tipo",
  },
  {
    width: 150, // Reduzi para economizar espaço, mantendo a descrição legível
    label: "Descrição",
    dataKey: "descricao",
  },
  {
    width: 100, // Mantido similar ao nome
    label: "Responsável",
    dataKey: "responsavel",
  },
  {
    width: 100, // Mantido igual ao responsável
    label: "Gerente",
    dataKey: "gerente",
  },
  {
    width: 150, // Projeto precisa de um pouco mais de espaço
    label: "Projeto",
    dataKey: "projeto",
  },
  {
    width: 80, // Reduzido um pouco para última movimentação
    label: "Ultima Movimentação",
    dataKey: "dataMovimentacao",
  },
  {
    width: 70, // Coluna vazia para possíveis ações, mantive um valor baixo
    label: "",
    dataKey: "",
  },
];
export interface PatrimonyInfoColumnData {
  dataKey: string;
  label: string;
  numeric?: boolean;
  width: number;
}

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

export const fetchClientFromFirstProjectOption = async (projectId: number ) =>  {
        const clients: any = await fetchAllClients(projectId);
        
        const options = clients.map((client: Client) => ({
          label: client.NOMEFANTASIA,
          id: client.CODCLIENTE,
          object: "client",
          key: client.CODCLIENTE,
        }));
        const olyOptionAvailable = options.find(
          (option: any) => option.label !== "-"
        );
        return olyOptionAvailable;
};

export const fetchResponsableForFirstProjectOption = async ( projectId: number) => { 
   const salers = await fetchSalers(Number(projectId));
   const options = salers.map((saler: any) => ({
     label: saler.NOME,
     id: saler.CODPESSOA,
     object: "saler",
     key: saler.CODPESSOA,
   }));
   const onlyOptionAvailable = options.find(
     (option: any) => option.label !== "-"
   );
   return onlyOptionAvailable;
}

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

export const opportunityDefault = {
  codOs: 0, // Exemplo de código de OS (AUTO_INCREMENT, não precisa definir)
  codTipoOs: 1, // Valor padrão para o tipo de OS (campo com valor padrão '1')
  codCCusto: null, // Opcional
  obra: null, // Opcional
  dataSolicitacao: null, // Data atual (pode ser null se não obrigatório)
  dataNecessidade: null, // Data atual (pode ser null se não obrigatório)
  docReferencia: null, // Opcional
  listaMateriais: null, // Opcional
  dataInicio: null, // Opcional
  dataPrevEntrega: null, // Opcional
  dataEntrega: null, // Opcional
  codStatus: 1, // Valor padrão para o status (campo com valor padrão '1')
  nome: "", // Nome obrigatório
  descricao: '', // Opcional
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
  fkCodCliente: '-', // Valor padrão (campo com valor padrão '-')
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
  dataInteracao: null, // Valor padrão (campo com valor padrão '1111-11-11')
  valorFatDolphin: 0.0, // Valor padrão para faturamento Dolphin (campo com valor padrão '0.00')
  principal: true, // Valor padrão (campo com valor padrão '1')
  valorComissao: 0.0, // Valor obrigatório
  idMotivoPerdido: 1, // Valor obrigatório (campo não pode ser nulo)
  observacoes: "", // Opcional
  descricaoVenda: "", // Opcional
  emailVendaEnviado: false, // Valor padrão (campo com valor padrão '0')
  numeroAdicional: 0, // Valor padrão com
  comentarios: [],
  seguidores: [],
}


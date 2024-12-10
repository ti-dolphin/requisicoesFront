export interface OpportunityInfo {
  numero_os: number;
  numero_projeto: number; // Número do projeto
  numero_adicional: number; // Número adicional
  status: string; // Status do projeto
  descricao_proposta: string; // Descrição do projeto
  cliente: string; // Nome do cliente
  data_cadastro: Date | string; // Data do cadastro
  data_solicitacao: Date | string; // Data da solicitação
  data_envio_proposta: Date | string; // Data do envio da proposta
  data_fechamento: Date | string; // Data do fechamento (venda)
  data_interacao: Date | string;
  data_inicio: Date | string;
  data_necessidade: Date | string;
  data_prev_fechamento: Date | string;
  vendedor: string; // Nome do vendedor
  gerente: string; // Nome do gerente
  valor_faturamento_dolphin: number;
  valor_faturamento_direto: number;
  valor_total: number;
}
export interface DateFilter {
  dateFilterKey: string;
  from: Date | string;
  to: Date | string;
  dbField: string;
}
export interface Status {
  CODSTATUS : number;
  NOME : string;
  ACAO : number;
  ATIVO : number;
}
export interface Pessoa {
  CODPESSOA : number;
  NOME : string;
}
export interface OpportunityColumn {
  label: string;
  dataKey: string;
  autoComplete?: boolean;
}
export interface Client{ 
  CODCLIENTE : number;
  NOME : string;
}
export interface OpportunityOptionField {
  label: string;
  id: number;
  object: string;
}

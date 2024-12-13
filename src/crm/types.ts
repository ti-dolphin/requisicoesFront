export interface OpportunityInfo {
  numeroProjeto: number; // ID_PROJETO
  numeroAdicional: number; // ID_ADICIONAL
  nomeStatus: string; // nome_status
  nomeCliente: string; // nome_cliente
  nomeDescricaoProposta: string; // nome_descricao_proposta
  dataSolicitacao: string | Date | null; // DATASOLICITACAO
  dataFechamento: string | Date | null; // DATAENTREGA
  dataInteracao: string | Date | null; // DATAINTERACAO
  dataInicio: string | Date | null; // DATAINICIO
  nomeVendedor: string; // nome_vendedor
  nomeGerente: string; // nome_gerente
  valorFaturamentoDolphin: string; // VALORFATDOLPHIN (FORMATADO)
  valorFaturamentoDireto: string; // VALORFATDIRETO (FORMATADO)
  valorTotal: string; // VALORTOTAL (FORMATADO)
  numeroOs: number; // CODOS
}

export interface Opportunity {
  codOs: number; // CODOS
  codTipoOs?: number; // CODTIPOOS
  codCCusto?: string | null; // CODCCUSTO
  obra?: string | null; // OBRA
  dataSolicitacao?: Date | string | null; // DATASOLICITACAO
  dataNecessidade?: Date | string | null; // DATANECESSIDADE
  docReferencia?: string | null; // DOCREFERENCIA
  listaMateriais?: string | null; // LISTAMATERIAIS
  dataInicio?: Date | string | null; // DATAINICIO
  dataPrevEntrega?: Date | string | null; // DATAPREVENTREGA
  dataEntrega?: Date | string | null; // DATAENTREGA
  codStatus?: number; // CODSTATUS
  nome: string; // NOME
  descricao?: string | null; // DESCRICAO
  atividades?: string | null; // ATIVIDADES
  prioridade?: number; // PRIORIDADE
  solicitante?: number; // SOLICITANTE
  responsavel?: number; // RESPONSAVEL
  codDisciplina?: number; // CODDISCIPLINA
  gut?: number; // GUT
  gravidade?: number; // GRAVIDADE
  urgencia?: number; // URGENCIA
  tendencia?: number; // TENDENCIA
  dataLiberacao?: Date | string | null; // DATALIBERACAO
  relacionamento?: number; // RELACIONAMENTO
  fkCodCliente?: string; // FK_CODCLIENTE
  fkCodColigada: number; // FK_CODCOLIGADA
  valorFatDireto?: number | null; // VALORFATDIRETO
  valorServicoMO?: number | null; // VALORSERVICOMO
  valorServicoMatAplicado?: number | null; // VALORSERVICOMATAPLICADO
  valorMaterial?: number | null; // VALORMATERIAL
  valorTotal?: number | null; // VALORTOTAL
  codSegmento: number; // CODSEGMENTO
  codCidade?: number; // CODCIDADE
  valorLocacao?: number | null; // VALORLOCACAO
  idAdicional: number; // ID_ADICIONAL
  idProjeto: number; // ID_PROJETO
  dataInteracao?: Date | string | null; // DATAINTERACAO
  valorFatDolphin: number; // VALORFATDOLPHIN
  principal: boolean; // PRINCIPAL
  valorComissao: number; // VALOR_COMISSAO
  idMotivoPerdido: number; // id_motivo_perdido
  observacoes?: string | null; // observacoes
  descricaoVenda?: string | null; // DESCRICAO_VENDA
  emailVendaEnviado?: boolean; // EMAIL_VENDA_ENVIADO
}

export interface DateFilter {
  dateFilterKey: string;
  from: Date | string;
  to: Date | string;
  dbField: string;
}
export interface Status {
  CODSTATUS: number;
  NOME: string;
  ACAO: number;
  ATIVO: number;
}
export interface Pessoa {
  CODPESSOA: number;
  NOME: string;
}
export interface OpportunityColumn {
  label: string;
  dataKey: string;
  autoComplete?: boolean;
  type: string;
}
export interface Client {
  CODCLIENTE: number;
  NOME: string;
}
export interface OpportunityOptionField {
  label: string;
  id: number;
  object: string;
}

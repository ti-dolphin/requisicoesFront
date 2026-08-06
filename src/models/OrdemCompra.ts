export interface OrdemCompra {
  ID: number;
  COLIGADA: number | string;
  COD_CENTRO_CUSTO: string;
  CENTRO_CUSTO: string;
  RESPONSAVEL?: number | string | null;
  NUMERO_MOVIMENTO: number | string;
  DATA_EMISSAO: string;
  DATA_ENTREGA: string | null;
  VALOR_BRUTO: number | string;
  DATAEXTRA1?: string | null;
  CAMPOLIVRE1?: string | null;
  DIRECTOR_APPROVED?: boolean | number | null;
  DIRECTOR_APPROVAL_DATE?: string | null;
  DIRECTOR_APPROVER?: string | null;
  FORNECEDOR: string;
  FORNECEDOR_NOME_FANTASIA: string;
}

export interface OrdemCompraRequisicao {
  id_requisicao: number;
  descricao: string | null;
  id_projeto: number | null;
  projeto: string | null;
  oc: number | string | null;
}

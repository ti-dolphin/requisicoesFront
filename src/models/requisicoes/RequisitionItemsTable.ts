export interface RequisitionItemsTableProps {
  tableMaxHeight?: number;
  hideFooter: boolean;
}

export interface PatrimonyFormData {
  nome: string;
  descricao: string;
  nserie: string;
  tipo: number;
  valor_compra: number;
  calibracao: number;
  data_proxima_calibracao: string;
  responsavel?: number;
  projeto?: number;
}
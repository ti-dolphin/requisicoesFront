export interface AlinhamentoItem {
  id_item: number;
  id_alinhamento: number;
  descricao: string;
  concluido: boolean;
  ordem: number;
}

export interface AlinhamentoChecklist {
  id_alinhamento: number;
  CODOS: number | null;
  id_pessoa: number;
  pessoa: { CODPESSOA: number; NOME: string };
  itens: AlinhamentoItem[];
}

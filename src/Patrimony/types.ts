
export type Patrimony = {
  nome: string;
  tipo: number;
  id_patrimonio: number;
  data_compra: string; // ISO Date string format
  nserie: string;
  descricao: string;
  pat_legado?: string;
  id_projeto?: number;
  nome_tipo: string;
};

export type patrimonyType = { 
  id_tipo_patrimonio : number;
  nome_tipo : string;
}

export interface ProjectOption {
  label: string;
  id: number;
}

export type MovimentacaoPatrimonio = {
  id_movimentacao: number;
  data: string; // ISO Date string format
  id_patrimonio: number;
};

export type MovementationFile = {
  id_anexo_movimentacao: number;
  arquivo: string;
  nome_arquivo: string;
  id_movimentacao: number;
};

export interface Movementation {
  id_movimentacao: number;
  id_projeto : number;
  id_patrimonio : number;
  id_ultima_movimentacao : number;
  responsavel? : string,
  projeto?: string;
  data: string;
  id_ultimo_responsavel? : number;
  id_responsavel: number;
  numeroMovimentacao?: number;
  observacao: string;
}

export type PatrimonyFile = {
  id_anexo_patrimonio: number;
  arquivo: string;
  nome_arquivo: string;
  id_patrimonio: number;
};

export type Fabricante = {
  id_fabricante: number;
  nome: string;
  id_patrimonio: number;
};

export type AcessorioPatrimonio = {
  id_acessorio_patrimonio: number;
  nome: string;
  id_patrimonio: number;
};

export interface PatrimonyInfo {
  id_patrimonio : number; // não aparece
  id_responsavel : number;
  gerente: string; // aparece
  patrimonio: string;
  nome: string;
  projeto: string; //aparece
  responsavel: string; // aparece
  descricao: string; // aparece
  numeroMovimentacao: number; // aparece
  dataMovimentacao: string; //aparece Data da movimentação no formato ISO (YYYY-MM-DD)
}
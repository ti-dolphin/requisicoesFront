
export type Patrimony = {
  nome: string;
  tipo: number;
  id_patrimonio: number;
  data_compra: string; // ISO Date string format
  nserie: string;
  descricao: string;
  pat_legado?: string;
  id_projeto?: number;
  ativo : number;
  fabricante: string;
  nome_tipo: string;
  valor_compra : number;
};
export  type PatrimonyAccessory = {
  descricao : string;
  id_acessorio_patrimonio: number;
  nome: string;
  id_patrimonio: number;
}
export interface PatrimonyAccessoryFile {
  id_anexo_acessorio_patrimonio: number;
  id_acessorio_patrimonio: number;
  nome: string;
  arquivo: string; // Use string para URLs ou caminhos de arquivos
}


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
  aceito : number;
}

export type PatrimonyFile = {
  id_anexo_patrimonio: number;
  arquivo: string;
  nome_arquivo: string;
  id_patrimonio: number;
};

export interface ChecklistItem {
  id_items_checklist_tipo: number;
  id_tipo_patrimonio: number;
  nome_item_checklist: string;
  created_at: string;
  updated_at: string;
}
export interface ChecklistItemFile {
  id_item_checklist_movimentacao: number;
  id_checklist_movimentacao: number;
  nome_item_checklist: string;
  arquivo: string | null;
  problema: number;
  observacao? : string;
}
export interface MovementationChecklist {
  id_checklist_movimentacao: number;
  id_movimentacao: number;
  data_criacao: string; // Date in ISO format
  realizado: number; // Assuming 0 or 1 for boolean values
  data_realizado: string | null; // Can be null or a date in ISO format
  aprovado: number;
  reprovado: number; // Assuming 0 or 1 for boolean values
  data_aprovado: string | null; // Can be null or a date in ISO format
  observacao: string | null;
  nome: string;
  nome_responsavel?: string;
  responsavel_tipo?: number;
  id_patrimonio: number;
  responsavel_movimentacao?: number;
  nome_patrimonio?: string;
  descricao_projeto?: string;
  atrasado? : number;
  problema? : number;
}

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
  descricao: string; // aparece7
  nome_tipo? : string;
  aceito : number;
  numeroMovimentacao: number; // aparece
  dataMovimentacao: string; 
  valor_compra : number;
  //aparece Data da movimentação no formato ISO (YYYY-MM-DD)
}
export interface User {
  CODPESSOA: number;
  NOME: string;
  LOGIN: string;
  SENHA: string;
  SOLICITANTE: boolean;
  RESPONSAVEL: boolean;
  LIDER: boolean;
  PERM_LOGIN: boolean;
  PERM_EPI: boolean;
  PERM_AUTENTICACAO: boolean;
  PERM_OS: boolean;
  PERM_TIPO: boolean;
  PERM_STATUS: boolean;
  PERM_APONT: boolean;
  PERM_STATUS_APONT: boolean;
  PERM_PESSOAS: boolean;
  PERM_COMENT_OS: boolean;
  PERM_COMENT_APONT: boolean;
  CODGERENTE: number | null;
  ATIVO: boolean;
  EMAIL: string;
  PERM_PONTO: boolean;
  PERM_VENDA: boolean;
  PERM_CADEPI: boolean;
  PERM_DESCONTADO: boolean;
  PERM_GESTAO_PESSOAS: boolean | null;
  PERM_CONTROLE_RECESSO: boolean | null;
  PERM_CUSTO: boolean;
  PERM_FERRAMENTAS: boolean;
  PERM_CHECKLIST: boolean;
  PERM_PROSPECCAO: boolean;
  PERM_APONTAMENTO_PONTO: boolean;
  PERM_APONTAMENTO_PONTO_JUSTIFICATIVA: boolean;
  PERM_BANCO_HORAS: boolean;
  PERM_FOLGA: boolean;
  ULTIMO_LOGIN: string | null;
  PERM_REQUISITAR: number | null;
  PERM_COMPRADOR: number | null;
  PERM_CADASTRAR_PAT: number | null;
  PERM_ADMINISTRADOR: number | null;
  PERM_COMERCIAL: number | null;
  PERM_DIRETOR: number | null;
  PERM_EDITAR_PRODUTOS: number | null;
  PERM_ESTOQUE: number | null;
  PERM_COMPRADOR_OPERACIONAL: number | null;
  PERM_MOVIMENTAR: number | null;
  PERM_CRM: number | null;
}

export interface ReducedUser {
  CODPESSOA: number;
  NOME: string;
}

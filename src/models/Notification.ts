export interface NotificationRemetente {
  CODPESSOA: number;
  nome: string;
}

export interface Notification {
  id_aviso: number;
  id_requisicao: number;
  id_remetente: number;
  nome_transicao: string;
  data_criacao: string;
  visto: boolean;
  remetente?: NotificationRemetente;
}

export interface MercadoLivreOrderItem {
  id_item: string;
  titulo: string;
  quantidade: number;
  preco_unitario: number;
}

export interface MercadoLivreTracking {
  id_envio: number;
  status: string;
  substatus: string | null;
  codigo_rastreio: string | null;
  transportadora: string | null;
  data_estimada: string | null;
}

export interface MercadoLivreAccount {
  ml_user_id: string;
  apelido: string | null;
  client_id?: string | null;
}

export interface MercadoLivreApp {
  indice: number;
  conectado: boolean;
  apelido: string | null;
}

export interface MercadoLivreOrder {
  id_pedido: number;
  conta?: MercadoLivreAccount | null;
  codigo_ml?: string;
  data_criacao: string;
  status: string;
  total: number;
  moeda: string;
  vendedor: string | null;
  id_envio: number | null;
  itens: MercadoLivreOrderItem[];
  rastreio: MercadoLivreTracking | null;
  erro_rastreio: string | null;
}

export interface MercadoLivreTrackingResponse {
  paging: { total: number; offset: number; limit: number };
  results: MercadoLivreOrder[];
}

export interface MercadoLivreShipmentEvent {
  status: string;
  substatus: string | null;
  data: string | null;
}

export interface MercadoLivreCarrier {
  nome: string | null;
  url: string | null;
}

export interface MercadoLivreShipmentDetail {
  historico: MercadoLivreShipmentEvent[];
  transportadora: MercadoLivreCarrier | null;
}

export interface MercadoLivreStatus {
  conectado: boolean;
  contas: MercadoLivreAccount[];
  apps: MercadoLivreApp[];
}

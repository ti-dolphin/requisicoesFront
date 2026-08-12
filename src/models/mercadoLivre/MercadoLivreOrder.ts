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

export interface MercadoLivreOrder {
  id_pedido: number;
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
  user_id?: number;
  nickname?: string;
  email?: string;
}

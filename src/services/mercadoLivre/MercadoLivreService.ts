import api from "../../api";
import {
  MercadoLivreStatus,
  MercadoLivreTrackingResponse,
} from "../../models/mercadoLivre/MercadoLivreOrder";

const API_ENDPOINT = "/mercado_livre";

export default class MercadoLivreService {
  static async getStatus(): Promise<MercadoLivreStatus> {
    const response = await api.get<MercadoLivreStatus>(`${API_ENDPOINT}/status`);
    return response.data;
  }

  static async getAuthorizationUrl(): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>(`${API_ENDPOINT}/auth`);
    return response.data;
  }

  static async getTracking(limit = 10): Promise<MercadoLivreTrackingResponse> {
    const response = await api.get<MercadoLivreTrackingResponse>(
      `${API_ENDPOINT}/rastreio`,
      { params: { limit } }
    );
    return response.data;
  }
}

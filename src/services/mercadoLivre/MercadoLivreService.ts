import api from "../../api";
import {
  MercadoLivreShipmentDetail,
  MercadoLivreStatus,
  MercadoLivreTrackingResponse,
} from "../../models/mercadoLivre/MercadoLivreOrder";

const API_ENDPOINT = "/mercado_livre";

export const ML_CALLBACK_STATE = "mercado_livre";

export default class MercadoLivreService {
  static async getStatus(): Promise<MercadoLivreStatus> {
    const response = await api.get<MercadoLivreStatus>(`${API_ENDPOINT}/status`);
    return response.data;
  }

  static async getAuthorizationUrl(): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>(`${API_ENDPOINT}/auth`, {
      params: { state: ML_CALLBACK_STATE },
    });
    return response.data;
  }

  static async connect(code: string): Promise<{ message: string; user_id: number }> {
    const response = await api.get<{ message: string; user_id: number }>(
      `${API_ENDPOINT}/callback`,
      { params: { code } }
    );
    return response.data;
  }

  static async getTracking(limit = 10): Promise<MercadoLivreTrackingResponse> {
    const response = await api.get<MercadoLivreTrackingResponse>(
      `${API_ENDPOINT}/rastreio`,
      { params: { limit } }
    );
    return response.data;
  }

  static async getTrackingByCodes(
    codigos: string[]
  ): Promise<MercadoLivreTrackingResponse> {
    const response = await api.get<MercadoLivreTrackingResponse>(
      `${API_ENDPOINT}/rastreio/codigos`,
      { params: { codigos: codigos.join(",") } }
    );
    return response.data;
  }

  static async getShipmentDetail(
    idEnvio: number
  ): Promise<MercadoLivreShipmentDetail> {
    const response = await api.get<MercadoLivreShipmentDetail>(
      `${API_ENDPOINT}/rastreio/${idEnvio}`
    );
    return response.data;
  }
}

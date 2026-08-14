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

  static async getAuthorizationUrl(app = 1): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>(`${API_ENDPOINT}/auth`, {
      params: { state: ML_CALLBACK_STATE, app },
    });
    return response.data;
  }

  static async connect(
    code: string,
    state?: string
  ): Promise<{ message: string; ml_user_id: string; apelido: string | null }> {
    const response = await api.get<{
      message: string;
      ml_user_id: string;
      apelido: string | null;
    }>(`${API_ENDPOINT}/callback`, { params: { code, state } });
    return response.data;
  }

  static async getTracking(limit = 10): Promise<MercadoLivreTrackingResponse> {
    const response = await api.get<MercadoLivreTrackingResponse>(
      `${API_ENDPOINT}/rastreio`,
      { params: { limit } }
    );
    return response.data;
  }

  static async disconnect(mlUserId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `${API_ENDPOINT}/contas/${mlUserId}`
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

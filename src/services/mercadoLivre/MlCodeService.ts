import api from '../../api';
import { MlCode } from '../../models/mercadoLivre/MlCode';

const API_ENDPOINT = `/codigo_ml_item_requisicao`;

export class MlCodeService {
  static async getByRequisitionItem(id_item_requisicao: number): Promise<MlCode[]> {
    const response = await api.get<MlCode[]>(`${API_ENDPOINT}/${id_item_requisicao}`);
    return response.data;
  }

  static async create(payload: Partial<MlCode>): Promise<MlCode> {
    const response = await api.post(API_ENDPOINT, payload);
    return response.data;
  }

  static async delete(id_codigo_ml: number): Promise<void> {
    await api.delete(`${API_ENDPOINT}/${id_codigo_ml}`);
  }
}

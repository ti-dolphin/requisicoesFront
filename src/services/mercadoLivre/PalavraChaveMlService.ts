import api from '../../api';
import { PalavraChaveMl } from '../../models/mercadoLivre/PalavraChaveMl';

const API_ENDPOINT = `/palavra_chave_ml_item_requisicao`;

export class PalavraChaveMlService {
  static async getByRequisitionItem(id_item_requisicao: number): Promise<PalavraChaveMl[]> {
    const response = await api.get<PalavraChaveMl[]>(`${API_ENDPOINT}/${id_item_requisicao}`);
    return response.data;
  }

  static async create(payload: Partial<PalavraChaveMl>): Promise<PalavraChaveMl> {
    const response = await api.post(API_ENDPOINT, payload);
    return response.data;
  }

  static async delete(id_palavra_chave_ml: number): Promise<void> {
    await api.delete(`${API_ENDPOINT}/${id_palavra_chave_ml}`);
  }
}

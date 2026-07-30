import api from "../../api";
import { OpportunityPendencia } from "../../models/oportunidades/OpportunityPendencia";

const API_ENDPOINT = "/pendencias_oportunidade";

export class OpportunityPendenciaService {
  static async getMany(CODOS: number): Promise<OpportunityPendencia[]> {
    const response = await api.get(API_ENDPOINT, { params: { CODOS } });
    return response.data;
  }

  static async create(data: { CODOS: number; descricao: string; ordem?: number }): Promise<OpportunityPendencia> {
    const response = await api.post(API_ENDPOINT, data);
    return response.data;
  }

  static async update(id_pendencia: number, data: Partial<OpportunityPendencia>): Promise<OpportunityPendencia> {
    const response = await api.put(`${API_ENDPOINT}/${id_pendencia}`, data);
    return response.data;
  }

  static async delete(id_pendencia: number): Promise<void> {
    await api.delete(`${API_ENDPOINT}/${id_pendencia}`);
  }

  static async reordenar(itens: { id_pendencia: number; ordem: number }[]): Promise<void> {
    await api.put(`${API_ENDPOINT}/reordenar`, { itens });
  }
}

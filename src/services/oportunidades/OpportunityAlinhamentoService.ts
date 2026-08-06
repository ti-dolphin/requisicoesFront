import api from "../../api";
import { AlinhamentoChecklist, AlinhamentoItem } from "../../models/oportunidades/OpportunityAlinhamento";

const API_ENDPOINT = "/alinhamento_oportunidade";

export class OpportunityAlinhamentoService {
  static async getMany(CODOS: number): Promise<AlinhamentoChecklist[]> {
    const response = await api.get(API_ENDPOINT, { params: { CODOS } });
    return response.data;
  }

  static async updateItem(id_item: number, data: Partial<AlinhamentoItem>): Promise<AlinhamentoItem> {
    const response = await api.put(`${API_ENDPOINT}/${id_item}`, data);
    return response.data;
  }

  static async reordenar(itens: { id_item: number; ordem: number }[]): Promise<void> {
    await api.put(`${API_ENDPOINT}/reordenar`, { itens });
  }
}

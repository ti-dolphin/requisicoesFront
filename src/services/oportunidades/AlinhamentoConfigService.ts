import api from "../../api";
import { AlinhamentoConfigPessoa } from "../../models/oportunidades/AlinhamentoConfig";
import { AlinhamentoItem } from "../../models/oportunidades/OpportunityAlinhamento";

const API_ENDPOINT = "/alinhamento_config";

export class AlinhamentoConfigService {
  static async getConfig(): Promise<AlinhamentoConfigPessoa[]> {
    const response = await api.get(API_ENDPOINT);
    return response.data;
  }

  static async createItem(id_pessoa: number, data: { descricao: string; ordem?: number }): Promise<AlinhamentoItem> {
    const response = await api.post(`${API_ENDPOINT}/${id_pessoa}/itens`, data);
    return response.data;
  }

  static async updateItem(id_item: number, data: Partial<AlinhamentoItem>): Promise<AlinhamentoItem> {
    const response = await api.put(`${API_ENDPOINT}/itens/${id_item}`, data);
    return response.data;
  }

  static async deleteItem(id_item: number): Promise<void> {
    await api.delete(`${API_ENDPOINT}/itens/${id_item}`);
  }

  static async reordenar(itens: { id_item: number; ordem: number }[]): Promise<void> {
    await api.put(`${API_ENDPOINT}/itens/reordenar`, { itens });
  }
}

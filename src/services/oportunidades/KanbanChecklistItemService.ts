import api from "../../api";
import { KanbanChecklistItem } from "../../models/oportunidades/KanbanChecklistItem";

const API_ENDPOINT = "/item_checklist_oportunidade";

export class KanbanChecklistItemService {
  static async create(data: { id_checklist: number; descricao: string; ordem?: number }): Promise<KanbanChecklistItem> {
    const response = await api.post(API_ENDPOINT, data);
    return response.data;
  }

  static async update(id_item: number, data: Partial<KanbanChecklistItem>): Promise<KanbanChecklistItem> {
    const response = await api.put(`${API_ENDPOINT}/${id_item}`, data);
    return response.data;
  }

  static async delete(id_item: number): Promise<void> {
    await api.delete(`${API_ENDPOINT}/${id_item}`);
  }

  static async reordenar(itens: { id_item: number; ordem: number }[]): Promise<void> {
    await api.put(`${API_ENDPOINT}/reordenar`, { itens });
  }
}

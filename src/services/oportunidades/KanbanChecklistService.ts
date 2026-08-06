import api from "../../api";
import { KanbanChecklist } from "../../models/oportunidades/KanbanChecklist";

const API_ENDPOINT = "/checklist_oportunidade";

export class KanbanChecklistService {
  static async getMany(CODOS: number): Promise<KanbanChecklist[]> {
    const response = await api.get(API_ENDPOINT, { params: { CODOS } });
    return response.data;
  }

  static async aplicarModelo(CODOS: number): Promise<KanbanChecklist[]> {
    const response = await api.post(`${API_ENDPOINT}/aplicar_modelo`, { CODOS });
    return response.data;
  }

  static async create(data: { CODOS: number; nome: string; ordem?: number }): Promise<KanbanChecklist> {
    const response = await api.post(API_ENDPOINT, data);
    return response.data;
  }

  static async update(id_checklist: number, data: Partial<KanbanChecklist>): Promise<KanbanChecklist> {
    const response = await api.put(`${API_ENDPOINT}/${id_checklist}`, data);
    return response.data;
  }

  static async delete(id_checklist: number): Promise<void> {
    await api.delete(`${API_ENDPOINT}/${id_checklist}`);
  }
}

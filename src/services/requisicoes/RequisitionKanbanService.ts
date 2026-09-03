import api from "../../api";
import { RequisitionKanban } from "../../models/requisicoes/RequisitionKanban";

const ENDPOINT = "requisicao_kanban";

const RequisitionKanbanService = {
  async create(data: Partial<RequisitionKanban>): Promise<RequisitionKanban> {
    const response = await api.post<RequisitionKanban>(`/${ENDPOINT}`, data);
    return response.data;
  },

  async getMany(query?: any): Promise<RequisitionKanban[]> {
    const response = await api.get<RequisitionKanban[]>(`/${ENDPOINT}`, {
      params: query,
    });
    return response.data;
  },

  async getById(
    id_kanban_requisicao: number,
  ): Promise<RequisitionKanban | null> {
    try {
      const response = await api.get<RequisitionKanban>(
        `/${ENDPOINT}/${id_kanban_requisicao}}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) return null;
      throw error;
    }
  },

  async update(
    id_kanban_requisicao: number,
    data: Partial<RequisitionKanban>,
  ): Promise<RequisitionKanban> {
    const response = await api.put<RequisitionKanban>(
      `/${ENDPOINT}/${id_kanban_requisicao}`,
      data,
    );
    return response.data;
  },

  async delete(id_kanban_requisicao: number): Promise<void> {
    await api.delete(`/${ENDPOINT}/${id_kanban_requisicao}`);
  },
};

export default RequisitionKanbanService;

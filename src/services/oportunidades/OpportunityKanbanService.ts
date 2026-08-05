import api from "../../api";
import { OpportunityKanbanColumn } from "../../models/oportunidades/OpportunityKanbanColumn";

const API_ENDPOINT = "/kanban_oportunidades";

const OpportunityKanbanService = {
  getColumns: async (): Promise<OpportunityKanbanColumn[]> => {
    const response = await api.get(API_ENDPOINT);
    return response.data;
  },
  updateCardColumn: async (CODOS: number, kanban_column_id: number) => {
    const response = await api.put(`${API_ENDPOINT}/${CODOS}`, { kanban_column_id });
    return response.data;
  },
  createColumn: async (name: string): Promise<OpportunityKanbanColumn> => {
    const response = await api.post(API_ENDPOINT, { name });
    return response.data;
  },
  deleteColumn: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINT}/${id}`);
  },
  renameColumn: async (id: number, name: string): Promise<OpportunityKanbanColumn> => {
    const response = await api.put(`${API_ENDPOINT}/colunas/${id}`, { name });
    return response.data;
  },
  getArchivedCards: async () => {
    const response = await api.get(`${API_ENDPOINT}/arquivados`)
    return response.data
  }
};

export default OpportunityKanbanService;

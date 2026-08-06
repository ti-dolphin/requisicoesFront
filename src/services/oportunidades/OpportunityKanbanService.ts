import api from "../../api";
import { OpportunityKanbanColumn } from "../../models/oportunidades/OpportunityKanbanColumn";
import { KanbanBoardName } from "../../utils/kanbanFlowRules";

const API_ENDPOINT = "/kanban_oportunidades";

const OpportunityKanbanService = {
  getColumns: async (board: KanbanBoardName): Promise<OpportunityKanbanColumn[]> => {
    const response = await api.get(API_ENDPOINT, { params: { board } });
    return response.data;
  },
  updateCardColumn: async (CODOS: number, board: KanbanBoardName, kanban_column_id: number) => {
    const response = await api.put(`${API_ENDPOINT}/${CODOS}`, { board, kanban_column_id });
    return response.data;
  },
  createColumn: async (name: string, board: KanbanBoardName): Promise<OpportunityKanbanColumn> => {
    const response = await api.post(API_ENDPOINT, { name, board });
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

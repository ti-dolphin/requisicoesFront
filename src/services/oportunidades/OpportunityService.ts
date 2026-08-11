import api from "../../api";
import { ReducedUser } from "../../models/User";

const API_ENDPOINT = '/oportunidades';

const OpportunityService = {
    getById: async (CODOS: number) => {
        const response = await api.get(`${API_ENDPOINT}/${CODOS}`);
        return response.data;
    },
    getMany: async (params: any) => {
        const response = await api.get(API_ENDPOINT, {
            params
        });
        return response.data;
    },

    getOppStatusOptions: async () => {
        const response = await api.get(`${API_ENDPOINT}/status/status_oportunidade`);
        return response.data;
    },

    getReportInfo: async () => {
        const response = await api.get(
            `${API_ENDPOINT}/relatorio/verificar_relatorio_semanal`
        );
        return response.data;
    },
    create: async (data: any, params: any) => {
        const response = await api.post(API_ENDPOINT, data, { params });
        return response.data;
    },
    update: async (CODOS: number, data: any, user?: ReducedUser) => {
        // Envia user dentro do body
        const payload = user ? { ...data, user } : data;
        const response = await api.put(`${API_ENDPOINT}/${CODOS}`, payload);
        return response.data;
    },
    delete: async (CODOS: number) => {
        const response = await api.delete(`${API_ENDPOINT}/${CODOS}`);
        return response.data;
    },
    sendSoldOpportunityEmail: async (CODOS: number, data: any, user?: ReducedUser) => {
        // Envia user dentro do body
        const payload = user ? { ...data, user } : data;
        const response = await api.post(`${API_ENDPOINT}/${CODOS}/informar-ganho`, payload);
        return response.data;
    },

    /**
     * Busca propostas semelhantes dentro do mesmo projeto nos últimos 6 meses
     * @param projectId - ID do projeto
     * @param searchTerm - Termo de busca (nome/descrição)
     * @param excludeCodos - CODOS a excluir da busca (opcional)
     * @returns Lista de propostas semelhantes (máximo 10)
     */
    getSimilarOpportunities: async (
        // projectId: number,
        searchTerm: string,
        excludeCodos?: number
    ): Promise<SimilarOpportunity[]> => {
        const params: Record<string, string | number> = {
            searchTerm,
        };
        if (excludeCodos) {
            params.excludeCodos = excludeCodos;
        }
        const response = await api.get(`${API_ENDPOINT}/similar/buscar`, { params });
        return response.data;
    }
}

export interface SimilarOpportunity {
    CODOS: number;
    NOME: string;
    isVinculada: boolean;
}

export default OpportunityService;

import api from '../../api';
import { RequisitionFile } from '../../models/requisicoes/RequisitionFile';

const API_ENDPOINT = '/anexo_requisicao';

export class RequisitionFileService {
    static async getMany(params?: any): Promise<RequisitionFile[]> {
        const response = await api.get<RequisitionFile[]>(API_ENDPOINT, { params });
        return response.data;
    }

    static async getById(id: number): Promise<RequisitionFile> {
        const response = await api.get<RequisitionFile>(`${API_ENDPOINT}/${id}`);
        return response.data;
    }

    static async create(data: Omit<RequisitionFile, 'id' | 'pessoa_criado_por' | 'criado_em'>): Promise<RequisitionFile> {
        const response = await api.post<RequisitionFile>(API_ENDPOINT, data);
        return response.data;
    }

    static async delete(id: number): Promise<void> {
        await api.delete(`${API_ENDPOINT}/${id}`);
    }
}

export default RequisitionFileService;

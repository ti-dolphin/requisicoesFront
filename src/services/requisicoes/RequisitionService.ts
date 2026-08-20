//RequisitionService
import api from "../../api";
import { ReducedUser } from "../../models/User";
import { User } from "../../models/User";

const  API_ENDPOINT = '/requisicoes';

export default class RequisitionService {
  // Defina os métodos para interagir com a API de requisições
  static async getMany(user: User | null, params?: any) {
    const response = await api.get(API_ENDPOINT, {
      params: { user, params },
    });
    return response.data;
  }

  static async getById(id_requisicao: number) {
    const response = await api.get(`${API_ENDPOINT}/${id_requisicao}`);
    return response.data;
  }

  static async getLinkedRequisitions(id_requisicao: number) {
    const response = await api.get(`${API_ENDPOINT}/${id_requisicao}/vinculadas`);
    return response.data;
  }

  static async attend(id_requisicao: number, CODPESSOA: number, items: any) {
    const response = await api.post(
      `${API_ENDPOINT}/${id_requisicao}/atender`,
      { CODPESSOA, items }
    );
    return response.data;
  }

  static async create(data: any) {
    const response = await api.post(API_ENDPOINT, data);
    return response.data;
  }

  static async createFromOther(id_requisicao: number, items: any) {
    const response = await api.post(`${API_ENDPOINT}/parcial/create`, {
      id_requisicao,
      items,
    });
    return response.data;
  }

  static async cancel(id_requisicao: number) {
    const response = await api.put(`${API_ENDPOINT}/${id_requisicao}/cancelar`);
    return response.data;
  }

  static async activate(id_requisicao: number) {
    const response = await api.put(`${API_ENDPOINT}/${id_requisicao}/ativar`);
    return response.data;
  }

  static async update(id_requisicao: number, data: any): Promise<void> {
    await api.put(`${API_ENDPOINT}/${id_requisicao}`, data);
  }

  static async updateStatus(
    id_requisicao: number, 
    data: { 
      id_status_requisicao: number; 
      alterado_por?: number;
      is_reverting?: boolean;
    }
  ) {
    const response = await api.put(
      `${API_ENDPOINT}/${id_requisicao}/status`,
      data
    );
    return response.data;
  }

  static async delete(id_requisicao: number) {
    const response = await api.delete(`${API_ENDPOINT}/${id_requisicao}`);
    return response.data;
  }

  static async getAllFaturamentosTypes(params?: any) {
    const response = await api.get(`${API_ENDPOINT}/faturamentos/tipos`, {
      params,
    });
    return response.data;
  }

  static async updateRequisitionType(id_requisicao: number, id_tipo_faturamento: number, id_status_requisicao: number) {
    const response = await api.put(
      `${API_ENDPOINT}/${id_requisicao}/tipo-faturamento`,
      { id_tipo_faturamento, id_status_requisicao }
    );
    return response.data;
  }

  static async getStatusPermission(id_requisicao: number, user: User | null) {
    const response = await api.get(
      `${API_ENDPOINT}/${id_requisicao}/permissions`,
      {
        params: { user },
      }
    );
    return response.data;
  }

  static async changeRequisitionTypeWithSplit(
    id_requisicao: number,
    id_tipo_faturamento: number,
    id_status_requisicao: number,
    validItemIds: number[]
  ) {
    const response = await api.put(
      `${API_ENDPOINT}/${id_requisicao}/tipo-faturamento/split`,
      { id_tipo_faturamento, id_status_requisicao, validItemIds }
    );
    return response.data;
  }

  static async revertToPreviousStatus(
    id_requisicao: number,
    user: User | null,
    motivo: string
  ) {
    const response = await api.put(
      `${API_ENDPOINT}/${id_requisicao}/status/revert`,
      { motivo },
      { params: { user } }
    );
    return response.data;
  }

  static async revertToInitialStatus(
    id_requisicao: number,
    user: User | null,
    motivo: string
  ) {
    const response = await api.put(
      `${API_ENDPOINT}/${id_requisicao}/status/revert-initial`,
      { motivo },
      { params: { user } }
    );
    return response.data;
  }
}

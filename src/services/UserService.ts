import { User } from '../models/User';
import api from '../api';

const API_URL = '/users'; // ajuste conforme seu backend

export class UserService {

  static async getSupplierAcces (id_cotacao : number, id_requisicao : number) {
      const response = await api.get(`authorization/getSupplierAccess`, { 
          params: {
              id_cotacao,
              id_requisicao
          }
      });
      return response.data;
  }
    static async getById(CODPESSOA: number): Promise<User> {
    const { data } = await api.get<User>(`${API_URL}/${CODPESSOA}`);
    return data;
  }

  static async getMany(params?: Record<string, any>): Promise<User[]> {
    const { data } = await api.get<User[]>(API_URL, { params });
    return data;
  }

  static async getComercialUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>(`${API_URL}/comercial/pessoa_comercial`);
    return data;
  }

  static async login({ LOGIN, SENHA }: { LOGIN: string; SENHA: string }): Promise<{ user: User; token: string }> {
    const { data } = await api.post<{ user: User; token: string }>(`${API_URL}/login`, { LOGIN, SENHA });
    return data;
  }

  static async create(payload: Partial<User>): Promise<User> {
    const { data } = await api.post<User>(API_URL, payload);
    return data;
  }

  static async createByAdmin(payload: Partial<User> & { SENHA: string }): Promise<User> {
    const { data } = await api.post<User>(`${API_URL}/admin/register`, payload);
    return data;
  }

  static async getAllForAdmin(): Promise<User[]> {
    const { data } = await api.get<User[]>(`${API_URL}/admin/all`);
    return data;
  }

  static async updateByAdmin(CODPESSOA: number, payload: Partial<User>): Promise<User> {
    const { data } = await api.put<User>(`${API_URL}/admin/${CODPESSOA}`, payload);
    return data;
  }

  static async setActive(CODPESSOA: number, ATIVO: boolean): Promise<User> {
    const { data } = await api.patch<User>(`${API_URL}/admin/${CODPESSOA}/active`, { ATIVO });
    return data;
  }

  static async update(CODPESSOA: number, payload: Partial<User>): Promise<User> {
    const { data } = await api.put<User>(`${API_URL}/${CODPESSOA}`, payload);
    return data;
  }

  static async delete(CODPESSOA: number): Promise<User> {
    const { data } = await api.delete<User>(`${API_URL}/${CODPESSOA}`);
    return data;
  }

  static async changePassword(CODPESSOA: number, payload: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>(`${API_URL}/${CODPESSOA}/change-password`, payload);
    return data;
  }
}

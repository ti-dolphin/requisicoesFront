//
import api from "../../api";
const API_ENDPOINT = "/item_cotacao";

export class QuoteItemService {
  static getMany = async (params?: any, token?: string) => {
    const config = {
      params,
      ...(token && { headers: { Authorization: token } }),
    };

    const response = await api.get(API_ENDPOINT, config);
    return response.data;
  };

  static getById = async (id_item_cotacao: number, token?: string) => {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.get(`${API_ENDPOINT}/${id_item_cotacao}`, config);
    return response.data;
  };

  static create = async (data: any) => {
    const response = await api.post(API_ENDPOINT, data);
    return response.data;
  };

  static update = async (
    id_item_cotacao: number,
    data: any,
    token?: string
  ): Promise<{ subtotal: number }> => {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.put<{ subtotal: number }>(
      `${API_ENDPOINT}/${id_item_cotacao}`,
      data,
      config
    );
    return response.data;
  };

  static updateFields = async (
    id_item_cotacao: number,
    data: { observacao?: string | null; ICMS?: number },
    token?: string
  ): Promise<void> => {
    const config = token ? { headers: { Authorization: token } } : {};
    await api.put(
      `${API_ENDPOINT}/${id_item_cotacao}/campos`,
      data,
      config
    );
  };

  static delete = async (id_item_cotacao: number) => {
    const response = await api.delete(`${API_ENDPOINT}/${id_item_cotacao}`);
    return response.data;
  };

  static async linkItemToQuote(data : { id_item_requisicao: number,id_cotacao: number } ): Promise<any> {
    const response = await api.post(`${API_ENDPOINT}/vincular-item`, data)
    return response.data
  }
}

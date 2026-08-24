import api from "../../api";


const API_ENDPOINT = '/anexo_cotacao';
export class QuoteFileService {
  static getMany = async (params: any, token?: string) => {
    const config = {
      params,
      ...(token && { headers: { Authorization: token } }),
    };

    const response = await api.get(API_ENDPOINT, config);
    return response.data;
  };

  static getById = async (id_anexo_cotacao: number, token?: string) => {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.get(
      `${API_ENDPOINT}/${id_anexo_cotacao}`,
      config
    );
    return response.data;
  };

  static create = async (data: any, token?: string) => {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.post(API_ENDPOINT, data, config);
    return response.data;
  };

  static delete = async (id_anexo_cotacao: number, token?: string) => {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.delete(
      `${API_ENDPOINT}/${id_anexo_cotacao}`,
      config
    );
    return response.data;
  };
}



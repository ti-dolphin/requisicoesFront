// controle.dse-frontend/src/services/requisicoes/QuoteService.ts
import api from "../../api";
import { PaymentCondition } from "../../models/requisicoes/PaymentCondition";
import { Quote } from "../../models/requisicoes/Quote";
import { ShipmentType } from "../../models/requisicoes/ShipmentType";
import { TaxClassification } from "../../models/requisicoes/TaxClassification";

const API_ENDPOINT = "/cotacoes";

class QuoteService {

  static async getAllQuotesByReq(id_requisicao: number, token?: string): Promise<any> {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.get(`${API_ENDPOINT}/requisicao/${id_requisicao}`, config);
    return response.data;
  }

  static async getMany(params?: any): Promise<any> {
    const response = await api.get(API_ENDPOINT, { params });
    return response.data;
  }

  static async getById(id_cotacao: number, token?: string): Promise<any> {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.get(`${API_ENDPOINT}/${id_cotacao}`, config);
    return response.data;
  }

  static async getTaxClassifications(
    token?: string
  ): Promise<TaxClassification[]> {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.get(
      `${API_ENDPOINT}/cf/classificacoes-fiscais`,
      config
    );
    return response.data;
  }

  static async getShipmentTypes(token?: string): Promise<ShipmentType[]> {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.get(`${API_ENDPOINT}/tf/tipos-frete`, config);
    return response.data;
  }

  static async getPaymentConditions(
    token?: string
  ): Promise<PaymentCondition[]> {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.get(
      `${API_ENDPOINT}/cp/condicoes-pagamento`,
      config
    );
    return response.data;
  }

  static async create(data: any, token?: string): Promise<any> {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.post(API_ENDPOINT, data, config);
    return response.data;
  }

  static async update(
    id_cotacao: number,
    data: any,
    token?: string
  ): Promise<Quote> {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.put(
      `${API_ENDPOINT}/${id_cotacao}`,
      data,
      config
    );
    return response.data;
  }

  static async delete(id_cotacao: number, token?: string): Promise<any> {
    const config = token ? { headers: { Authorization: token } } : {};
    const response = await api.delete(`${API_ENDPOINT}/${id_cotacao}`, config);
    return response.data;
  }

}

export default QuoteService;

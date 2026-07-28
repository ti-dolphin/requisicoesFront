import api from '../../api';
import { RequisitionItem } from '../../models/requisicoes/RequisitionItem';

const API_ENDPOINT = '/item_requisicao';

export class RequisitionItemService {
  static async getMany(params?: any): Promise<RequisitionItem[]> {
    const response = await api.get<RequisitionItem[]>(API_ENDPOINT, { params });
    return response.data;
  }

  static async getById(id: number): Promise<RequisitionItem> {
    const response = await api.get<RequisitionItem>(`${API_ENDPOINT}/${id}`);
    return response.data;
  }

  static async getDinamicColumns(id_requisicao: number) {
    const response = await api.get(`${API_ENDPOINT}/columns/${id_requisicao}`);
    return response.data;
  }

  static async create(
    data: Omit<RequisitionItem, "id_item_requisicao">
  ): Promise<RequisitionItem> {
    const response = await api.post<RequisitionItem>(API_ENDPOINT, data);
    return response.data;
  }

  static async createMany(
    productIds: number[],
    id_requisicao: number
  ): Promise<number[]> {
    const response = await api.post(`${API_ENDPOINT}/many`, productIds, {
      params: { id_requisicao },
    });
    return response.data;
  }

  static async update(
    id: number,
    data: Partial<Omit<RequisitionItem, "id_item_requisicao">>
  ): Promise<RequisitionItem> {
    const response = await api.put<RequisitionItem>(
      `${API_ENDPOINT}/${id}`,
      data
    );
    return response.data;
  }

  static async updateQuoteItemsSelected(
    id_item_requisicao: number,
    id_item_cotacao: number | null
  ): Promise<{ updated: boolean }> {
    const response = await api.put(
      `${API_ENDPOINT}/itens_cotacao_selecionados/update`,
      { id_item_requisicao, id_item_cotacao }
    );
    return response.data;
  }

  static async recalculateQuoteItemsTotals(
    id_requisicao: number
  ): Promise<{ custo_total_itens: number; custo_total_frete: number }> {
    const response = await api.put(
      `${API_ENDPOINT}/itens_cotacao_selecionados/totais`,
      {},
      {
        params: { id_requisicao },
      }
    );
    return response.data;
  }

  static async updateOCS(
    ids: number[],
    oc: number
  ): Promise<RequisitionItem[]> {
    const response = await api.put<RequisitionItem[]>(
      `${API_ENDPOINT}/ocs/update`,
      {
        ids,
        oc: Number(oc),
      }
    );
    return response.data;
  }

  static updateShippingDate = async (ids: number[], date: string) => {
    const response = await api.put(`${API_ENDPOINT}/shipping_date/update`, {
      ids,
      date,
    });
    return response.data;
  };

  static async delete(id: number): Promise<void> {
    await api.delete(`${API_ENDPOINT}/${id}`);
  }
}

export default RequisitionItemService;

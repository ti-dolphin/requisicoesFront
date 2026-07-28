import api from '../../api';
import { RequisitionItemAttachment } from '../../models/requisicoes/RequisitionItemAttachment';

const API_ENDPOINT = `/anexo_item_requisicao`;
export class RequisitionItemAttachmentService {
  static async getByRequisitionItem(id_item_requisicao: number, tipo?: number): Promise<RequisitionItemAttachment[]> {
    const response = await api.get<RequisitionItemAttachment[]>(`${API_ENDPOINT}/${id_item_requisicao}`, { params: { tipo } });
    return response.data;
  }

  static async getById(id: number): Promise<RequisitionItemAttachment> {
    const response = await api.get<RequisitionItemAttachment>(
      `${API_ENDPOINT}/${id}`
    );
    return response.data;
  }

  static async create(
    attachment: Partial<RequisitionItemAttachment>
  ): Promise<RequisitionItemAttachment> {
    const response = await api.post(API_ENDPOINT, attachment);
    return response.data;
  }

  static async update(
    id: number,
    attachment: RequisitionItemAttachment
  ): Promise<RequisitionItemAttachment> {
    const response = await api.put(`${API_ENDPOINT}/${id}`, attachment);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`${API_ENDPOINT}/${id}`);
  }
}

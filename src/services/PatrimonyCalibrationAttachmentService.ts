import api from '../api';

export interface PatrimonyCalibrationAttachment {
  id: number;
  id_patrimonio_calibracao: number;
  nome_arquivo: string;
  arquivo: string;
}

export interface CreatePatrimonyCalibrationAttachmentPayload {
  id_patrimonio: number;
  nome_arquivo: string;
  arquivo: string;
}

class PatrimonyCalibrationAttachmentService {
  static async create(
    payload: CreatePatrimonyCalibrationAttachmentPayload
  ): Promise<PatrimonyCalibrationAttachment> {
    const response = await api.post('/anexos-patrimonio-calibracao', payload);
    return response.data;
  }

  static async getMany(
    id_patrimonio: number
  ): Promise<PatrimonyCalibrationAttachment[]> {
    const response = await api.get(
      `/anexos-patrimonio-calibracao/patrimonio/${id_patrimonio}`
    );
    return response.data;
  }

  static async getById(id: number): Promise<PatrimonyCalibrationAttachment> {
    const response = await api.get(`/anexos-patrimonio-calibracao/${id}`);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/anexos-patrimonio-calibracao/${id}`);
  }
}

export default PatrimonyCalibrationAttachmentService;
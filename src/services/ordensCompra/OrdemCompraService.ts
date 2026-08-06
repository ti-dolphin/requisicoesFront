import apiLocal from "../../apiLocal";
import { OrdemCompraFilters } from "../../redux/slices/ordensCompra/ordemCompraTableSlice";

const API_ENDPOINT = "/ordem_de_compra";

interface OrdemCompraQuery {
  searchTerm: string;
  filters: OrdemCompraFilters;
  page: number;
  pageSize: number;
}

// Identidade e permissoes (login, codGerente, permDiretor) sao derivadas do
// token JWT no servidor — nao devem ser enviadas pelo cliente.
interface ApprovalPayload {
  approved: boolean;
}

interface DirectorApprovalPayload {
  approved: boolean;
}

interface BatchApprovalPayload extends ApprovalPayload {
  ids: number[];
}

interface BatchDirectorApprovalPayload extends DirectorApprovalPayload {
  ids: number[];
}

export interface BatchApprovalResult {
  total: number;
  succeeded: { idMov: number; result: any }[];
  failed: { idMov: number; message: string }[];
}

const OrdemCompraService = {
  getMany: async ({ searchTerm, filters, page, pageSize }: OrdemCompraQuery) => {
    const response = await apiLocal.get(API_ENDPOINT, {
      params: {
        searchTerm,
        filters: JSON.stringify(filters || {}),
        page,
        pageSize,
      },
    });
    return response.data;
  },
  getRequisitionsByOc: async (numeroMovimento: string | number) => {
    const response = await apiLocal.get(
      `${API_ENDPOINT}/${encodeURIComponent(String(numeroMovimento))}/requisicoes`
    );
    return response.data;
  },
  updateApproval: async (id: number, payload: ApprovalPayload) => {
    const response = await apiLocal.patch(`${API_ENDPOINT}/${id}/approval`, payload);
    return response.data;
  },
  updateDirectorApproval: async (id: number, payload: DirectorApprovalPayload) => {
    const response = await apiLocal.patch(`${API_ENDPOINT}/${id}/director-approval`, payload);
    return response.data;
  },
  updateApprovalBatch: async (payload: BatchApprovalPayload): Promise<BatchApprovalResult> => {
    const response = await apiLocal.patch(`${API_ENDPOINT}/approval/batch`, payload);
    return response.data;
  },
  updateDirectorApprovalBatch: async (
    payload: BatchDirectorApprovalPayload
  ): Promise<BatchApprovalResult> => {
    const response = await apiLocal.patch(`${API_ENDPOINT}/director-approval/batch`, payload);
    return response.data;
  },
};

export default OrdemCompraService;

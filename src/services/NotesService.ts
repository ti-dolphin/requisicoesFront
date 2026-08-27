import api from '../api';
import { NotesFilters } from '../redux/slices/apontamentos/notesTableSlice';
import { PontoFilters } from '../redux/slices/apontamentos/pontoTableSlice';
import { ProblemaFilters } from '../redux/slices/apontamentos/problemaTableSlice';

export interface NotesQueryParams {
  searchTerm?: string;
  filters?: NotesFilters;
  page?: number;
  pageSize?: number;
}

export interface PontoQueryParams {
  searchTerm?: string;
  filters?: PontoFilters;
  page?: number;
  pageSize?: number;
}

export interface ProblemaQueryParams {
  searchTerm?: string;
  filters?: ProblemaFilters;
  page?: number;
  pageSize?: number;
}

export interface TomadoresFilters {
    NOME_FUNCIONARIO?: string;
    NOME_CENTRO_CUSTO?: string;
    CODCCUSTO?: string;
    CODLIDER?: string;
    DATA_DE?: string;
    DATA_ATE?: string;
    ATIVOS?: boolean;
}

export interface TomadoresQueryParams {
    searchTerm?: string;
    filters?: TomadoresFilters;
    page?: number;
    pageSize?: number;
    all?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

const NotesService = {
    getMany: async (params?: NotesQueryParams) => {
        const queryParams: Record<string, any> = {};
        
        if (params?.filters) {
            // Mapear filtros para parâmetros da API
            if (params.filters.CODAPONT) queryParams.CODAPONT = params.filters.CODAPONT;
            if (params.filters.CHAPA) queryParams.CHAPA = params.filters.CHAPA;
            if (params.filters.COMPETENCIA) queryParams.COMPETENCIA = params.filters.COMPETENCIA;
            if (params.filters.CODSITUACAO) queryParams.CODSITUACAO = params.filters.CODSITUACAO;
            if (params.filters.CODSTATUSAPONT_IN?.length) {
                queryParams.CODSTATUSAPONT_IN = params.filters.CODSTATUSAPONT_IN.join(',');
            }
            if (params.filters.NOME_FUNCIONARIO) queryParams.NOME_FUNCIONARIO = params.filters.NOME_FUNCIONARIO;
            if (params.filters.NOME_FUNCAO) queryParams.NOME_FUNCAO = params.filters.NOME_FUNCAO;
            if (params.filters.NOME_CENTRO_CUSTO) queryParams.NOME_CENTRO_CUSTO = params.filters.NOME_CENTRO_CUSTO;
            if (params.filters.DESCRICAO_STATUS) queryParams.DESCRICAO_STATUS = params.filters.DESCRICAO_STATUS;
            if (params.filters.NOME_LIDER) queryParams.NOME_LIDER = params.filters.NOME_LIDER;
            if (params.filters.NOME_GERENTE) queryParams.NOME_GERENTE = params.filters.NOME_GERENTE;
            if (params.filters.DATA_DE) queryParams.DATA_DE = params.filters.DATA_DE;
            if (params.filters.DATA_ATE) queryParams.DATA_ATE = params.filters.DATA_ATE;
            if (params.filters.ATIVOS) queryParams.ATIVOS = params.filters.ATIVOS;
            if (params.filters.COMENTADOS) queryParams.COMENTADOS = params.filters.COMENTADOS;
            if (params.filters.SEM_ASSIDUIDADE) queryParams.SEM_ASSIDUIDADE = params.filters.SEM_ASSIDUIDADE;
        }
        
        if (params?.searchTerm) {
            queryParams.searchTerm = params.searchTerm;
        }
        
        if (params?.page !== undefined) {
            queryParams.page = params.page;
        }
        
        if (params?.pageSize !== undefined) {
            queryParams.pageSize = params.pageSize;
        }
        
        const response = await api.get('/notes', { params: queryParams });
        return response.data;
    },

    getManyPonto: async (params?: PontoQueryParams) => {
        const queryParams: Record<string, any> = {};
        
        if (params?.filters) {
            if (params.filters.CODAPONT) queryParams.CODAPONT = params.filters.CODAPONT;
            if (params.filters.CHAPA) queryParams.CHAPA = params.filters.CHAPA;
            if (params.filters.NOME_FUNCIONARIO) queryParams.NOME_FUNCIONARIO = params.filters.NOME_FUNCIONARIO;
            if (params.filters.CODSTATUSAPONT) queryParams.CODSTATUSAPONT = params.filters.CODSTATUSAPONT;
            if (params.filters.DESCRICAO_STATUS) queryParams.DESCRICAO_STATUS = params.filters.DESCRICAO_STATUS;
            if (params.filters.CODCCUSTO) queryParams.CODCCUSTO = params.filters.CODCCUSTO;
            if (params.filters.NOME_CENTRO_CUSTO) queryParams.NOME_CENTRO_CUSTO = params.filters.NOME_CENTRO_CUSTO;
            if (params.filters.CODLIDER) queryParams.CODLIDER = params.filters.CODLIDER;
            if (params.filters.NOME_LIDER) queryParams.NOME_LIDER = params.filters.NOME_LIDER;
            if (params.filters.COMPETENCIA) queryParams.COMPETENCIA = params.filters.COMPETENCIA;
            if (params.filters.DATA_DE) queryParams.DATA_DE = params.filters.DATA_DE;
            if (params.filters.DATA_ATE) queryParams.DATA_ATE = params.filters.DATA_ATE;
            if (params.filters.VERIFICADO) queryParams.VERIFICADO = params.filters.VERIFICADO;
            if (params.filters.PROBLEMA) queryParams.PROBLEMA = params.filters.PROBLEMA;
            if (params.filters.AJUSTADO) queryParams.AJUSTADO = params.filters.AJUSTADO;
            if (params.filters.ATIVOS) queryParams.ATIVOS = params.filters.ATIVOS;
            if (params.filters.MOTIVO_PROBLEMA) queryParams.MOTIVO_PROBLEMA = params.filters.MOTIVO_PROBLEMA;
        }
        
        if (params?.searchTerm) {
            queryParams.searchTerm = params.searchTerm;
        }
        
        if (params?.page !== undefined) {
            queryParams.page = params.page;
        }
        
        if (params?.pageSize !== undefined) {
            queryParams.pageSize = params.pageSize;
        }
        
        const response = await api.get('/notes/ponto', { params: queryParams });
        return response.data;
    },

    getManyProblema: async (params?: ProblemaQueryParams) => {
        const queryParams: Record<string, any> = {};
        
        if (params?.filters) {
            if (params.filters.CODAPONT) queryParams.CODAPONT = params.filters.CODAPONT;
            if (params.filters.CHAPA) queryParams.CHAPA = params.filters.CHAPA;
            if (params.filters.NOME_FUNCIONARIO) queryParams.NOME_FUNCIONARIO = params.filters.NOME_FUNCIONARIO;
            if (params.filters.CODSTATUSAPONT) queryParams.CODSTATUSAPONT = params.filters.CODSTATUSAPONT;
            if (params.filters.DESCRICAO_STATUS) queryParams.DESCRICAO_STATUS = params.filters.DESCRICAO_STATUS;
            if (params.filters.CODCCUSTO) queryParams.CODCCUSTO = params.filters.CODCCUSTO;
            if (params.filters.NOME_CENTRO_CUSTO) queryParams.NOME_CENTRO_CUSTO = params.filters.NOME_CENTRO_CUSTO;
            if (params.filters.NOME_GERENTE) queryParams.NOME_GERENTE = params.filters.NOME_GERENTE;
            if (params.filters.NOME_LIDER) queryParams.NOME_LIDER = params.filters.NOME_LIDER;
            if (params.filters.COMPETENCIA) queryParams.COMPETENCIA = params.filters.COMPETENCIA;
            if (params.filters.DATA_DE) queryParams.DATA_DE = params.filters.DATA_DE;
            if (params.filters.DATA_ATE) queryParams.DATA_ATE = params.filters.DATA_ATE;
            if (params.filters.ATIVOS) queryParams.ATIVOS = params.filters.ATIVOS;
            if (params.filters.COMENTADO) queryParams.COMENTADO = params.filters.COMENTADO;
            if (params.filters.MOTIVO_PROBLEMA) queryParams.MOTIVO_PROBLEMA = params.filters.MOTIVO_PROBLEMA;
            if (params.filters.JUSTIFICATIVA) queryParams.JUSTIFICATIVA = params.filters.JUSTIFICATIVA;
        }
        
        if (params?.searchTerm) {
            queryParams.searchTerm = params.searchTerm;
        }
        
        if (params?.page !== undefined) {
            queryParams.page = params.page;
        }
        
        if (params?.pageSize !== undefined) {
            queryParams.pageSize = params.pageSize;
        }
        
        const response = await api.get('/notes/problema', { params: queryParams });
        return response.data;
    },

    getTomadores: async (params?: TomadoresQueryParams) => {
        const queryParams: Record<string, any> = {};

        if (params?.filters) {
            if (params.filters.NOME_FUNCIONARIO) queryParams.NOME_FUNCIONARIO = params.filters.NOME_FUNCIONARIO;
            if (params.filters.NOME_CENTRO_CUSTO) queryParams.NOME_CENTRO_CUSTO = params.filters.NOME_CENTRO_CUSTO;
            if (params.filters.CODCCUSTO) queryParams.CODCCUSTO = params.filters.CODCCUSTO;
            if (params.filters.CODLIDER) queryParams.CODLIDER = params.filters.CODLIDER;
            if (params.filters.DATA_DE) queryParams.DATA_DE = params.filters.DATA_DE;
            if (params.filters.DATA_ATE) queryParams.DATA_ATE = params.filters.DATA_ATE;
            if (params.filters.ATIVOS !== undefined) queryParams.ATIVOS = params.filters.ATIVOS;
        }

        if (params?.searchTerm) {
            queryParams.searchTerm = params.searchTerm;
        }

        if (params?.page !== undefined) {
            queryParams.page = params.page;
        }

        if (params?.pageSize !== undefined) {
            queryParams.pageSize = params.pageSize;
        }

        if (params?.all) {
            queryParams.all = true;
        }

        const response = await api.get('/notes/tomadores', { params: queryParams });
        return response.data;
    },

    getCentroCustos: async (ativos: boolean = true) => {
        const response = await api.get('/notes/centro-custos', { params: { ativos } });
        return response.data;
    },

    getStatusApontamento: async () => {
        const response = await api.get('/notes/status-apontamento');
        return response.data;
    },

    getLideres: async () => {
        const response = await api.get('/notes/lideres');
        return response.data;
    },

    updateBatch: async (codaponts: number[], data: {
        CODSTATUSAPONT?: string;
        CODCCUSTO?: string;
        CODLIDER?: number;
        MODIFICADOPOR?: string;
        updateOnlyEmptyCentroCusto?: boolean;
        updateOnlyEmptyLider?: boolean;
        updateOnlyEmptyStatus?: boolean;
        apontamentosInfo?: { CODAPONT: number; DATA: string; CHAPA: string }[];
    }) => {
        const response = await api.put('/notes/batch', { codaponts, ...data });
        return response.data;
    },

    updatePontoField: async (codapont: number, field: string, value: boolean | string) => {
        const response = await api.patch(`/notes/ponto/${codapont}`, { field, value });
        return response.data;
    },

    updateFolgaCampoByFuncionario: async (chapa: string, dataUltimaFolgaDeCampo: string | null) => {
        const response = await api.patch('/notes/folga-campo/funcionario', {
            chapa,
            dataUltimaFolgaDeCampo,
        });
        return response.data;
    },

    /**
     * Busca todos os apontamentos com filtros aplicados (sem paginação)
     * Usado para exportação de dados
     */
    getAllForExport: async (params?: Omit<NotesQueryParams, 'page' | 'pageSize'>) => {
        const queryParams: Record<string, any> = {};
        
        if (params?.filters) {
            if (params.filters.CODAPONT) queryParams.CODAPONT = params.filters.CODAPONT;
            if (params.filters.CHAPA) queryParams.CHAPA = params.filters.CHAPA;
            if (params.filters.COMPETENCIA) queryParams.COMPETENCIA = params.filters.COMPETENCIA;
            if (params.filters.CODSITUACAO) queryParams.CODSITUACAO = params.filters.CODSITUACAO;
            if (params.filters.CODSTATUSAPONT_IN?.length) {
                queryParams.CODSTATUSAPONT_IN = params.filters.CODSTATUSAPONT_IN.join(',');
            }
            if (params.filters.NOME_FUNCIONARIO) queryParams.NOME_FUNCIONARIO = params.filters.NOME_FUNCIONARIO;
            if (params.filters.NOME_FUNCAO) queryParams.NOME_FUNCAO = params.filters.NOME_FUNCAO;
            if (params.filters.NOME_CENTRO_CUSTO) queryParams.NOME_CENTRO_CUSTO = params.filters.NOME_CENTRO_CUSTO;
            if (params.filters.DESCRICAO_STATUS) queryParams.DESCRICAO_STATUS = params.filters.DESCRICAO_STATUS;
            if (params.filters.NOME_LIDER) queryParams.NOME_LIDER = params.filters.NOME_LIDER;
            if (params.filters.NOME_GERENTE) queryParams.NOME_GERENTE = params.filters.NOME_GERENTE;
            if (params.filters.DATA_DE) queryParams.DATA_DE = params.filters.DATA_DE;
            if (params.filters.DATA_ATE) queryParams.DATA_ATE = params.filters.DATA_ATE;
            if (params.filters.ATIVOS) queryParams.ATIVOS = params.filters.ATIVOS;
            if (params.filters.COMENTADOS) queryParams.COMENTADOS = params.filters.COMENTADOS;
            if (params.filters.SEM_ASSIDUIDADE) queryParams.SEM_ASSIDUIDADE = params.filters.SEM_ASSIDUIDADE;
        }
        
        if (params?.searchTerm) {
            queryParams.searchTerm = params.searchTerm;
        }
        
        // Buscar todos os registros sem paginação
        queryParams.all = true;
        
        const response = await api.get('/notes', { params: queryParams });
        return response.data;
    },
};

export default NotesService;

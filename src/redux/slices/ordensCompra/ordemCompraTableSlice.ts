import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { OrdemCompra } from "../../../models/OrdemCompra";

export interface OrdemCompraFilters {
  ID: string;
  COLIGADA: string;
  COD_CENTRO_CUSTO: string;
  CENTRO_CUSTO: string;
  NUMERO_MOVIMENTO: string;
  DATA_EMISSAO: string;
  DATA_EMISSAO_FROM?: string;
  DATA_EMISSAO_TO?: string;
  DATA_ENTREGA: string;
  VALOR_BRUTO: string;
  FORNECEDOR: string;
  FORNECEDOR_NOME_FANTASIA: string;
  APPROVAL_STATUS?: "PENDING" | "APPROVED" | "ALL";
  SCOPE?: "MY" | "ALL";
  CODGERENTE?: string | number | null;
}

export interface OrdemCompraTableState {
  searchTerm: string;
  loading: boolean;
  rows: OrdemCompra[];
  filters: OrdemCompraFilters;
  page: number;
  pageSize: number;
  total: number;
}

const getDefaultDateRange = () => {
  const now = DateTime.utc();
  const start = DateTime.utc(now.year - 1, 1, 1, 0, 0, 0);
  return {
    from: start.toISO() || "",
    to: now.toISO() || "",
  };
};

const defaultRange = getDefaultDateRange();

const defaultFilters: OrdemCompraFilters = {
  ID: "",
  COLIGADA: "",
  COD_CENTRO_CUSTO: "",
  CENTRO_CUSTO: "",
  NUMERO_MOVIMENTO: "",
  DATA_EMISSAO: "",
  DATA_EMISSAO_FROM: defaultRange.from,
  DATA_EMISSAO_TO: defaultRange.to,
  DATA_ENTREGA: "",
  VALOR_BRUTO: "",
  FORNECEDOR: "",
  FORNECEDOR_NOME_FANTASIA: "",
  APPROVAL_STATUS: "PENDING",
  SCOPE: "MY",
  CODGERENTE: null,
};

const initialState: OrdemCompraTableState = {
  searchTerm: "",
  loading: false,
  rows: [],
  filters: defaultFilters,
  page: 0,
  pageSize: 25,
  total: 0,
};

const ordemCompraTableSlice = createSlice({
  name: "ordemCompraTable",
  initialState,
  reducers: {
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setRows(state, action: PayloadAction<OrdemCompra[]>) {
      state.rows = action.payload;
    },
    setFilters(state, action: PayloadAction<OrdemCompraFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = defaultFilters;
      state.page = 0;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
    },
    setTotal(state, action: PayloadAction<number>) {
      state.total = action.payload;
    },
  },
});

export const {
  setSearchTerm,
  setLoading,
  setRows,
  setFilters,
  clearFilters,
  setPage,
  setPageSize,
  setTotal,
} = ordemCompraTableSlice.actions;

export default ordemCompraTableSlice.reducer;

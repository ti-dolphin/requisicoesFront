import React, { createContext, useState } from "react";
import { OpportunityInfo } from "../types"; // Certifique-se de que este caminho está correto

// Tipagem para o contexto de OpportunityInfo
interface OpportunityInfoContextType {
  filteredRows: OpportunityInfo[]; // Linhas filtradas
  columnFilters: { dataKey: string; filterValue: string }[]; // Filtros aplicados nas colunas
  creatingOpportunity: boolean; // Estado para criar oportunidades
  refreshOpportunityInfo: boolean; // Estado para forçar atualização
  toggleCreatingOpportunity: () => void; // Função para alternar criação de oportunidade
  toggleRefreshOpportunityInfo: () => void; // Função para alternar atualização
  changeFilteredRows: (rows: OpportunityInfo[]) => void; // Atualizar linhas filtradas
  changeColumnFilters: (
    filters: { dataKey: string; filterValue: string }[]
  ) => void; // Atualizar filtros
}

// Tipagem para as props do Provider

// Estado inicial para os filtros de coluna
const defaultColumnFilters = [
  { dataKey: "numero_projeto", filterValue: "" },
  { dataKey: "numero_adicional", filterValue: "" },
  { dataKey: "status", filterValue: "" },
  { dataKey: "descricao_projeto", filterValue: "" },
  { dataKey: "cliente", filterValue: "" },
  { dataKey: "data_cadastro", filterValue: "" },
  { dataKey: "data_solicitacao", filterValue: "" },
  { dataKey: "data_envio_proposta", filterValue: "" },
  { dataKey: "data_fechamento", filterValue: "" },
  { dataKey: "vendedor", filterValue: "" },
  { dataKey: "gerente", filterValue: "" },
  { dataKey: "coordenador", filterValue: "" },
];

interface OpportunityInfoProviderProps {
  children: React.ReactNode;
}

// Criação do contexto
export const OpportunityInfoContext = createContext<OpportunityInfoContextType>(
  {
    filteredRows: [],
    columnFilters: defaultColumnFilters,
    creatingOpportunity: false,
    refreshOpportunityInfo: false,
    toggleCreatingOpportunity: () => {},
    toggleRefreshOpportunityInfo: () => {},
    changeFilteredRows: () => {},
    changeColumnFilters: () => {},
  }
);

// Implementação do Provider
export const OpportunityInfoProvider = ({ children}: OpportunityInfoProviderProps) => {
  const [filteredRows, setFilteredRows] = useState<OpportunityInfo[]>([]);
  const [columnFilters, setColumnFilters] = useState(defaultColumnFilters);
  const [creatingOpportunity, setCreatingOpportunity] = useState(false);
  const [refreshOpportunityInfo, setRefreshOpportunityInfo] = useState(false);

  const toggleCreatingOpportunity = () => {
    setCreatingOpportunity((prev) => !prev);
  };

  const toggleRefreshOpportunityInfo = () => {
    setRefreshOpportunityInfo((prev) => !prev);
  };

  const changeFilteredRows = (rows: OpportunityInfo[]) => {
    setFilteredRows(rows);
  };

  const changeColumnFilters = (
    filters: { dataKey: string; filterValue: string }[]
  ) => {
    setColumnFilters(filters);
  };

  return (
    <OpportunityInfoContext.Provider
      value={{
        filteredRows,
        columnFilters,
        creatingOpportunity,
        refreshOpportunityInfo,
        toggleCreatingOpportunity,
        toggleRefreshOpportunityInfo,
        changeFilteredRows,
        changeColumnFilters,
      }}
    >
      {children}
    </OpportunityInfoContext.Provider>
  );
};

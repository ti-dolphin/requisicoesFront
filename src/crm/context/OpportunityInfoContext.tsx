/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from "react";
import { DateFilter, OpportunityInfo } from "../types"; // Certifique-se de que este caminho está correto

// Tipagem para o filtro de datas

// Tipagem para o contexto de OpportunityInfo
interface OpportunityInfoContextType {
  filteredRows: OpportunityInfo[]; // Linhas filtradas
  columnFilters: { dataKey: string; filterValue: string }[]; // Filtros aplicados nas colunas
  dateFilters: DateFilter[]; // Filtros de datas
  creatingOpportunity: boolean; // Estado para criar oportunidades
  refreshOpportunityInfo: boolean; // Estado para forçar atualização
  finishedOppsEnabled: boolean;
  setFinishedOppsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCreatingOpportunity: () => void; // Função para alternar criação de oportunidade
  toggleRefreshOpportunityInfo: () => void; // Função para alternar atualização
  changeFilteredRows: (rows: OpportunityInfo[]) => void; // Atualizar linhas filtradas
  changeColumnFilters: (
    filters: { dataKey: string; filterValue: string }[]
  ) => void; // Atualizar filtros
  setDateFilters: React.Dispatch<React.SetStateAction<DateFilter[]>>; // Atualizar filtros de data
}

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

// Estado inicial para os filtros de datas

export const defaultDateFilters = [
  { dateFilterKey: "data_inicio", from: "", to: "", dbField: "DATAINICIO" },
  {
    dateFilterKey: "data_interacao",
    from: "",
    to: "",
    dbField: "DATAINTERACAO",
  },
  {
    dateFilterKey: "data_fechamento",
    from: "",
    to: "",
    dbField: "DATAENTREGA",
  },
];

interface OpportunityInfoProviderProps {
  children: React.ReactNode;
}

// Criação do contexto
export const OpportunityInfoContext = createContext<OpportunityInfoContextType>(
  {
    filteredRows: [],
    columnFilters: defaultColumnFilters,
    dateFilters: defaultDateFilters,
    finishedOppsEnabled: false,
    creatingOpportunity: false,
    refreshOpportunityInfo: false,
    setFinishedOppsEnabled: () => {},
    toggleCreatingOpportunity: () => {},
    toggleRefreshOpportunityInfo: () => {},
    changeFilteredRows: () => {},
    changeColumnFilters: () => {},
    setDateFilters: () => {},
  }
);

// Implementação do Provider
export const OpportunityInfoProvider = ({
  children,
}: OpportunityInfoProviderProps) => {
  const [filteredRows, setFilteredRows] = useState<OpportunityInfo[]>([]);
  const [columnFilters, setColumnFilters] = useState(defaultColumnFilters);
  const [dateFilters, setDateFilters] =
    useState<DateFilter[]>(defaultDateFilters);
  const [creatingOpportunity, setCreatingOpportunity] = useState(false);
  const [refreshOpportunityInfo, setRefreshOpportunityInfo] = useState(false);
  const [finishedOppsEnabled, setFinishedOppsEnabled] = useState(false);

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
        dateFilters,
        setDateFilters,
        creatingOpportunity,
        refreshOpportunityInfo,
        toggleCreatingOpportunity,
        toggleRefreshOpportunityInfo,
        changeFilteredRows,
        changeColumnFilters,
        finishedOppsEnabled,
        setFinishedOppsEnabled,
      }}
    >
      {children}
    </OpportunityInfoContext.Provider>
  );
};

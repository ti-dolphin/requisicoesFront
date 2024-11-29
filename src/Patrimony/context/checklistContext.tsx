/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState } from "react";
import { MovementationChecklist } from "../types";

interface checklistContextType {
  refreshChecklist: boolean;
  toggleRefreshChecklist: () => void;
  deletingChecklist: [boolean, MovementationChecklist?];
  toggleDeletingChecklist: (checklist?: MovementationChecklist) => void;
  checklistItemsOpen: [boolean, MovementationChecklist?];
  toggleChecklistItemsOpen: (checklist?: MovementationChecklist) => void;
  deletingCheckListItem: boolean;
  toggleDeletingCheckListItem: (checkListItem: MovementationChecklist) => void;
  checklistOpen: [boolean, MovementationChecklist?];
  toggleChecklistOpen: (checklist?: MovementationChecklist) => void;
  setChecklistOpen: React.Dispatch<
    React.SetStateAction<[boolean, MovementationChecklist?]>
  >;
  currentColumnFilters: { dataKey: string; filterValue: string }[]; // Novo estado
  setCurrentColumnFilters: React.Dispatch<
    React.SetStateAction<{ dataKey: string; filterValue: string }[]>
  >; // Atualizador para o estado
}

interface checklistContextProviderProps {
  children: React.ReactNode;
}

export const checklistContext = createContext<checklistContextType>({
  refreshChecklist: false,
  toggleRefreshChecklist: () => {},
  deletingChecklist: [false],
  toggleDeletingChecklist: () => {},
  checklistItemsOpen: [false],
  toggleChecklistItemsOpen: () => {},
  deletingCheckListItem: false,
  toggleDeletingCheckListItem: () => {},
  checklistOpen: [false],
  toggleChecklistOpen: () => {},
  setChecklistOpen: () => {},
  currentColumnFilters: [], // Inicialmente vazio
  setCurrentColumnFilters: () => {}, // Função vazia
});

export const ChecklistContextProvider: React.FC<
  checklistContextProviderProps
> = ({ children }) => {
  const [refreshChecklist, setRefreshChecklist] = useState(false);
  const [deletingChecklist, setDeletingChecklist] = useState<
    [boolean, MovementationChecklist?]
  >([false]);
  const [checklistItemsOpen, setChecklistItemsOpen] = useState<
    [boolean, MovementationChecklist?]
  >([false]);
  const [deletingCheckListItem, setDeletingCheckListItem] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState<
    [boolean, MovementationChecklist?]
  >([false]); // Renamed state
  const [currentColumnFilters, setCurrentColumnFilters] = useState<
    { dataKey: string; filterValue: string }[]
  >([
    { dataKey: "id_patrimonio", filterValue: "" }, // Valor inicial
    { dataKey: "data_criacao", filterValue: "" },
    { dataKey: "realizado", filterValue: "" },
    { dataKey: "data_realizado", filterValue: "" },
    { dataKey: "aprovado", filterValue: "" },
    { dataKey: "reprovado", filterValue: "" },
    { dataKey: "data_aprovado", filterValue: "" },
    { dataKey: "observacao", filterValue: "" },
    { dataKey: "nome", filterValue: "" },
    { dataKey: "nome_responsavel", filterValue: "" },
    { dataKey: "responsavel_tipo", filterValue: "" },
    { dataKey: "id_patrimonio", filterValue: "" },
    { dataKey: "responsavel_movimentacao", filterValue: "" },
    { dataKey: "nome_patrimonio", filterValue: "" },
    { dataKey: "descricao_projeto", filterValue: "" },
    { dataKey: "id_checklist_movimentacao", filterValue: "" },
    { dataKey: "id_movimentacao" , filterValue: ''},
  ]);

  const toggleDeletingChecklist = (checklist?: MovementationChecklist) => {
    if (checklist) {
      setDeletingChecklist([true, checklist]);
      return;
    }
    setDeletingChecklist([false]);
  };

  const toggleRefreshChecklist = () => {
    setRefreshChecklist(!refreshChecklist);
  };

  const toggleChecklistItemsOpen = (checklist?: MovementationChecklist) => {
    if (checklist) {
      setChecklistItemsOpen([true, checklist]);
      return;
    }
    setChecklistItemsOpen([false]);
  };

  const toggleDeletingCheckListItem = (
    checkListItem?: MovementationChecklist
  ) => {
    if (checkListItem) {
      setDeletingCheckListItem(true);
      return;
    }
    setDeletingCheckListItem(false);
  };

  const toggleChecklistOpen = (checklist?: MovementationChecklist) => {
    if (checklist) {
      setChecklistOpen([true, checklist]); // Updated logic
      return;
    }
    setChecklistOpen([false]); // Updated logic
  };

  return (
    <checklistContext.Provider
      value={{
        refreshChecklist,
        toggleRefreshChecklist,
        deletingChecklist,
        toggleDeletingChecklist,
        checklistItemsOpen,
        toggleChecklistItemsOpen,
        deletingCheckListItem,
        toggleDeletingCheckListItem,
        checklistOpen, // Updated value
        toggleChecklistOpen, // Updated function
        setChecklistOpen, // Updated dispatch function
        currentColumnFilters, // Novo estado
        setCurrentColumnFilters, // Atualizador para o novo estado
      }}
    >
      {children}
    </checklistContext.Provider>
  );
};

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
  currentColumnFilters: { dataKey: string; filterValue: string }[];
  setCurrentColumnFilters: React.Dispatch<
    React.SetStateAction<{ dataKey: string; filterValue: string }[]>
  >;

  // Novos estados
  filteredNotificationsByUser: MovementationChecklist[];
  setFilteredNotificationsByUser: React.Dispatch<
    React.SetStateAction<MovementationChecklist[]>
  >;
  currentStatusFilterSelected: string;
  setCurrentStatusFilterSelected: React.Dispatch<React.SetStateAction<string>>;
  currentFilteredByStatus: MovementationChecklist[];
  setCurrentFilteredByStatus: React.Dispatch<
    React.SetStateAction<MovementationChecklist[]>
  >;
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
  currentColumnFilters: [],
  setCurrentColumnFilters: () => {},

  // Valores iniciais para os novos estados
  filteredNotificationsByUser: [],
  setFilteredNotificationsByUser: () => {},
  currentStatusFilterSelected: "",
  setCurrentStatusFilterSelected: () => {},
  currentFilteredByStatus: [],
  setCurrentFilteredByStatus: () => {},
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
  >([false]);
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
    { dataKey: "id_movimentacao", filterValue: "" },
  ]);

  // Novos estados
  const [filteredNotificationsByUser, setFilteredNotificationsByUser] =
    useState<MovementationChecklist[]>([]);
  const [currentStatusFilterSelected, setCurrentStatusFilterSelected] =
    useState<string>("");
  const [currentFilteredByStatus, setCurrentFilteredByStatus] = useState<
    MovementationChecklist[]
  >([]);

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
      setChecklistOpen([true, checklist]);
      return;
    }
    setChecklistOpen([false]);
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
        checklistOpen,
        toggleChecklistOpen,
        setChecklistOpen,
        currentColumnFilters,
        setCurrentColumnFilters,

        // Novos estados e funções
        filteredNotificationsByUser,
        setFilteredNotificationsByUser,
        currentStatusFilterSelected,
        setCurrentStatusFilterSelected,
        currentFilteredByStatus,
        setCurrentFilteredByStatus,
      }}
    >
      {children}
    </checklistContext.Provider>
  );
};

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
  checklistOpen: [boolean, MovementationChecklist?]; // Renamed state
  toggleChecklistOpen: (checklist?: MovementationChecklist) => void; // Renamed function
  setChecklistOpen: React.Dispatch<
    React.SetStateAction<[boolean, MovementationChecklist?]>
  >; // Renamed dispatch function
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
  checklistOpen: [false], // Updated default value
  toggleChecklistOpen: () => {}, // Renamed default no-op function
  setChecklistOpen: () => {}, // Updated default no-op function
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
      }}
    >
      {children}
    </checklistContext.Provider>
  );
};

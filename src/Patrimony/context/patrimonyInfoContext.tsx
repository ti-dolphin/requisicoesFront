import React, { createContext, useState } from "react";
import {
  Patrimony,
  PatrimonyAccessory,
  PatrimonyAccessoryFile,
} from "../types";

interface PatrimonyInfoContextType {
  refreshPatrimonyInfo: boolean;
  refreshPatrimonyAccessory: boolean;
  refreshPatrimonyAccessoryFiles: boolean; // Novo estado para arquivos
  creatingPatrimonyInfo: [boolean, Patrimony?];
  creatingPatrimonyAccessory: boolean;
  deletingPatrimonyAccessory: [boolean, PatrimonyAccessory?];
  deletingPatrimonyAccessoryFile: [boolean, PatrimonyAccessoryFile?];
  currentFilter: string;
  toggleRefreshPatrimonyInfo: () => void;
  toggleRefreshPatrimonyAccessory: () => void;
  toggleRefreshPatrimonyAccessoryFiles: () => void; // Nova função
  toggleCreatingPatrimonyInfo: () => void;
  changeCreatingPatrimonyInfo: (patrimony?: Patrimony) => void;
  setCurrentFilter: (filter: string) => void;
  toggleCreatingPatrimonyAccessory: () => void;
  toggleDeletingPatrimonyAccessory: (
    isDeleting: boolean,
    accessory?: PatrimonyAccessory
  ) => void;
  toggleDeletingPatrimonyAccessoryFile: (file?: PatrimonyAccessoryFile) => void;
}

interface PatrimonyInfoContextProviderProps {
  children: React.ReactNode;
}

export const PatrimonyInfoContext = createContext<PatrimonyInfoContextType>({
  refreshPatrimonyInfo: false,
  refreshPatrimonyAccessory: false,
  refreshPatrimonyAccessoryFiles: false, // Inicialize o novo estado
  creatingPatrimonyInfo: [false],
  creatingPatrimonyAccessory: false,
  deletingPatrimonyAccessory: [false],
  deletingPatrimonyAccessoryFile: [false],
  currentFilter: "Ativos",
  toggleRefreshPatrimonyInfo: () => {},
  toggleRefreshPatrimonyAccessory: () => {},
  toggleRefreshPatrimonyAccessoryFiles: () => {}, // Inicialize a nova função
  toggleCreatingPatrimonyInfo: () => {},
  changeCreatingPatrimonyInfo: () => {},
  setCurrentFilter: () => {},
  toggleCreatingPatrimonyAccessory: () => {},
  toggleDeletingPatrimonyAccessory: () => {},
  toggleDeletingPatrimonyAccessoryFile: () => {},
});

export const PatrimonyInfoContextProvider = ({
  children,
}: PatrimonyInfoContextProviderProps) => {
  const [refreshPatrimonyInfo, setRefreshPatrimonyInfo] =
    useState<boolean>(false);
  const [refreshPatrimonyAccessory, setRefreshPatrimonyAccessory] =
    useState<boolean>(false);
  const [refreshPatrimonyAccessoryFiles, setRefreshPatrimonyAccessoryFiles] = // Novo estado
    useState<boolean>(false);
  const [creatingPatrimonyInfo, setCreatingPatrimonyInfo] = useState<
    [boolean, Patrimony?]
  >([false]);
  const [creatingPatrimonyAccessory, setCreatingPatrimonyAccessory] =
    useState<boolean>(false);
  const [deletingPatrimonyAccessory, setDeletingPatrimonyAccessory] = useState<
    [boolean, PatrimonyAccessory?]
  >([false]);
  const [deletingPatrimonyAccessoryFile, setDeletingPatrimonyAccessoryFile] =
    useState<[boolean, PatrimonyAccessoryFile?]>([false]);
  const [currentFilter, setCurrentFilter] = useState<string>("Meus");

  const toggleCreatingPatrimonyInfo = () => {
    setCreatingPatrimonyInfo(creatingPatrimonyInfo[0] ? [false] : [true]);
  };

  const changeCreatingPatrimonyInfo = (patrimony?: Patrimony) => {
    if(patrimony){ 
      setCreatingPatrimonyInfo([true, patrimony]);
      return 
    }
    setCreatingPatrimonyInfo([true]);
  };

  const toggleRefreshPatrimonyInfo = () => {
    setRefreshPatrimonyInfo((prev) => !prev);
  };

  const toggleRefreshPatrimonyAccessory = () => {
    setRefreshPatrimonyAccessory((prev) => !prev);
  };

  const toggleRefreshPatrimonyAccessoryFiles = () => {
    // Nova função
    setRefreshPatrimonyAccessoryFiles((prev) => !prev);
  };

  const toggleCreatingPatrimonyAccessory = () => {
    setCreatingPatrimonyAccessory((prev) => !prev);
  };

  const toggleDeletingPatrimonyAccessory = (
    isDeleting: boolean,
    accessory?: PatrimonyAccessory
  ) => {
    setDeletingPatrimonyAccessory([isDeleting, accessory]);
  };

  const toggleDeletingPatrimonyAccessoryFile = (
    file?: PatrimonyAccessoryFile
  ) => {
    if (file) {
      setDeletingPatrimonyAccessoryFile([true, file]);
      return;
    }
    setDeletingPatrimonyAccessoryFile([false]);
  };

  return (
    <PatrimonyInfoContext.Provider
      value={{
        refreshPatrimonyInfo,
        refreshPatrimonyAccessory,
        refreshPatrimonyAccessoryFiles, // Prover o novo estado
        toggleRefreshPatrimonyInfo,
        toggleRefreshPatrimonyAccessory,
        toggleRefreshPatrimonyAccessoryFiles, // Prover a nova função
        toggleCreatingPatrimonyInfo,
        creatingPatrimonyInfo,
        changeCreatingPatrimonyInfo,
        creatingPatrimonyAccessory,
        toggleCreatingPatrimonyAccessory,
        deletingPatrimonyAccessory,
        toggleDeletingPatrimonyAccessory,
        deletingPatrimonyAccessoryFile,
        toggleDeletingPatrimonyAccessoryFile,
        currentFilter,
        setCurrentFilter,
      }}
    >
      {children}
    </PatrimonyInfoContext.Provider>
  );
};

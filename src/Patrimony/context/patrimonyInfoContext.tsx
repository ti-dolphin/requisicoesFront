import React, { createContext, useState } from "react";
import { Patrimony } from "../types";

interface PatrimonyInfoContextType {
  refreshPatrimonyInfo: boolean;
  creatingPatrimonyInfo: [boolean, Patrimony?];
  currentFilter: string;
  toggleRefreshPatrimonyInfo: () => void;
  toggleCreatingPatrimonyInfo: () => void;
  changeCreatingPatrimonyInfo: (patrimony: Patrimony) => void;
  setCurrentFilter: (filter: string) => void;
}

interface PatrimonyInfoContextProviderProps {
  children: React.ReactNode;
}

export const PatrimonyInfoContext = createContext<PatrimonyInfoContextType>({
  refreshPatrimonyInfo: false,
  creatingPatrimonyInfo: [false],
  currentFilter: "Ativos",
  toggleRefreshPatrimonyInfo: () => {},
  toggleCreatingPatrimonyInfo: () => {},
  changeCreatingPatrimonyInfo: () => {},
  setCurrentFilter: () => {},
});

export const PatrimonyInfoContextProvider = ({
  children,
}: PatrimonyInfoContextProviderProps) => {
  const [refreshPatrimonyInfo, setRefreshPatrimonyInfo] =
    useState<boolean>(false);
  const [creatingPatrimonyInfo, setCreatingPatrimonyInfo] = useState<
    [boolean, Patrimony?]
  >([false]);
  const [currentFilter, setCurrentFilter] = useState<string>("Ativos");

  const toggleCreatingPatrimonyInfo = () => {
    setCreatingPatrimonyInfo(creatingPatrimonyInfo[0] ? [false] : [true]);
  };

  const changeCreatingPatrimonyInfo = (patrimony: Patrimony) => {
    setCreatingPatrimonyInfo([true, patrimony]);
  };

  const toggleRefreshPatrimonyInfo = () => {
    setRefreshPatrimonyInfo((prev) => !prev);
  };

  return (
    <PatrimonyInfoContext.Provider
      value={{
        refreshPatrimonyInfo,
        toggleRefreshPatrimonyInfo,
        toggleCreatingPatrimonyInfo,
        creatingPatrimonyInfo,
        changeCreatingPatrimonyInfo,
        currentFilter,
        setCurrentFilter,
      }}
    >
      {children}
    </PatrimonyInfoContext.Provider>
  );
};

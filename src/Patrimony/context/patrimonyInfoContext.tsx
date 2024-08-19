import React, { createContext, useState } from "react";
import { Patrimony } from "../types";

interface PatrimonyInfoContextType {
  refreshPatrimonyInfo: boolean;
  creatingPatrimonyInfo: [boolean, Patrimony?];
  toggleRefreshPatrimonyInfo: () => void;
  toggleCreatingPatrimonyInfo: () => void;
  changeCreatingPatrimonyInfo: (patrimony: Patrimony) => void;
}

interface PatrimonyInfoContextProviderProps {
  children: React.ReactNode;
}

export const PatrimonyInfoContext = createContext<PatrimonyInfoContextType>({
  refreshPatrimonyInfo: false,
  creatingPatrimonyInfo: [false],
  toggleRefreshPatrimonyInfo: () => {},
  toggleCreatingPatrimonyInfo: ( ) => {},
  changeCreatingPatrimonyInfo: ( ) => {},
});

export const PatrimonyInfoContextProvider = ({children}: PatrimonyInfoContextProviderProps) => {
  const [refreshPatrimonyInfo, setRefreshPatrimonyInfo] = useState<boolean>(false);
  const [creatingPatrimonyInfo, setCreatingPatrimonyInfo] = useState<[boolean, Patrimony?]>([false]);

  const toggleCreatingPatrimonyInfo = ( ) =>  {
    console.log("toggleCreatingPatrimonyInfo");
    setCreatingPatrimonyInfo(
      creatingPatrimonyInfo[0] ? [false] : [true]
    );
  };
  const changeCreatingPatrimonyInfo = (patrimony : Patrimony ) => { 
          setCreatingPatrimonyInfo([true, patrimony]);
  }

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
      }}
    >
      {children}
    </PatrimonyInfoContext.Provider>
  );
};

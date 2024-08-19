import React, { createContext, useState } from "react";
import { Movementation } from "../types";

interface MovimentationContextType {
  refreshMovimentation: boolean;
  editingMovementationObservation: [boolean, Movementation?];
  creatingMovementation : boolean;
  deletingMovementation : [boolean, Movementation?],
  toggleCreatingMovementation : ( ) => void;
  toggleRefreshMovimentation: () => void;
  togglEditingMovementationObservation : (isEditing : boolean, movementation? : Movementation) => void;
  toggleDeletingMovementation : (movementation? : Movementation ) => void;
}

interface MovimentationContextProviderProps {
  children: React.ReactNode;
}

export const MovimentationContext = createContext<MovimentationContextType>({
  refreshMovimentation: false,
  editingMovementationObservation: [false],
  creatingMovementation: false,
  deletingMovementation: [false],
  toggleRefreshMovimentation: () => {},
  toggleCreatingMovementation: () => {},
  togglEditingMovementationObservation: () => {},
  toggleDeletingMovementation : ( ) =>  { },
});

export const MovimentationContextProvider = ({
  children,
}: MovimentationContextProviderProps) => {
  const [refreshMovimentation, setRefreshMovimentation] = useState<boolean>(false);
  const [editingMovementationObservation, setEditingMovementationObservation] = useState<[boolean, Movementation?]>([false]);
  const [creatingMovementation, setCreatingMovementation ] = useState<boolean>(false);
  const [deletingMovementation, setDeletingMovementation] = useState<[boolean, Movementation?]>([false]);

  const toggleDeletingMovementation = (movementation? : Movementation ) => { 
      setDeletingMovementation(movementation ? [true, movementation] : [false]);
  };

  const toggleCreatingMovementation = ( ) => { 
      setCreatingMovementation(previous => !previous);
  }
  
  const togglEditingMovementationObservation = (isEditing : boolean, movementation? : Movementation ) => { 
      setEditingMovementationObservation(isEditing ? [true, movementation] : [false]);
  }

  const toggleRefreshMovimentation = () => {
    setRefreshMovimentation((prev) => !prev);
  };

  return (
    <MovimentationContext.Provider
      value={{
        refreshMovimentation,
        deletingMovementation,
        creatingMovementation,
        editingMovementationObservation,
        toggleRefreshMovimentation,
        toggleDeletingMovementation,
        togglEditingMovementationObservation,
        toggleCreatingMovementation
      }}
    >
      {children}
    </MovimentationContext.Provider>
  );
};

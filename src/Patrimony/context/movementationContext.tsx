import React, { createContext, useState } from "react";
import { Movementation } from "../types";

interface MovimentationContextType {
  refreshMovimentation: boolean;
  editingMovementationObservation: [boolean, Movementation?];
  creatingMovementation: boolean;
  deletingMovementation: [boolean, Movementation?];
  acceptingMovimentation?: Movementation;
  toggleCreatingMovementation: () => void;
  toggleRefreshMovimentation: () => void;
  togglEditingMovementationObservation: (
    isEditing: boolean,
    movementation?: Movementation
  ) => void;
  toggleDeletingMovementation: (movementation?: Movementation) => void;
  toggleAcceptingMovimentation: (movementation?: Movementation) => void;
}

interface MovimentationContextProviderProps {
  children: React.ReactNode;
}

export const MovimentationContext = createContext<MovimentationContextType>({
  refreshMovimentation: false,
  editingMovementationObservation: [false],
  creatingMovementation: false,
  deletingMovementation: [false],
  acceptingMovimentation: undefined,
  toggleRefreshMovimentation: () => {},
  toggleCreatingMovementation: () => {},
  togglEditingMovementationObservation: () => {},
  toggleDeletingMovementation: () => {},
  toggleAcceptingMovimentation: () => {},
});

export const MovimentationContextProvider = ({
  children,
}: MovimentationContextProviderProps) => {
  const [refreshMovimentation, setRefreshMovimentation] =
    useState<boolean>(false);
  const [editingMovementationObservation, setEditingMovementationObservation] =
    useState<[boolean, Movementation?]>([false]);
  const [creatingMovementation, setCreatingMovementation] =
    useState<boolean>(false);
  const [deletingMovementation, setDeletingMovementation] = useState<
    [boolean, Movementation?]
  >([false]);
  const [acceptingMovimentation, setAcceptingMovimentation] = useState<
    Movementation | undefined
  >(undefined);

  const toggleDeletingMovementation = (movementation?: Movementation) => {
    setDeletingMovementation(movementation ? [true, movementation] : [false]);
  };

  const toggleCreatingMovementation = () => {
    setCreatingMovementation((prev) => !prev);
  };

  const togglEditingMovementationObservation = (
    isEditing: boolean,
    movementation?: Movementation
  ) => {
    setEditingMovementationObservation(
      isEditing ? [true, movementation] : [false]
    );
  };

  const toggleRefreshMovimentation = () => {
    setRefreshMovimentation((prev) => !prev);
  };

  const toggleAcceptingMovimentation = (movementation?: Movementation) => {
    setAcceptingMovimentation(movementation);
  };

  return (
    <MovimentationContext.Provider
      value={{
        refreshMovimentation,
        deletingMovementation,
        creatingMovementation,
        editingMovementationObservation,
        acceptingMovimentation,
        toggleRefreshMovimentation,
        toggleDeletingMovementation,
        togglEditingMovementationObservation,
        toggleCreatingMovementation,
        toggleAcceptingMovimentation,
      }}
    >
      {children}
    </MovimentationContext.Provider>
  );
};

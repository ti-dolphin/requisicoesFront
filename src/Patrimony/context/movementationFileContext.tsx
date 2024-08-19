import React, { createContext, useState } from "react";
import { MovementationFile } from "../types";

interface MovementationFileContextType {
  refreshMovementationFile: boolean;
  movementationFileOpen: [boolean, number?];
  movementationId?: number;
  movementationFiles: MovementationFile[];
  toggleMovementationFileOpen: (momvementationId?: number) => void;
  toggleRefreshMovementationFile: () => void;
  deletingMovimentationFile: [boolean, MovementationFile?];
  toggleDeletingMovimentationFile: (
    isDeleting: boolean,
    movementationFile?: MovementationFile
  ) => void;
  changeMovementationFiles: (files: MovementationFile[]) => void;
}

interface MovementationFileContextProviderProps {
  children: React.ReactNode;
}

export const MovementationFileContext = createContext<MovementationFileContextType>({
  refreshMovementationFile: false,
  movementationFileOpen: [false],
  movementationFiles : [],
  toggleMovementationFileOpen: () => {},
  toggleRefreshMovementationFile: () => {},
  deletingMovimentationFile: [false],
  toggleDeletingMovimentationFile: () => {},
  changeMovementationFiles : ( ) =>  { }
});

export const MovementationFileContextProvider = ({
  children,
}: MovementationFileContextProviderProps) => {
  const [movementationFileOpen, setMovementationFileOpen] = useState<[boolean, number?]>([false]);
  const [refreshMovementationFile, setRefreshMovementationFile] = useState<boolean>(false);
  const [deletingMovimentationFile, setDeletingMovimentationFile ] = useState<[boolean, MovementationFile?]>([false]);  
  const [movementationFiles, setMovementationFiles] = useState<MovementationFile[]>([]);


  const changeMovementationFiles = (files: MovementationFile[] ) =>  { 
    setMovementationFiles([...files]);
  }

  const toggleMovementationFileOpen = (momvementationId? : number ) =>  {
      setMovementationFileOpen(
        movementationFileOpen[0] ? [false] : [true, momvementationId]
      );
  }   
  const toggleDeletingMovimentationFile =  (isDeleting : boolean, movementationFile ? : MovementationFile) =>  {
    setDeletingMovimentationFile(isDeleting ? [true, movementationFile] : [false]);
  }

  const toggleRefreshMovementationFile = () => {
    setRefreshMovementationFile((prev) => !prev);
  };

  return (
    <MovementationFileContext.Provider
      value={{
        refreshMovementationFile,
        movementationFileOpen,
        deletingMovimentationFile,
        movementationFiles,
        changeMovementationFiles,
        toggleMovementationFileOpen,
        toggleRefreshMovementationFile,
        toggleDeletingMovimentationFile,
      }}
    >
      {children}
    </MovementationFileContext.Provider>
  );
};

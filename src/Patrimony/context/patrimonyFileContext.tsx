import React, { createContext, useState } from "react";
import { PatrimonyFile } from "../types";

interface PatrimonyFileContextType {
  refreshPatrimonyFile: boolean;
  patrimonyFileOpen: [boolean, number?];
  patrimonyId?: number;
  patrimonyFiles: PatrimonyFile[];
  togglePatrimonyFileOpen: (patrimonyId?: number) => void;
  toggleRefreshPatrimonyFile: () => void;
  deletingPatrimonyFile: [boolean, PatrimonyFile?];
  toggleDeletingPatrimonyFile: (
    isDeleting: boolean,
    patrimonyFile?: PatrimonyFile
  ) => void;
  changePatrimonyFiles: (files: PatrimonyFile[]) => void;
}

interface PatrimonyFileContextProviderProps {
  children: React.ReactNode;
}

export const PatrimonyFileContext = createContext<PatrimonyFileContextType>({
  refreshPatrimonyFile: false,
  patrimonyFileOpen: [false],
  patrimonyFiles: [],
  togglePatrimonyFileOpen: () => {},
  toggleRefreshPatrimonyFile: () => {},
  deletingPatrimonyFile: [false],
  toggleDeletingPatrimonyFile: () => {},
  changePatrimonyFiles: () => {},
});

export const PatrimonyFileContextProvider = ({
  children,
}: PatrimonyFileContextProviderProps) => {
  const [patrimonyFileOpen, setPatrimonyFileOpen] = useState<
    [boolean, number?]
  >([false]);
  const [refreshPatrimonyFile, setRefreshPatrimonyFile] =
    useState<boolean>(false);
  const [deletingPatrimonyFile, setDeletingPatrimonyFile] = useState<
    [boolean, PatrimonyFile?]
  >([false]);
  const [patrimonyFiles, setPatrimonyFiles] = useState<PatrimonyFile[]>([]);

  const changePatrimonyFiles = (files: PatrimonyFile[]) => {
    setPatrimonyFiles([...files]);
  };

  const togglePatrimonyFileOpen = (patrimonyId?: number) => {
    setPatrimonyFileOpen(patrimonyFileOpen[0] ? [false] : [true, patrimonyId]);
  };

  const toggleDeletingPatrimonyFile = (
    isDeleting: boolean,
    patrimonyFile?: PatrimonyFile
  ) => {
    console.log("toggleDeletingPatrimonyFile");
    setDeletingPatrimonyFile(isDeleting ? [true, patrimonyFile] : [false]);
  };

  const toggleRefreshPatrimonyFile = () => {
    setRefreshPatrimonyFile((prev) => !prev);
  };

  return (
    <PatrimonyFileContext.Provider
      value={{
        refreshPatrimonyFile,
        patrimonyFileOpen,
        deletingPatrimonyFile,
        patrimonyFiles,
        changePatrimonyFiles,
        togglePatrimonyFileOpen,
        toggleRefreshPatrimonyFile,
        toggleDeletingPatrimonyFile,
      }}
    >
      {children}
    </PatrimonyFileContext.Provider>
  );
};

import { createContext, useState } from "react";


export interface User {
  CODPESSOA: number;
  CODGERENTE?: number;
  PERM_REQUISITAR?: number;
  PERM_CADASTRAR_PAT: number;
  PERM_COMPRADOR?: number;
  PERM_ADMINISTRADOR? : number;
  PERM_DIRETOR?: number;
  NOME? : string;
  responsavel_tipo?: number;
}
interface userContextType {
  logedIn: boolean;
  user?: User;
  defineUser : (user : User ) => void;
  toggleLogedIn:  (value : boolean) => void;
}
interface userContextProviderProps {
    children: React.ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
export const userContext = createContext<userContextType>({
  logedIn: window.localStorage.getItem("token") ? true : false,
  toggleLogedIn:  () => {},
  defineUser : ( ) => {}
});

export const UserContextProvider = ({ children }: userContextProviderProps) => {
  const [logedIn, setLogedIn] = useState<boolean>(
    window.localStorage.getItem("token") ? true : false
  );
  const [user, setUser] = useState<User | undefined>(
    window.localStorage.getItem("user")
      ? JSON.parse(window.localStorage.getItem("user") || "")
      : undefined
  );
  const toggleLogedIn = (value: boolean) => {
    setLogedIn(value);
  };
  const defineUser = (user: User) => {
    setUser(user);
  };
  return (
    <userContext.Provider
      value={
        user
          ? { user, logedIn, toggleLogedIn, defineUser }
          : { logedIn, toggleLogedIn, defineUser }
      }
    >
      {children}
    </userContext.Provider>
  );
};

import { createContext, useState } from "react";

interface userContextType {
  logedIn: boolean;
  toggleLogedIn: (value: boolean) => void;
}

interface userContextProviderProps {
    children: React.ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
export const userContext = createContext<userContextType>({
  logedIn: window.localStorage.getItem("token") ? true : false,
  toggleLogedIn: () => {},
});

export const UserContextProvider = ({ children } : userContextProviderProps) => { 
    const [logedIn, setLogedIn ] = useState<boolean>(window.localStorage.getItem('token') ? true : false);
    const toggleLogedIn  = (value : boolean ) => setLogedIn(value);

    return ( 
        <userContext.Provider value={{ logedIn, toggleLogedIn }}>
            { children }
        </userContext.Provider>
    )
}

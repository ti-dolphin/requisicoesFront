import React, { createContext, useState } from 'react';
import { Item } from '../types';

interface ItemsContextType {
    editing: [boolean, Item?];
    adding: boolean;
    changing: [boolean, Item?];
    toggleEditing: (item?: Item) => void;
    toggleChanging: (item?: Item) => void;
    toggleAdding: () => void;

}

export const ItemsContext = createContext<ItemsContextType>({ 
    editing : [false],
    adding : false,
    changing : [false],
    toggleEditing: ( ) => { },
    toggleChanging : ( ) => { },
    toggleAdding : ( ) => {},
});
interface ItemsContextProviderProps{ 
    children : React.ReactNode;
}
export const ItemsContextProvider = ({ children }: ItemsContextProviderProps) => { 
    const [editing, setEditing] = useState<[boolean, Item? ]>([false]);
    const [adding, setAdding ] = useState<boolean>(false);
    const [changing, setChanging] = useState<[boolean, Item?]>([false]);
    const toggleEditing = (item? : Item ) => setEditing(editing[0] ? [!editing] : [!editing, item ]);
    const toggleChanging = (item? : Item ) => { 
        setChanging(changing[0] ? [!changing] : [!changing , item])
    }
    const toggleAdding = () => setAdding(!adding);

    return( 
        <ItemsContext.Provider value={{editing, adding, changing, toggleAdding, toggleChanging, toggleEditing}}>
            {children}
        </ItemsContext.Provider>
    )
}

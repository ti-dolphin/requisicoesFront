import React, { createContext, useState } from "react";
import { Item } from "../types";

interface ItemsContextType {
  editing: [boolean, Item?];
  adding: boolean;
  changing: [boolean, Item?];
  deleting: [boolean, Item?];
  editingObservation: [boolean, Item?];
  selection: {
    items: Item[];
  };
  refreshItems: boolean;
  toggleEditingObservation: (item?: Item) => void;
  toggleEditing: (item?: Item) => void;
  toggleChanging: (item?: Item) => void;
  toggleAdding: () => void;
  toggleDeleting: (item?: Item) => void;
  setEditing: (value: [boolean, Item?]) => void;
  setEditingObservation: (value: [boolean, Item?]) => void;
  toggleRefreshItems: () => void;
  changeSelection: (items?: Item[]) => void;
  productIdList: number[];
  setProductIdList: React.Dispatch<React.SetStateAction<number[]>>;
}

export const ItemsContext = createContext<ItemsContextType>({
  productIdList: [],
  refreshItems: false,
  editing: [false],
  adding: false,
  changing: [false],
  deleting: [false],
  editingObservation: [false],
  selection: { items: [] },
  toggleEditing: () => {},
  toggleChanging: () => {},
  toggleAdding: () => {},
  setEditing: () => {},
  toggleDeleting: () => {},
  toggleEditingObservation: () => {},
  setEditingObservation: () => {},
  toggleRefreshItems: () => {},
  changeSelection: () => {},
  setProductIdList: () =>{}
});
interface ItemsContextProviderProps {
  children: React.ReactNode;
}
export const ItemsContextProvider = ({
  children,
}: ItemsContextProviderProps) => {
  const [editing, setEditing] = useState<[boolean, Item?]>([false]);
  const [adding, setAdding] = useState<boolean>(false);
  const [changing, setChanging] = useState<[boolean, Item?]>([false]);
  const [deleting, setDeleting] = useState<[boolean, Item?]>([false]);
  const [selection, setSelection] = useState<{ items: Item[] }>({ items: [] });
  const [editingObservation, setEditingObservation] = useState<
    [boolean, Item?]
  >([false]);
  const [refreshItems, setRefresh] = useState<boolean>(false);
  const [productIdList, setProductIdList] = useState<number[]>([]);

  const changeSelection = (items?: Item[]) => {
    if (items) {
      setSelection({ items: [...items] });
      return;
    }
    setSelection({ items: [] });
  };

  const toggleRefreshItems = () => {
    console.log("toggleRefresh ", !refreshItems);
    setRefresh(!refreshItems);
  };

  const toggleEditing = (item?: Item) => {
    setEditing(editing[0] ? [false] : [true, item]);
  };
  const toggleChanging = (item?: Item) => {
    console.log(
      "toggleChangingItem: ",
      changing[0] ? [!changing] : [!changing[0], item]
    );
    setChanging(changing[0] ? [!changing[0]] : [!changing[0], item]);
  };
  const toggleAdding = () => {
    console.log("toggleAdding: ", !adding);
    setAdding(!adding);
  };

  const toggleDeleting = (item?: Item) => {
    setDeleting(deleting[0] ? [false] : [true, item]);
  };
  const toggleEditingObservation = (item?: Item) => {
    setEditingObservation(
      editingObservation[0] ? [false] : [!editingObservation[0], item]
    );
  };
  return (
    <ItemsContext.Provider
      value={{
        editing,
        adding,
        changing,
        deleting,
        selection,
        editingObservation,
        refreshItems,
        toggleAdding,
        toggleChanging,
        toggleEditing,
        setEditing,
        toggleDeleting,
        toggleEditingObservation,
        setEditingObservation,
        toggleRefreshItems,
        changeSelection,
        productIdList,
        setProductIdList
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

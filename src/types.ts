

import { Dispatch, SetStateAction } from "react";
import { Item } from "./utils";

export interface addRequisitionModalProps {
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
}

export interface AddRequisitionFormProps {
  setIsCreating : (value : boolean) =>void;
}

export interface DeleteRequisitionModalProps{ 
    isDeleteRequisitionModalOpen : boolean;
    setIsDeleteRequisitionModalOpen : (value: boolean) => void;
    handleDelete : (  id: number) => void;
    requisitionId : number;
}

export interface ProductsTableModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  requisitionID: number;
  setIsCreating: (value : boolean ) => void;
}

export interface RequisitionTableProps { 
  isCreating: boolean;
}

export interface ProductsTableProps {
  ID_REQUISICAO: number;
  setIsCreating: (value: boolean) => void;
  setRequisitionItems?: (value: Item[]) => void;
  requistionItems?: Item[];
  isOpen? : boolean;
  setIsOpen? : (value : boolean) => void;
}

export const motionItemsVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: "-100%" },
};

export interface SearchAppBarProps {
  addedItems?: Item[];
  caller: string;
  handleSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleOpen?: (
    e: React.MouseEvent<HTMLButtonElement>,
    nome: string,
    quantities?: Item[],
  ) => void;
  handleClose?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleQuantityChange?: ( e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement> ) => void;
  handleDelete? :  ( e : React.MouseEvent<HTMLButtonElement>) => void;
  currentSelectedItem?: Item | undefined;
  openQuantityInput?: boolean;
  setIsCreating?: (value : boolean) => void;
}

export interface AddedItemsModalProps {
  addedItems?: Item[];
  handleOpen?: (
    e: React.MouseEvent<HTMLButtonElement>,
    nome: string,
    quantities?: Item[],
  ) => void;
  handleClose?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleQuantityChange?: ( e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement> ) => void;
  handleDelete? :  ( e : React.MouseEvent<HTMLButtonElement>) => void;
  currentSelectedItem: Item | undefined;
  openQuantityInput?: boolean;
  motionVariants: typeof motionItemsVariants;
  setIsCreating? : (value : boolean ) => void;
}

export interface requisitionItemsTableProps { 
    refreshToggler : boolean;
    setRefreshToggler : (value : boolean ) => void;
    items : Item[];
}

export interface AddedItemsTableProps {
  addedItems?: Item[];
  handleOpen?: (
    e: React.MouseEvent<HTMLButtonElement>,
    nome: string,
    quantities?: Item[],

  ) => void;
  handleDelete? :  ( e : React.MouseEvent<HTMLButtonElement>) => void;
  setIsCreating? : ( value : boolean ) => void;
}
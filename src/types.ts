

import { Dispatch, SetStateAction } from "react";

export interface Requisition {
  ID_REQUISICAO: number;
  STATUS: string;
  DESCRIPTION: string;
  ID_RESPONSAVEL: number;
  ID_PROJETO: number;
  DESCRICAO: string;
  RESPONSAVEL: string;
  LAST_UPDATE_ON: string | number;
  CREATED_ON: string | number;
}
export interface RequisitionPost {
  STATUS: string;
  DESCRIPTION: string;
  ID_RESPONSAVEL: number;
  ID_PROJETO: number;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface RequisitionItemPost {
  QUANTIDADE: number;
  ID_REQUISICAO: number;
  ID_PRODUTO: number;
}

export interface anexoRequisicao {
  id: number;
  nome_arquivo: string;
  arquivo: string;
  id_requisicao: number;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export interface Product {
  ID: number;
  codigo: string;
  nome_fantasia: string;
}
export interface Person {
  NOME: string;
  CODPESSOA: number;
}
export interface Project {
  ID: number;
}
export interface Item {
  ID: number;
  QUANTIDADE: number;
  nome_fantasia: string;
  codigo : string | undefined;
  ID_REQUISICAO: number;
  ID_PRODUTO: number;
  OBSERVACAO : string | undefined
}



export interface inputFileProps {
  ID_REQUISICAO: number;
  setRefreshToggler: (value: boolean) => void;
  refreshToggler : boolean;
}

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

export type Order = "asc" | "desc";

export interface ItemObservationModalProps {
  items : Item[];
  observation: string | undefined;
  isObservationModalOpen: boolean;
  setIsObservationModalOpen: (value: boolean) => void;
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

export interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Requisition
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  handleSearch: (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
}
export interface DeleteRequisitionItemModalProps{ 
  isDeleteRequisitionItemModalOpen : boolean;
      setIsDeleteRequisitionItemModalOpen : (value: boolean) => void;
      handleDelete : (item : Item) => void;
      item : Item;
}
export interface SearchAppBarProps {
  addedItems?: Item[];
  caller: string;
  handleSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleOpen?: (_e: React.MouseEvent<HTMLButtonElement>, item: Product) => void;
  handleClose?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleQuantityChange?: (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>
  ) => void;
  handleDelete?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  currentSelectedItem?: Item | undefined;
  openQuantityInput?: boolean;
  setIsCreating?: (value: boolean) => void;
  refreshToggler : boolean;

  setRefreshTooggler : (value : boolean) => void;
}

export interface AddedItemsModalProps {
  addedItems?: Item[];
  handleOpen?: (
    e: React.MouseEvent<HTMLButtonElement>,
    nome: string,
    quantities?: Item[]
  ) => void;
  refreshToggler : boolean;
  setRefreshToggler : (value: boolean ) => void;
  handleClose?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleQuantityChange?: (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>
  ) => void;
  handleDelete?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  openQuantityInput?: boolean;
  motionVariants: typeof motionItemsVariants;
  setIsCreating?: (value: boolean) => void;
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
import { Dispatch, ReactNode, SetStateAction } from "react";
export interface Requisition {
  OBSERVACAO: string;
  ID_REQUISICAO: number;
  STATUS: string;
  DESCRIPTION: string;
  ID_RESPONSAVEL: number;
  ID_PROJETO: number;
  DESCRICAO: string;
  RESPONSAVEL: string;
  NOME_RESPONSAVEL : string;
  LAST_UPDATE_ON: string | number;
  LAST_MODIFIED_BY_NAME: string;
  CREATED_ON: string | number;
  TIPO : number;
  nome_tipo : string;
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
export interface RequisitionType{ 
  id_tipo_requisicao : number;
  nome_tipo : string;
}
export interface Project {
  DESCRICAO: ReactNode;
  ID: number;
}
export interface Item {
  UNIDADE?: string;
  OC?: number;
  ID: number;
  ATIVO? : number;
  QUANTIDADE: number;
  nome_fantasia: string;
  codigo : string | undefined;
  ID_REQUISICAO: number;
  ID_PRODUTO: number;
  OBSERVACAO : string | undefined
}
export interface ItemFile{ 
  id: number;
  id_item : number;
  nome_arquivo: string;
  arquivo: string;
}

export interface InteractiveListProps {
  editItemsAllowed? : boolean;
  files: anexoRequisicao[] | ItemFile[];
  setRefreshToggler: (value: boolean) => void;
  refreshToggler: boolean;
  currentStatus ? : string;
}
export interface OpenFileModalProps {
  currentStatus? : string;
  ID_REQUISICAO: number;
}
export interface EnhancedTableToolbarProps {
  numSelected: number;
}
export interface HeadCell {
  disablePadding: boolean;
  id: keyof Requisition;
  label: string;
  numeric: boolean;
}



export interface inputFileProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  caller?: string;
  id: number;
  setRefreshToggler: (value: boolean) => void;
  refreshToggler: boolean;
}

export interface DeleteRequisitionModalProps{ 
    isDeleteRequisitionModalOpen : boolean;
    setIsDeleteRequisitionModalOpen : (value: boolean) => void;
    handleDelete : (  id: number) => void;
    requisitionId : number;
}

export type Order = "asc" | "desc";

export interface ItemObservationModalProps {
 item? : Item;
 refreshToggler : boolean;
 setRefreshToggler : (value : boolean ) => void;
}
export interface ProductsTableModalProps {
  requisitionID: number;
  info? : string;
}

export interface RequisitionTableProps { 
  isCreating: boolean;
}

export interface ProductsTableProps {
  ID_REQUISICAO: number;
  TIPO ? : number;
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
  handleSearch: (e: React.KeyboardEvent<HTMLInputElement> ) => void;
}
 export interface DeleteRequisitionItemModalProps{ 
  //  isDeleteRequisitionItemModalOpen : boolean;
  //      setIsDeleteRequisitionItemModalOpen : (value: boolean) => void;
       handleDelete : (items : Item[]) => void;
      //  item : Item;
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
  refreshToggler: boolean;

  setRefreshTooggler: (value: boolean) => void;
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
    items : Item[];
    currentStatus? : string;
}

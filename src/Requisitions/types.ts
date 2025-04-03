import { Dispatch, SetStateAction } from "react";

export interface Option {
  label: string;
  id: number;
}
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
  LAST_UPDATE_ON: string;
  LAST_MODIFIED_BY_NAME: string;
  CREATED_ON: string;
  TIPO : number;
  nome_tipo : string;
  projectOption : Option;
  projectOptions: Option[];
  responsableOption: Option
  responsableOptions :  Option[];
  typeOption : Option;
  typeOptions : Option[];
}


export interface QuoteField {
  dataKey: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}
export interface ShipmentType{ 
  nome: string;
  id_tipo_frete: number
}
export interface FiscalCategoryType{ 
  id_classificao_fiscal : number;
   nome : string;
}
export interface Quote {
  descricao: string;
  id_cotacao: number; // id_cotacao
  id_requisicao: number; // id_requisicao
  condicoes_pagamento: string;
  fornecedor: string; // fornecedor
  data_cotacao: string; // data_cotacao
  observacao?: string; // observacao
  total? : number;
  cnpj_fornecedor? : string;
  cnpj_faturamento? : string
  nome_frete: string;
  id_tipo_frete: number;
  id_classificacao_fiscal: number;
  valor_frete: number;
  itens: QuoteItem[]; // Lista de itens vinculados
}

// Interface para a tabela `web_items_cotacao`
export interface QuoteItem {
  id_item_cotacao: number; // id_item_cotacao
  id_cotacao: number; // id_cotacao
  id_item_requisicao: number;
  descricao_item: string; // descricao_item
  preco_unitario: number; // preco_unitario
  quantidade_solicitada: number; // quantidade
  quantidade_cotada: number; // quantidade_cotada
  observacao: string; // observacao
  ICMS: number;
  IPI: number;
  ST: number
  subtotal: number; // subtotal calculado
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
  DESCRICAO: string;
  ID: number;
}

export interface OptionsState {
  projectOption?: Option
  responsableOption?: Option
  typeOption?: Option
  projectOptions? : Option[];
  responsableOptions?: Option[];
  typeOptions? : Option[]
}

export interface AlertInterface{
  severity : string
  message: string
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


import api from "./api";

 interface Requisition {
  ID_REQUISICAO: number;
  STATUS: string;
  DESCRIPTION: string;
  ID_RESPONSAVEL: number;
  ID_PROJETO:number;
}
 interface RequisitionPost {
   status: string;
   description: string;
   id_responsavel: number;
   id_projeto: number;
 }
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 interface RequisitionItemPost{ 
  quantidade: number;
  id_requisicao: number;
  id_produto: number;
 }
 // eslint-disable-next-line @typescript-eslint/no-unused-vars

 interface Product {
  ID_PRODUTO: number;
  CODIGO: string;
  NOME: string;
}
interface Person{ 
  NOME: string;
  CODPESSOA : number;
}
interface Project{ 
  ID : number;
}
interface Item {
  id_web_requisicao_items: number;
  quantidade: number;
  nome : string;
  id_requisicao: number;
  id_produto: number;
}

const postRequistionItem = async (requisitionItems: RequisitionItemPost[], url: string) => { 
    try {
      const response = await api.post(url, requisitionItems);
      return response;
    } catch (e) {
      console.log(e);
    }
}

const postRequisition = async (requistions: RequisitionPost[]) => {
  try {
    const response = await api.post("/requisition", requistions);
    return response;
  } catch (e) {
    console.log(e);
  }
};

const fetchAllProjects = async ( ) => { 
  try {
    const response = await api.get<Project[]>("/project");
    return response.data;
  } catch (e) {
    console.log(e);
  }
}

const fetchAllProducts = async () => {
  try {
    const response = await api.get<Product[]>("/products");
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
const fecthRequisitions = async () => {
  try {
    const response = await api.get<Requisition[]>("/requisition");
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
const fetchRequsitionById = async (id : number ) => { 
    try {
      const response = await api.get<Requisition>(`requisition/${id}`);
      return response.data;
    } catch (e) {
      console.log(e);
    }
}
const fetchItems = async (id: number) => {
  try {
    ///requisition/requisitionItems/requisitionId
    const response = await api.get<Item[]>(`requisition/requisitionItems/${id}`);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
const fetchPersons = async () => {
  try {
    const response = await api.get<Person[]>("/pessoa");
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const fetchPersonById = async (id : number ) => { 
   try {
     const response = await api.get<Person>(`pessoa/${id}`);
     return response.data;
   } catch (e) {
     console.log(e);
   }
}

export {
  fecthRequisitions,
  fetchAllProducts,
  fetchPersons,
  fetchAllProjects,
  postRequisition,
  postRequistionItem,
  fetchRequsitionById,
  fetchPersonById,
  fetchItems
};   
export type { Requisition, Product, Person, Project, RequisitionItemPost, Item };


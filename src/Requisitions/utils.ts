import { AxiosRequestConfig } from "axios";
import api from "../api";
import {
  Item,
  ItemFile,
  Person,
  Product,
  Project,
  Quote,
  QuoteItem,
  Requisition,
  RequisitionItemPost,
  RequisitionPost,
  anexoRequisicao,
} from "./types";
import { User } from "./context/userContext";

const logIn = async (username: string, password: string) => {
  try {
    const response = await api.post(
      `/users/login`,
      {
        username,
        password,
      },
      {
        withCredentials: false,
        headers: {
          Accept: "*/*",
        },
      }
    );
    return response.data;
  } catch (e) {
    return { message: "login failed" };
    console.log(e);
  }
};

const fetchRequisitionFiles = async (requisitionID: number) => {
  try {
    return await api.get<anexoRequisicao>(`requisitionFiles/${requisitionID}`);
  } catch (e) {
    console.log(e);
  }
};
const fetchItemFiles = async (itemID: number) => {
  try {
    return await api.get<ItemFile[]>(`itemFiles/${itemID}`);
  } catch (e) {
    console.log(e);
  }
};
const postItemFile = async (id: number, formData: FormData) => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  };
  try {
    console.log("POST ITEM");
    const response = await api.post(`itemFiles/${id}`, formData, config);
    return response;
  } catch (e) {
    console.log(e);
  }
};
const postItemLinkFile = async (id: number, link: string) => {
  try {
    const response = await api.post(`itemFiles/link/${id}`, { link: link });
    return response;
  } catch (e) {
    console.log(e);
  }
};

const postRequisitionLinkFile = async (id: number, link: string) => {
  try {
    const response = await api.post(`requisitionFiles/link/${id}`, {
      link: link,
    });
    return response;
  } catch (e) {
    console.log(e);
  }
};

const deleteItemFile = async (file: anexoRequisicao | ItemFile) => {
  try {
    const response = await api.delete(`itemFiles/${file.nome_arquivo}/${file.id}`);
    return response.status;
  } catch (e) {
    console.log(e);
  }
};
const deleteRequisitionFile = async (file: ItemFile | anexoRequisicao) => {
  try {
    const response = await api.delete(`requisitionFiles/${file.nome_arquivo}/${file.id}`);
    if (response.status === 200) {
      return response.status;
    }
  } catch (e) {
    console.log(e);
  }
};

const postRequisitionFile = async (
  requisitionID: number,
  formData: FormData
) => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  };
  try {
    const response = await api.post(
      `requisitionFiles/${requisitionID}`,
      formData,
      config
    );
    if (response.status === 200) {
      console.log("file Uploaded");
      return response.status;
    }
  } catch (e) {
    console.log(e);
  }
};

const getRequisitionFiles = async (requisitionID: number) => {
  try {
    const reponse = await api.get<anexoRequisicao[]>(
      `requisitionFiles/${requisitionID}`
    );
    return reponse.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const postRequistionItems = async (

  requisitionId: number,
  requisitionItems?: RequisitionItemPost[],
) => {
  try {
    const response = await api.post(`requisition/requisitionItems/${requisitionId}`, requisitionItems);
    return response.data;
  } catch (e : any) {
      throw new Error(e);
  } 
};

const postRequisition = async (requistions: RequisitionPost[]) => {
  try {
    const response = await api.post("/requisition", requistions);
    return response;
  } catch (e : any) {
    throw new Error(e);
  }
};

const fetchAllTypes = async () => {
  try{
    const response = await api.get(`requisition/types`);
    return response.data;
  } 
  catch(e){ 
    console.log(e);
  }
};
const fetchAllProjects = async () => {
  try {
    const response = await api.get<Project[]>("/project");
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
const fetchProjectOptionsByUser = async (userID: number) => {
  try {
    const response = await api.get<Project[]>("/project", { 
      params: {userID}
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const deleteRequisition = async (id: number) => {
  try {
    await api.delete(`/requisition/${id}`);
  } catch (e) {
    console.log(e);
  }
};

const fetchTenThousandProducts = async () => {
  let offSet = -10000;
  const qtdRequests = 1;
  let data: Product[] = [];
  for (let i = 0; i < qtdRequests; i++) {
    const chunk = await api.get<Product[]>(`/products`, {
      params: {
        limit: 10000,
        offSet: (offSet += 10000),
      },
    });
    if (chunk.data) data = [...data, ...chunk.data];
  }
  return data;
};

const searchProducts = async (name: string, type : number) => {
  try {
    const response = await api.get<Product[]>("/products", {
      params: {
        search: name,
        typeId : type
      },
    });
    return response.data;
  } catch (e: any) {
    throw new Error(e);

  }
};

const fecthRequisitions = async (
  user: User,
  currentKanbanFilter: string,
  search?: string
) => {
  try {
    const response = await api.get<Requisition[]>("/requisition", {
      params: {
        userID: user.CODPESSOA,
        search,
        currentKanbanFilter,
      },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const fetchRequsitionById = async (id: number) => {
  try {
    const response = await api.get<Requisition>(`requisition/${id}`);
    return response.data;
  } catch (e : any) {
    throw new Error(e);
  }
};

const fetchItems = async (id: number) => {
  try {
    const response = await api.get<any>(
      `requisition/requisitionItems/${id}`
    );
    return response.data;
  } catch (e) {
    return null;
  }
};

const deleteRequisitionItems = async (
  ids: number[],
  requisitionId: number
) => {
  console.log("payload: ", { ids, requisitionId });
  try {
    const response = await api.delete(`requisition/requisitionItems/${requisitionId}`,
      {
        params: { ids },
      }
    );
    return response;
  } catch (e: any) {
    throw new Error(e);
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

const fetchPersonById = async (id: number) => {
  try {
    const response = await api.get<Person>(`pessoa/${id}`);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const updateRequisitionItems = async (items: Item[], requisitonId: number) => {
  try {
    const response = await api.put(`/requisition/requisitionItems/${requisitonId}`, items);
    return response;
  } catch (e : any) {
    console.log(e);
    throw new Error(e)
  }
};
const getQuoteById = async (quoteId : number) => { 
  try {
    const response = await api.get(`/requisition/quote/${quoteId}`);
    return response;
  } catch (e) {
    throw new Error();
  }
}

const getQuoteShipments = async ( ) => { 
  try {
    const response = await api.get(`requisition/quote/shipment-type`);
    return response.data;
  } catch (e: any) {
    throw e;
  }
} 

const getQuoteClassifications = async ( ) => {
  try {
    const response = await api.get(`requisition/quote/classification`);
    return response.data;
  } catch (e: any) {
    throw e;
  }
}

const getQuotesByRequisitionId = async (requisitionId : number) => { 
  try{ 
    const response = await api.get(`requisition/quote/quoteList/${requisitionId}`);
    return response.data;
  }catch(e : any){ 
    throw e;
  }
}

const updateQuoteItems = async (items : QuoteItem[] , quoteId : number) =>  {
  try{ 
    const response = await api.put(`requisition/quote/${quoteId}/items`, items);
    return response;
  }catch(e){
    throw e;
  }
}

const updateQuote = async (quote : Quote) => { 
  try{ 
    const response = await api.put(`/requisition/quote/${quote.id_cotacao}`, quote);
    return response;
  }catch(e: any){ 
    throw new Error(e);
  }
}

const createQuote = async (items: Item[], requisitionId: number, descricao : string, fornecedor : string) => {
  console.log('createQuote')
  try {
    const response = await api.post('requisition/quote', {items, requisitionId, descricao, fornecedor});
    return response;
  } catch (e: any) {
    throw new Error(e);
  }
}


const updateRequisition = async (
  codpessoa: number,
  requisition: Requisition
) => {
  try {
   const response = await api.put(`requisition/${requisition.ID_REQUISICAO}`, {
      codpessoa,
      requisition,
    });
    return response
  } catch (e : any) {
    throw new Error(e)
  }
};

export {
  fecthRequisitions,
  fetchTenThousandProducts,
  fetchPersons,
  fetchAllProjects,
  postRequisition,
  postRequistionItems,
  fetchRequsitionById,
  fetchPersonById,
  fetchItems,
  deleteRequisitionItems,
  updateRequisitionItems,
  updateRequisition,
  deleteRequisition,
  searchProducts,
  fetchRequisitionFiles,
  postRequisitionFile,
  getRequisitionFiles,
  deleteRequisitionFile,
  fetchItemFiles,
  postItemFile,
  deleteItemFile,
  postItemLinkFile,
  postRequisitionLinkFile,
  fetchAllTypes,
  logIn,
  fetchProjectOptionsByUser,
  createQuote,
  getQuoteById,
  updateQuote,
  updateQuoteItems,
  getQuotesByRequisitionId,
  getQuoteClassifications,
  getQuoteShipments
};
export type {
  Requisition,
  Product,
  Person,
  Project,
  RequisitionItemPost,
  Item,
  anexoRequisicao,
};



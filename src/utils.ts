import { AxiosRequestConfig } from "axios";
import api from "./api";
import {
  Item,
  ItemFile,
  Person,
  Product,
  Project,
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
          Accept: "*/*"
        },
      }
    );
     return response.data;
  } catch (e) {
    return {message: 'login failed'};
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
const fetchItemFiles = async (itemID : number ) => { 
  try{ 
    return await api.get<ItemFile[]>(`itemFiles/${itemID}`);
  }catch(e){ 
    console.log(e);
  }
};
const postItemFile = async (id: number, formData : FormData) => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  };
  try {
    console.log('POST ITEM');
    const response = await api.post(`itemFiles/${id}`, formData, config);
    return response;
  } catch (e) {
    console.log(e);
  }
};
const postItemLinkFile = async(id: number, link: string) => { 

  try {
    const response = await api.post(`itemFiles/link/${id}`, { link : link} );
    return response;
  }catch(e){ 
    console.log(e);
  }
}

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

const deleteItemFile = async ( id : number ) => { 
  try {
    const response = await api.delete(`itemFiles/${id}`);
    return response.status;
  }catch(e){ 
    console.log(e);
  }
}
const deleteRequisitionFile = async (fileID : number ) => { 
  try{ 
    const response = await api.delete(`requisitionFiles/${fileID}`);
    if(response.status === 200){ 
       console.log("file deleted");
       return response.status;
    }
    
  }catch(e){ 
    console.log(e);
  }
}

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
    if (response.status === 200){ 
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

const postRequistionItem = async (
  requisitionItems: RequisitionItemPost[],
  url: string
) => {
  try {
    const response = await api.post(url, requisitionItems);
    return response;
  } catch (e) {
    console.log(e);
  }
};

const postRequisition = async (requistions: RequisitionPost[]) => {
  try {
    const response = await api.post("/requisition", requistions);
    return response;
  } catch (e) {
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

const searchProducts = async (name: string) => {
  try {
    const response = await api.get<Product[]>("/products", {
      params: {
        search: name,
      },
    });
    return response;
  } catch (e) {
    console.log(e);
  }
};

const fecthRequisitions = async (user: User, currentKanbanFilter : string, search? : string ,) => {
  try {
    const response = await api.get<Requisition[]>("/requisition", {
      params: { 
        userID: user.CODPESSOA,
        search,
        currentKanbanFilter
      }
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
  } catch (e) {
    console.log(e);
  }
};

const fetchItems = async (id: number) => {
  try {
      const response = await api.get<Item[]>(
      `requisition/requisitionItems/${id}`
    );
    return response.data;
  } catch (e) {
    return null;
  }
};

const deleteRequisitionItem = async (
  productId: number,
  requisitionId: number
) => {
  console.log('payload: ', {productId, requisitionId})
  try {
    await api.delete(
      `requisition/requisitionItems/${requisitionId}/${productId}`
    );
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
    await api.put(`/requisition/requisitionItems/${requisitonId}`, items);
  } catch (e) {
    console.log(e);
  }
};

const updateRequisition = async (requisition: Requisition) => {
  try {
    await api.put(`requisition/${requisition.ID_REQUISICAO}`, requisition);
  } catch (e) {
    console.log(e);
  }
};

export {
  fecthRequisitions,
  fetchTenThousandProducts,
  fetchPersons,
  fetchAllProjects,
  postRequisition,
  postRequistionItem,
  fetchRequsitionById,
  fetchPersonById,
  fetchItems,
  deleteRequisitionItem,
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
  logIn,
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

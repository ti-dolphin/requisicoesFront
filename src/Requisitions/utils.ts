import { AxiosRequestConfig } from "axios";
import api from "../api";
import {
  Item,
  ItemFile,
  Person,
  Product,
  Project,
  Quote,
  QuoteField,
  Requisition,
  RequisitionItemPost,
  RequisitionPost,
  anexoRequisicao,
} from "./types";
import { User } from "./context/userContext";
import { error } from "console";

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
    return response;
  } catch (e) {
    console.log(e);
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
  console.log("payload: ", { productId, requisitionId });
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
    const response = await api.put(`/requisition/requisitionItems/${requisitonId}`, items);
    return response;
  } catch (e : any) {
    console.log(e);
    throw new Error(e)
  }
};


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
  fetchAllTypes,
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

const quoteFields: QuoteField[] = [
   {
    dataKey: 'observacao',
    label: 'Observação',
    type: 'string',
  },
  { 
    dataKey: 'descricao',
    label: 'Descrição',
    type: 'string'
  },
  {
    dataKey: 'id_cotacao',
    label: 'ID da Cotação',
    type: 'string',
  },
  {
    dataKey: 'id_requisicao',
    label: 'ID da Requisição',
    type: 'string',
  },
  {
    dataKey: 'data_cotacao',
    label: 'Data da Cotação',
    type: 'date',
  },
  {
    dataKey: 'validade',
    label: 'Validade da Cotação',
    type: 'date',
  },
  {
    dataKey: 'status',
    label: 'Status',
    type: 'string',
  },
  {
    dataKey: 'fornecedor',
    label: 'Fornecedor',
    type: 'string',
  },
  {
    dataKey: 'total',
    label: 'Total da Cotação',
    type: 'number',
  },
 
  {
    dataKey: 'condicoes_pagamento',
    label: 'Condições de Pagamento',
    type: 'string',
  },
  {
    dataKey: 'data_validade',
    label: 'Data de Validade',
    type: 'date',
  },
];

export default quoteFields;

export const dummyQuotes: Quote[] = [
  {
    id_cotacao: 1,
    id_requisicao: 1001,
    fornecedor: "ABC Supplies Ltd.",
    data_cotacao: "2025-02-03T10:00:00Z",
    descricao: "Cotação para materiais de construção e ferramentas.",
    observacao: "Entrega prevista em 7 dias úteis.",
    condicoes_pagamento: 'crédito',
    itens: [
      {
        id_item_cotacao: 1,
        id_cotacao: 1,
        descricao_item: "Parafusos de aço inox (100 unidades)",
        preco_unitario: 5.5,
        quantidade: 10,
        subtotal: 55,
      },
      {
        id_item_cotacao: 2,
        id_cotacao: 1,
        descricao_item: "Chave de fenda elétrica",
        preco_unitario: 250,
        quantidade: 2,
        subtotal: 500,
      },
       {
      id_item_cotacao: 3,
      id_cotacao: 1,
      descricao_item: "Martelo de borracha",
      preco_unitario: 45,
      quantidade: 3,
      subtotal: 135,
    },
    {
      id_item_cotacao: 4,
      id_cotacao: 1,
      descricao_item: "Serra circular manual",
      preco_unitario: 600,
      quantidade: 1,
      subtotal: 600,
    },
    {
      id_item_cotacao: 5,
      id_cotacao: 1,
      descricao_item: "Brocas de aço rápido (jogo com 10)",
      preco_unitario: 85,
      quantidade: 2,
      subtotal: 170,
    },
    {
      id_item_cotacao: 6,
      id_cotacao: 1,
      descricao_item: "Trena de 5 metros",
      preco_unitario: 30,
      quantidade: 4,
      subtotal: 120,
    },
    {
      id_item_cotacao: 7,
      id_cotacao: 1,
      descricao_item: "Chave inglesa ajustável",
      preco_unitario: 75,
      quantidade: 2,
      subtotal: 150,
    },
    {
      id_item_cotacao: 8,
      id_cotacao: 1,
      descricao_item: "Alicate universal",
      preco_unitario: 40,
      quantidade: 5,
      subtotal: 200,
    },
    {
      id_item_cotacao: 9,
      id_cotacao: 1,
      descricao_item: "Pá para concreto",
      preco_unitario: 25,
      quantidade: 6,
      subtotal: 150,
    },
    {
      id_item_cotacao: 10,
      id_cotacao: 1,
      descricao_item: "Tubo de silicone para vedação",
      preco_unitario: 18,
      quantidade: 8,
      subtotal: 144,
    },
    {
      id_item_cotacao: 11,
      id_cotacao: 1,
      descricao_item: "Luva de proteção térmica",
      preco_unitario: 20,
      quantidade: 12,
      subtotal: 240,
    },
    {
      id_item_cotacao: 12,
      id_cotacao: 1,
      descricao_item: "Máscara de proteção respiratória",
      preco_unitario: 15,
      quantidade: 10,
      subtotal: 150,
    },
    {
      id_item_cotacao: 13,
      id_cotacao: 1,
      descricao_item: "Óculos de proteção",
      preco_unitario: 25,
      quantidade: 10,
      subtotal: 250,
    },
    {
      id_item_cotacao: 14,
      id_cotacao: 1,
      descricao_item: "Nível de bolha magnético",
      preco_unitario: 120,
      quantidade: 3,
      subtotal: 360,
    },
    {
      id_item_cotacao: 15,
      id_cotacao: 1,
      descricao_item: "Fita isolante (rolo de 20 metros)",
      preco_unitario: 10,
      quantidade: 15,
      subtotal: 150,
    },
    {
      id_item_cotacao: 16,
      id_cotacao: 1,
      descricao_item: "Extensão elétrica de 10 metros",
      preco_unitario: 80,
      quantidade: 2,
      subtotal: 160,
    },
    {
      id_item_cotacao: 17,
      id_cotacao: 1,
      descricao_item: "Marreta 1 kg",
      preco_unitario: 50,
      quantidade: 4,
      subtotal: 200,
    },
    {
      id_item_cotacao: 18,
      id_cotacao: 1,
      descricao_item: "Tinta acrílica branca (lata 18L)",
      preco_unitario: 400,
      quantidade: 1,
      subtotal: 400,
    },
    {
      id_item_cotacao: 19,
      id_cotacao: 1,
      descricao_item: "Rolo para pintura",
      preco_unitario: 25,
      quantidade: 6,
      subtotal: 150,
    },
    {
      id_item_cotacao: 20,
      id_cotacao: 1,
      descricao_item: "Lixa para madeira (jogo com 5 folhas)",
      preco_unitario: 12,
      quantidade: 8,
      subtotal: 96,
    },
    {
      id_item_cotacao: 21,
      id_cotacao: 1,
      descricao_item: "Chave de grifo grande",
      preco_unitario: 90,
      quantidade: 3,
      subtotal: 270,
    },
    {
      id_item_cotacao: 22,
      id_cotacao: 1,
      descricao_item: "Ponteira para parafusadeira",
      preco_unitario: 15,
      quantidade: 10,
      subtotal: 150,
    },
    ],
  },
  {
    id_cotacao: 2,
    id_requisicao: 1002,
    fornecedor: "XYZ Industrial",
    data_cotacao: "2025-02-02T15:30:00Z",
    descricao: "Cotação para cabos e equipamentos eletrônicos.",
    observacao: "Necessário pagamento antecipado.",
        condicoes_pagamento: 'crédito',

    itens: [
      {
        id_item_cotacao: 3,
        id_cotacao: 2,
        descricao_item: "Cabo HDMI de alta velocidade",
        preco_unitario: 30,
        quantidade: 5,
        subtotal: 150,
      },
      {
        id_item_cotacao: 4,
        id_cotacao: 2,
        descricao_item: "Monitor Full HD 24 polegadas",
        preco_unitario: 900,
        quantidade: 1,
        subtotal: 900,
      },
    ],
  },
  {
    id_cotacao: 3,
    id_requisicao: 1003,
    fornecedor: "Tech World",
    data_cotacao: "2025-01-30T09:45:00Z",
    descricao: "Cotação para periféricos de informática.",
    observacao: "Itens sob encomenda.",
    condicoes_pagamento: 'crédito',
    itens: [
      {
        id_item_cotacao: 5,
        id_cotacao: 3,
        descricao_item: "Mouse sem fio ergonômico",
        preco_unitario: 120,
        quantidade: 3,
        subtotal: 360,
      },
      {
        id_item_cotacao: 6,
        id_cotacao: 3,
        descricao_item: "Teclado mecânico RGB",
        preco_unitario: 300,
        quantidade: 1,
        subtotal: 300,
      },
    ],
  },
];
export const defaultQuote: Quote = {
  id_cotacao: 0,
  id_requisicao: 0,
  fornecedor: "Fornecedor Padrão",
  data_cotacao: new Date().toISOString(),
  descricao: "Descrição padrão da cotação.",
  observacao: "Sem observações.",
  condicoes_pagamento: "À vista",
  itens: [
    {
      id_item_cotacao: 0,
      id_cotacao: 0,
      descricao_item: "Item padrão",
      preco_unitario: 0,
      quantidade: 1,
      subtotal: 0,
    },
  ],
};
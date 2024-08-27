import { AxiosRequestConfig } from "axios";
import api from "../api"
import { Movementation, Patrimony, PatrimonyFile, PatrimonyInfo } from "./types";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
dayjs.extend(utc);
dayjs.extend(timezone);

export const getPatrimonyInfo = async( ) =>  {
   try{ 
    const response = await api.get<PatrimonyInfo[]>(`/patrimony`);
    return response.data;
   }catch(e){ 
        console.log("error getPatrimonyInfo: ", e);
   }
}
export const createPatrimony = async (newPatrimony : Patrimony ) =>  {
   try{ 
      const response = await api.post(`/patrimony`, newPatrimony);
      return response.data.insertId;
   }catch(e){ 
      console.log(e);
   }
}
export const dateTimeRenderer = (value?: string | number) => {
  if (typeof value === "string") {
    const brazilianDateTime = dayjs.utc(value).tz("America/Sao_Paulo");
    const formattedDate = brazilianDateTime.format("DD/MM/YYYY");
    const formattedTime = brazilianDateTime.format("HH:mm:ss");
    return `${formattedDate}, ${formattedTime}`;
  }
};
export const deleteMultiplePatrimonies = async (selectedItems: PatrimonyInfo[]) => {
  try {
   Promise.all( 
     selectedItems.map(async (item) => ( 
      await api.delete(`patrimony/${item.id_patrimonio}`)
   ))
 )
  } catch (e) {
    console.log(e);
  }
};
export const dateRenderer = (value?: string | number) => {
    if (typeof value === "string") {
      const date = value.substring(0, 10).replace(/-/g, "/")
      let formatted = `${date}`;
      const localeDate = new Date(formatted).toLocaleDateString();
      formatted = `${localeDate}`;
      return formatted;
    }
};
export const getResponsableForPatrimony = async(patrimonyId: number  ) =>  {
   console.log("patrimonyId passado: ", patrimonyId);
   try{ 
       const response = await api.get(`/patrimony/responsable/${patrimonyId}`);
       console.log("resopnse: ", response.data);
       return response.data;
   }catch(e){ 
         console.log(e);
      }
   }
export const getTypesOfPatrimony = async ( ) => { 
      try{ 
         const response = await api.get('/patrimony/types');
         return response.data;
      }catch(e){ 
         console.log(e);
      }
};

export const getInactivePatrimonyInfo = async ( ) => { 
   try{ 
      const response = await api.get(`patrimony/inactive`);
      console.log('respoonse data: ', response.data)
      return response.data;
   }catch(e){ 
      console.log(e);
   }
};

export const updateMultiplePatrimonies = async (selectedItems : PatrimonyInfo[], options? : { active : boolean } ) => { 
   try{ 
      if(options && options.active ){ 
          const response = await api.put(`/patrimony`, { 
            selectedItems, 
            active: options.active
          });
      return response;
      }
      const response = await api.put(`/patrimony`, { selectedItems, active : false});
      return response;
   }catch(e){ 
      console.log(e);
   }
};
export const createMovementationfile = async(movementationId: number ,file : FormData) =>  {
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: file,
    };
    try{ 
      const response = await api.post(`movementation/files/${movementationId}`, 
         file, 
         config
      );
      if(response.data) return response;
      
    }catch(e){ 
      console.log(e);
    }
 }

export const createMovementation = async ( newMovementation  : Movementation) => { 
   console.log("createMovementation - newMovementation: \n", newMovementation);
      try{ 
         const response = await api.post(`/movementation`, newMovementation);
         console.log("createMovementation - responsa.data: \n", response.data);
         return response.data.insertId
      }catch(e){ 
         console.log(e);
      }
}
export const deletePatrimonyFileModal = async (patrimonyFileId: number) => {
   console.log("deletePatrimonyFileModal");
  try {
    const response = await api.delete(`/patrimony/files/${patrimonyFileId}`);
    console.log("response status: ", response.status);
    return response;
  } catch (e) {
    console.log(e);
  }
};


export const deleteMovementationFileModal = async ( movementationFileId : number) =>  { 
   try{ 
      const response = await api.delete(
        `/movementation/files/${movementationFileId}`,
      );
      console.log('response status: ', response.status)
      return response;
   }catch(e){ 
      console.log(e);
   }
}
export const getMovementationsByPatrimonyId = async(patrimonyId : number) =>  {
   try{ 
      const response = await api.get(`movementation/${patrimonyId}`);
      return response.data;
   }catch(e){ 
      console.log(e);
   }
}
export const updateMovementation = async (editedMovementation : Movementation ) =>  {
      try{ 
         const response = await api.put(`movementation/${editedMovementation.id_movimentacao}`, editedMovementation);
         return response;
      }catch(e){ 
         console.log(e);
      }
}
export const getSinglePatrimony = async (patrimonyId : number ) =>  { 
   try{ 
    const response = await api.get<Patrimony[]>(`patrimony/${patrimonyId}`);
      return response.data;
   }catch(e){ 
      console.log(e);
   }
}

export const getPatrimonyFiles = async (patrimonyId : number ) => { 
   try{ 
      const response = await api.get<PatrimonyFile[]>(`patrimony/files/${patrimonyId}`);
      return response.data;
   }catch(e){ 
      console.log(e);
   }
};

export const createPatrimonyfile = async (patrimonyId : number, file : FormData ) => { 
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: file,
    };
    try {
      const response = await api.post(
        `patrimony/files/${patrimonyId}`,
        file,
        config
      );
      if (response.data) return response;
    } catch (e) {
      console.log(e);
    }
}

 export const upatePatrimony = async (patrimony: Patrimony) => {
   try {
     const response = await api.put(`patrimony/${patrimony.id_patrimonio}`, patrimony);
     console.log("reponse upatePatrimony: \n", response);
     return response;
   } catch (e) {
     console.log(e);
   }
 };

export const deleteMovementation = async (movimentationId : number ) => { 
   try{ 
      const response = await api.delete(`movementation/${movimentationId}`);
      return response;
   }catch(e){ 
      console.log(e);
   }
};

export const getMovementationFiles = async(movementationId : number) => { 
   try{ 
      const response = await api.get(`movementation/files/${movementationId}`);
      if(response.data) return response.data;
   }catch(e){ 
      console.log(e);
   }
}
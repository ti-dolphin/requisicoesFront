/* eslint-disable react-refresh/only-export-components */
import { AxiosRequestConfig } from "axios";
import api from "../api";
import {
  ChecklistItemFile,
  Movementation,
  MovementationChecklist,
  Patrimony,
  PatrimonyFile,
  PatrimonyInfo,
} from "./types";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import InputBase from "@mui/material/InputBase";
import { styled, alpha } from "@mui/material/styles";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Link } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

export const finishChecklistByPatrimonyid = async (patrimonyId: number) => {
  try {
    const response =  await api.get("/checklist/finish", {
      params: { patrimonyId },
    });
    return response;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getNonRealizedChecklistByPatrimonyId = async (patrimonyId : Number ) => { 
  try{ 
      const response = await api.get("/checklist/notRealized", {
        params: { patrimonyId },
      });
      return response.data;
  }catch(e  :any){ 
    throw new Error(e);
  }
}

export const toBeAproved = (row: MovementationChecklist) => {
  return row.realizado && !row.aprovado;
};

const isTypeResponsable = (checklist: MovementationChecklist, user?: User) => {
  return checklist.responsavel_tipo === user?.responsavel_tipo;
};
export const toBeDone = (row: MovementationChecklist) => {
  return !row.aprovado && !row.realizado;
};

export const isLate = (row: MovementationChecklist) => {
  const creationDate = new Date(row.data_criacao);
  const today = new Date();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(today.getDate() - 3);
  return creationDate < threeDaysAgo && !row.realizado;
};

export const renderValue = (
  column: ChecklistColumnData,
  row: MovementationChecklist,
  user: User
) => {
  if (column.dataKey === "aprovado") {
    return (
      <ErrorIcon
        sx={{
          color:
            toBeAproved(row) && isTypeResponsable(row, user)
              ? "#ff9a3c"
              : "gray",
        }}
      ></ErrorIcon>
    );
  }
  if (column.dataKey === "realizado") {
    return toBeDone(row) ? (
      <ErrorIcon
        sx={{
          color: isLate(row) ? "red" : "#ff9a3c",
        }}
      ></ErrorIcon>
    ) : (
      <CheckCircleIcon
        sx={{
          color: "green",
        }}
      />
    );
  }
  if (column.dataKey === "id_patrimonio") {
    return (
      <Link to={`/patrimony/item/${row.id_patrimonio}`}>
        {row.id_patrimonio}
      </Link>
    );
  }
  return row[column.dataKey];
};

export const getPatrimonyInfo = async (user: User, currentFilter: string) => {
  try {
    const response = await api.get<PatrimonyInfo[]>(`/patrimony`, {
      params: { user, filter: currentFilter },
    });
    return response.data;
  } catch (e) {
    console.log("error getPatrimonyInfo: ", e);
  }
};
import axios from "axios";
import { PatrimonyAccessory } from "./types";
import { User } from "../Requisitions/context/userContext";
import { ChecklistColumnData } from "../crm/types";

// Function to create a new accessory
export const createAccessory = async (accessory: PatrimonyAccessory) => {
  try {
    const response = await api.post("/accessory", accessory);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create accessory: ${error}`);
  }
};

export const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

export const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

// Function to get an accessory by its ID
export const getAccessoryById = async (id: number) => {
  try {
    const response = await api.get(`/accessory/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get accessory by ID: ${error}`);
  }
};

// Function to update an accessory by its ID
export const updateAccessory = async (
  id: number,
  accessory: PatrimonyAccessory
) => {
  try {
    const response = await axios.put(`/accessory/${id}`, accessory);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update accessory: ${error}`);
  }
};

// Function to delete an accessory by its ID
export const deleteAccessory = async (id: number) => {
  try {
    const response = await axios.delete(`/accessory/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to delete accessory: ${error}`);
  }
};

export const createPatrimonyAccessoryFile = async (
  id: number,
  file: FormData
) => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: file,
  };
  try {
    const response = await api.post(`accessory/files/${id}`, file, config);
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const deletePatrimonyAccessory = async (id: number) => {
  try {
    const response = await api.delete(`accessory/${id}`);
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const deletePatrimonyAccessoryFile = async (
  id: number,
  filename: string
) => {
  try {
    const response = await api.delete(`accessory/files/${filename}/${id}`);
    return response;
  } catch (e) {
    console.log(e);
  }
};
export const getPatrimonyAccessoryFiles = async (id: number) => {
  try {
    const response = await api.get(`accessory/files/${id}`);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
// Function to get accessories by patrimony ID
export const getAccessoriesByPatrimonyId = async (id_patrimonio: number) => {
  try {
    const response = await api.get(
      `accessory/patrimony-accessory/${id_patrimonio}`
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get accessories by patrimony ID: ${error}`);
  }
};

export const createPatrimony = async (newPatrimony: Patrimony) => {
  console.log("newPatrimony: ", newPatrimony);
  try {
    const response = await api.post(`/patrimony`, newPatrimony);
    return response.data.insertId;
  } catch (e) {
    console.log(e);
  }
};
export const dateTimeRenderer = (value?: string | number) => {
  if (typeof value === "string") {
    const brazilianDateTime = dayjs.utc(value);
    const formattedDate = brazilianDateTime.format("DD/MM/YYYY");
    const formattedTime = brazilianDateTime.format("HH:mm:ss");
    return `${formattedDate}, ${formattedTime}`;
  }
};
export const deleteMultiplePatrimonies = async (
  selectedItems: PatrimonyInfo[]
) => {
  try {
    Promise.all(
      selectedItems.map(
        async (item) => await api.delete(`patrimony/${item.id_patrimonio}`)
      )
    );
  } catch (e) {
    console.log(e);
  }
};
export const dateRenderer = (value?: string | number) => {
  if (typeof value === "string") {
    const date = value.substring(0, 10).replace(/-/g, "/");
    let formatted = `${date}`;
    const localeDate = new Date(formatted).toLocaleDateString();
    formatted = `${localeDate}`;
    return formatted;
  }
};
export const getResponsableForPatrimony = async (patrimonyId: number) => {
  try {
    const response = await api.get(`/patrimony/responsable/${patrimonyId}`);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
export const getTypesOfPatrimony = async () => {
  try {
    const response = await api.get("/patrimony/types");
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export const getInactivePatrimonyInfo = async () => {
  try {
    const response = await api.get(`patrimony/inactive`);
    console.log("respoonse data: ", response.data);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
export const getChecklistDataByPatrimonyId = async (id_patrimonio: number) => {
  try {
    const response = await api.get(`checklist/${id_patrimonio}`);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
export const getChecklistItems = async (
  id_patrimonio: number,
  id_movimentacao: number,
  id_checklist_movimentacao: number
) => {
  try {
    const response = await api.get(
      `checklist/checklistItems/${id_patrimonio}/${id_movimentacao}/${id_checklist_movimentacao}`,
      {
        params: {
          cacheBuster: Date.now(), // Parâmetro para evitar cache
        },
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
export const sendChecklistItems = async (
  checklistItems: ChecklistItemFile[]
) => {
  try {
    const response = await api.put("/checklist/checklistItems", {
      checklistItems: checklistItems,
    });
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const getPatrimonyNotifications = async (
  user: User,
  currentStatusFilterSelected: string
) => {
  console.log("currentStatusFilterSelected", currentStatusFilterSelected);
  try {
    const queryParams = new URLSearchParams({
      CODPESSOA: String(user.CODPESSOA), // Assuming `id` is a property of user
      status: currentStatusFilterSelected,
    });
    const response = await api.get(
      `checklist/notifications?${queryParams.toString()}`
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export const updateMultiplePatrimonies = async (
  selectedItems: PatrimonyInfo[],
  options?: { active: boolean }
) => {
  try {
    if (options && options.active) {
      const response = await api.put(`/patrimony`, {
        selectedItems,
        active: options.active,
      });
      return response;
    }
    const response = await api.put(`/patrimony`, {
      selectedItems,
      active: false,
    });
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const createMovementationfile = async (
  movementationId: number,
  file: FormData
) => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: file,
  };
  try {
    const response = await api.post(
      `movementation/files/${movementationId}`,
      file,
      config
    );
    if (response.data) return response;
  } catch (e) {
    console.log(e);
  }
};

export const createMovementation = async (newMovementation: Movementation) => {
  console.log("createMovementation - newMovementation: \n", newMovementation);
  try {
    const response = await api.post(`/movementation`, newMovementation);
    console.log("createMovementation - responsa.data: \n", response.data);
    return response;
  } catch (e) {
    console.log(e);
  }
};
export const deletePatrimonyFileModal = async (
  patrimonyFileId: number,
  filename: string
) => {
  console.log("deletePatrimonyFileModal");
  try {
    const response = await api.delete(
      `/patrimony/files/${filename}/${patrimonyFileId}`
    );
    console.log("response status: ", response.status);
    return response;
  } catch (e) {
    console.log(e);
  }
};
export const sendChecklist = async (checklist: MovementationChecklist) => {
  try {
    const response = await api.post(`/checklist`, checklist);
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const deleteMovementationFileModal = async (
  movementationFileId: number,
  filename: string
) => {
  try {
    const response = await api.delete(
      `/movementation/files/${filename}/${movementationFileId}`
    );
    console.log("response status: ", response.status);
    return response;
  } catch (e) {
    console.log(e);
  }
};
export const getMovementationsByPatrimonyId = async (patrimonyId: number) => {
  try {
    const response = await api.get(`movementation/${patrimonyId}`);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
export const updateMovementation = async (
  editedMovementation: Movementation
) => {
  try {
    const response = await api.put(
      `movementation/${editedMovementation.id_movimentacao}`,
      editedMovementation
    );
    return response;
  } catch (e) {
    console.log(e);
  }
};
export const getSinglePatrimony = async (patrimonyId: number) => {
  try {
    const response = await api.get<Patrimony[]>(`patrimony/${patrimonyId}`);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
export const createChecklistItem = async (
  checklistItemFile: ChecklistItemFile,
  formData: FormData
) => {
  console.log("createChecklistItem");
  try {
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    formData.append("checklistItemFile", JSON.stringify(checklistItemFile));

    const response = await api.post(
      "/checklist/checklistItems/file",
      formData,
      config
    );
    if (response) return response;
  } catch (e) {
    console.log(e);
  }
};

export const uploadFileToChecklistItemFile = async (
  id_item_checklist_movimentacao: number,
  file: FormData
) => {
  console.log("uploadFileToChecklistItemFile");
  try {
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: file,
    };
    const response = await api.put(
      `/checklist/checklistItems/file/${id_item_checklist_movimentacao}`,
      file,
      config
    );
    return response.data.fileUrl;
  } catch (e) {
    console.log(e);
  }
};

export const getPatrimonyFiles = async (patrimonyId: number) => {
  try {
    const response = await api.get<PatrimonyFile[]>(
      `patrimony/files/${patrimonyId}`
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export const createPatrimonyfile = async (
  patrimonyId: number,
  file: FormData
) => {
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
};
export const acceptMovementation = async (movementationId: number) => {
  try {
    const response = await api.put(`movementation/accept/${movementationId}`);
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const updatePatrimony = async (patrimony: Patrimony) => {
  try {
    const response = await api.put(
      `patrimony/${patrimony.id_patrimonio}`,
      patrimony
    );
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const deleteMovementation = async (
  movimentationId: number,
  patrimonyId: number
) => {
  try {
    const response = await api.delete(
      `movementation//${patrimonyId}/${movimentationId}`
    );
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const getMovementationFiles = async (movementationId: number) => {
  try {
    const response = await api.get(`movementation/files/${movementationId}`);
    if (response.data) return response.data;
  } catch (e) {
    console.log(e);
  }
};

import api from "../api";
import { DateFilter } from "./types";

export const getOpportunities = async (
  finished: boolean,
  dateFilters: DateFilter[]
) => {
  try {
    const response = await api.get("/opportunity", {
      params: { finished, dateFilters },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};
export const fetchStatusList = async () => {
  try {
    const response = await api.get("/opportunity/status");
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
export const fetchSalers = async () => {
  try {
    const response = await api.get("/opportunity/saler");
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
export const fetchAllClients = async () => {
  try {
    const respoonse = await api.get("/opportunity/client");
    return respoonse.data;
  } catch (e) {
    console.log(e);
  }
};

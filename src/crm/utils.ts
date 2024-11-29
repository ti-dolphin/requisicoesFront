import api from "../api";

export const getOpportunities = async () => {
    try {
        const response = await api.get("/opportunity");
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
};

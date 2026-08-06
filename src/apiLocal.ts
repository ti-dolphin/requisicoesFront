import axios from "axios";

const apiLocal = axios.create({
  baseURL: import.meta.env.VITE_API_LOCAL_URL || "http://10.0.0.9:5980/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiLocal.interceptors.request.use(
  async (config) => {
    const token = window.localStorage.getItem("token");

    config.headers.Authorization = token;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiLocal.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default apiLocal;

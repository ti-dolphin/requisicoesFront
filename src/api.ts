import axios from "axios";

export const api = axios.create({
  // baseURL: "https://apicontrolehomologacao.dse.com.br",
  // baseURL: "https://apicontrole.dse.com.br",
  baseURL: "https://apicontrolehomologacao.dse.com.br",
  // baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  function (config) {
    const token = window.localStorage.getItem("token") || "";
    config.headers["Authorization"] = token;
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
}   
);

api.interceptors.response.use(
  function(response){
    return response;
  },
  function(error) {
    if (
      !window.localStorage.getItem("token") ||
      error.response.data.message === "Not authorized"
    ) {
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;

//ALTERAÇÔES

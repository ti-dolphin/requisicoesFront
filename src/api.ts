import axios from "axios";
//PROD: https://apicontrole.dse.com.br
//HOMOLOG: https://apicontrolehomologacao.dse.com.br
//http://localhost:3001

export const api = axios.create({
  baseURL: "https://apicontrole.dse.com.br",
  headers: {
    "Content-Type": "application/json",
    Authorization: window.localStorage.getItem("token"),
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
    console.log('intercptor response')
    return response;
  },
  function(error) {
   console.log("error message: ", error.response.data.message);
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

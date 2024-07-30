import axios from "axios";
//PROD: https://requisicoes-backend.vercel.app
//http://localhost:3000
//currentProd : https://apicontrolehomologacao.dse.com.br
const api = axios.create({
  baseURL: "https://apicontrolehomologacao.dse.com.br", // Substitua pela URL do seu backend
  headers: {
    Accept: "*/*",
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
    if (
      !window.localStorage.getItem("token")
    ) {
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;

//ALTERAÇÔES

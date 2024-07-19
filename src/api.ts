import axios from 'axios';
//PROD: https://requisicoes-backend.vercel.app
//http://localhost:3000
//currentProd : https://apicontrole.dse.com.br
const api = axios.create({
  baseURL: "https://apicontrole.dse.com.br", // Substitua pela URL do seu backend
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
  },
});

export default api;

//ALTERAÇÔES
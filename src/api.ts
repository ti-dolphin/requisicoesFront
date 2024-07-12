import axios from 'axios';
//PROD: https://requisicoes-backend.vercel.app
//http://localhost:3000
//currentProd : http://35.198.25.52
const api = axios.create({
  baseURL: "http://35.198.25.52", // Substitua pela URL do seu backend
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
  },
});

export default api;

//ALTERAÇÔES
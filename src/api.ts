import axios from 'axios';
//PROD: https://requisicoes-backend.vercel.app
//http://localhost:3000

const api = axios.create({
  baseURL: "https://requisicoes-backend.vercel.app", // Substitua pela URL do seu backend
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
  },
});

export default api;

//ALTERAÇÔES
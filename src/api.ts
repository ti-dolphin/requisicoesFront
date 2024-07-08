import axios from 'axios';
//PROD: https://requisicoes-backend.vercel.app
//http://localhost:3000
//qa: qabackend-ti-dolphins-projects.vercel.app
const api = axios.create({
  baseURL: "qabackend-ti-dolphins-projects.vercel.app", // Substitua pela URL do seu backend
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
  },
});

export default api;

//ALTERAÇÔES
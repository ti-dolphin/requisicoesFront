import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001',  
    // baseURL: 'https://apicontrolehomologacao.dse.com.br',
    // baseURL: 'https://apicontrole.dse.com.br',
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    async config => {
        const token =  window.localStorage.getItem('token');
        
        config.headers.Authorization = token;
            return config;
    },
    error => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            window.localStorage.removeItem('token');  
            window.localStorage.removeItem('user');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://leave-management-system-production.up.railway.app/',
});

export default api;
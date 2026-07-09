import axios from 'axios';

const API = axios.create({
  baseURL: 'https://vmp-server.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
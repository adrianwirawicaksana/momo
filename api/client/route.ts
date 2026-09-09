import axios, { AxiosInstance } from 'axios';

export const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://momo-be-production.up.railway.app', 
  headers: {
    'Content-Type': 'application/json',
  },
});
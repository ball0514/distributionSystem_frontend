import axios, { type AxiosInstance } from 'axios';

// 1. 從環境變數讀取網址
const API_BASE_URL: string = import.meta.env.VITE_API_URL || '';

// 2. 建立並指定為 AxiosInstance 型別
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;

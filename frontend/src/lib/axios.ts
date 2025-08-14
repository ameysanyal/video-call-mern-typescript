import axios, { AxiosError } from 'axios';

const BASE_URL =
  import.meta.env.VITE_MODE === 'development'
    ? 'http://localhost:5001/api'
    : `${import.meta.env.VITE_BACKEND_URL}/api`;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});

export { AxiosError };

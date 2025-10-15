import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ends cookies automatically
});

export default api;

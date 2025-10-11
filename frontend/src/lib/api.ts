import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ends cookies automatically
});

export default api;




// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000/api",
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true,
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token && config.headers) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;

// intercepor

// axios is a library which is used to make http reqs like get,post,put,dlt etc to the backend api.
import axios from "axios";
// we maked a obj or variable so can be used everywhere, instead writting same config like passing header, url etc everywhere.
// means like if we write, api.get("/users"), it is http://localhost:3001/api/users
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3001/api",
  // I’m sending data in JSON format
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // adds cookies automatically, with every req.
});

export default api;

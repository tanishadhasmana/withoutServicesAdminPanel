import axios from "axios";
import type { Config } from "../types/Config";

// ✅ Read base API URL from frontend .env (VITE_API_BASE)
const BASE_URL = `${import.meta.env.VITE_API_BASE}/config`;

/**
 * Fetch all configurations
 */
export const getApplicationConfigList = async (): Promise<Config[]> => {
  const response = await axios.get(BASE_URL, { withCredentials: true });
  return response.data;
};

/**
 * Fetch single configuration by ID
 */
export const getApplicationConfigById = async (id: number): Promise<Config> => {
  const response = await axios.get(`${BASE_URL}/${id}`, { withCredentials: true });
  return response.data;
};

/**
 * Create a new configuration
 */
export const createApplicationConfig = async (
  data: Omit<Config, "id" | "createdAt" | "updatedAt">
): Promise<Config> => {
  const response = await axios.post(BASE_URL, data, { withCredentials: true });
  return response.data;
};

/**
 * Update configuration
 */
export const updateApplicationConfigById = async (
  id: number,
  data: Omit<Config, "id" | "createdAt" | "updatedAt">
): Promise<Config> => {
  const response = await axios.put(`${BASE_URL}/${id}`, data, { withCredentials: true });
  return response.data;
};

/**
 * Soft delete configuration
 */
export const deleteApplicationConfigById = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`, { withCredentials: true });
};





// // src/services/applicationConfigService.ts
// import axios from "axios";
// import type { ApplicationConfig } from "../types/ApplicationConfig";

// const BASE_URL = "http://localhost:3000/api/application-config";

// export const getApplicationConfigList = async (): Promise<ApplicationConfig[]> => {
//   const res = await axios.get(BASE_URL);
//   return res.data;
// };

// export const getApplicationConfigById = async (id: number): Promise<ApplicationConfig> => {
//   const res = await axios.get(`${BASE_URL}/${id}`);
//   return res.data;
// };

// export const createApplicationConfig = async (data: Omit<ApplicationConfig, "id" | "createdAt" | "updatedAt">): Promise<ApplicationConfig> => {
//   const res = await axios.post(BASE_URL, data);
//   return res.data;
// };

// export const updateApplicationConfigById = async (id: number, data: Omit<ApplicationConfig, "id" | "createdAt" | "updatedAt">): Promise<ApplicationConfig> => {
//   const res = await axios.put(`${BASE_URL}/${id}`, data);
//   return res.data;
// };

// export const deleteApplicationConfigById = async (id: number): Promise<void> => {
//   await axios.delete(`${BASE_URL}/${id}`);
// };





// import api from "../lib/api";
// import type { ApplicationConfig } from "../types/ApplicationConfig";

// // ✅ Get all configs
// export const getAppConfigList = async (): Promise<ApplicationConfig[]> => {
//   const { data } = await api.get<ApplicationConfig[]>("/config");
//   return data;
// };

// // ✅ Create new config
// export const createAppConfig = async (
//   config: Omit<ApplicationConfig, "id" | "createdAt" | "updatedAt" | "deletedAt">
// ): Promise<ApplicationConfig> => {
//   const { data } = await api.post<ApplicationConfig>("/config", config);
//   return data;
// };

// // ✅ Update config
// export const updateAppConfig = async (
//   id: number,
//   config: Partial<ApplicationConfig>
// ): Promise<ApplicationConfig> => {
//   const { data } = await api.put<ApplicationConfig>(`/config/${id}`, config);
//   return data;
// };

// // ✅ Delete config
// export const deleteAppConfig = async (id: number): Promise<{ message: string }> => {
//   const { data } = await api.delete<{ message: string }>(`/config/${id}`);
//   return data;
// };

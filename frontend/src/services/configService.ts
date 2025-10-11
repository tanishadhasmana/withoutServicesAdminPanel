// src/services/applicationConfigService.ts
import axios from "axios";
import type { ApplicationConfig } from "../types/ApplicationConfig";

// ✅ Use the same route prefix as backend (app.ts → app.use("/api/config", configRoutes))
const BASE_URL = "http://localhost:3000/api/config";

/**
 * Fetch all configurations
 */
export const getApplicationConfigList = async (): Promise<ApplicationConfig[]> => {
  const res = await axios.get(BASE_URL, { withCredentials: true });
  return res.data;
};

/**
 * Fetch a single configuration by ID
 */
export const getApplicationConfigById = async (id: number): Promise<ApplicationConfig> => {
  const res = await axios.get(`${BASE_URL}/${id}`, { withCredentials: true });
  return res.data;
};

/**
 * Create a new configuration
 */
export const createApplicationConfig = async (
  data: Omit<ApplicationConfig, "id" | "createdAt" | "updatedAt">
): Promise<ApplicationConfig> => {
  const res = await axios.post(BASE_URL, data, { withCredentials: true });
  return res.data;
};

/**
 * Update an existing configuration by ID
 */
export const updateApplicationConfigById = async (
  id: number,
  data: Omit<ApplicationConfig, "id" | "createdAt" | "updatedAt">
): Promise<ApplicationConfig> => {
  const res = await axios.put(`${BASE_URL}/${id}`, data, { withCredentials: true });
  return res.data;
};

/**
 * Soft delete a configuration by ID
 */
export const deleteApplicationConfigById = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`, { withCredentials: true });
};






// // src/services/configService.ts
// import api from "../lib/api";
// import type { ApplicationConfig } from "../types/ApplicationConfig";

// // Get all configs
// export const getConfigList = async (): Promise<ApplicationConfig[]> => {
//   const { data } = await api.get<ApplicationConfig[]>("/config"); // match backend
//   return data;
// };

// // Get single config by ID
// export const getConfigById = async (id: number): Promise<ApplicationConfig> => {
//   const { data } = await api.get<ApplicationConfig>(`/config/${id}`);
//   return data;
// };

// // Update config
// export const updateConfig = async (
//   id: number,
//   payload: Partial<ApplicationConfig>
// ): Promise<ApplicationConfig> => {
//   const { data } = await api.put<ApplicationConfig>(`/config/${id}`, payload);
//   return data;
// };

// // Delete config
// export const deleteConfig = async (id: number): Promise<{ message: string }> => {
//   const { data } = await api.delete<{ message: string }>(`/config/${id}`);
//   return data;
// };






// import api from "../lib/api";
// import type { Config, ConfigStatus } from "../types/Config";

// // Fetch all configs with optional status filter
// export const getConfigList = async (status: ConfigStatus | "all" = "all"): Promise<Config[]> => {
//   const { data } = await api.get("/api/application-config", { params: { status } });
//   return data;
// };

// export const createConfig = async (config: Omit<Config, "id">) => {
//   const { data } = await api.post("/api/application-config", config);
//   return data;
// };

// export const updateConfig = async (id: number, config: Partial<Config>) => {
//   const { data } = await api.put(`/api/application-config/${id}`, config);
//   return data;
// };

// export const deleteConfig = async (id: number) => {
//   const { data } = await api.delete(`/api/application-config/${id}`);
//   return data;
// };

// export const getConfigById = async (id: number): Promise<Config> => {
//   const { data } = await api.get(`/api/application-config/${id}`);
//   return data;
// };





// import api from "../lib/api";
// import type { Config, ConfigStatus } from "../types/Config";

// // ✅ Get all configs with optional status filter
// export const getConfigs = async (status?: ConfigStatus | "all"): Promise<Config[]> => {
//   const { data } = await api.get<Config[]>("/application-config", {
//     params: status && status !== "all" ? { status } : undefined,
//   });
//   return data;
// };

// export const createConfig = async (config: Omit<Config, "id">) => {
//   const { data } = await api.post("/application-config", config);
//   return data;
// };

// export const updateConfig = async (id: number, config: Partial<Config>) => {
//   const { data } = await api.put(`/application-config/${id}`, config);
//   return data;
// };

// export const deleteConfig = async (id: number) => {
//   const { data } = await api.delete(`/application-config/${id}`);
//   return data;
// };

// export const getConfigById = async (id: number): Promise<Config> => {
//   const { data } = await api.get(`/application-config/${id}`);
//   return data;
// };

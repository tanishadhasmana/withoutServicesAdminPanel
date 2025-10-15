// src/services/applicationConfigService.ts
import axios from "axios";
import type { ApplicationConfig } from "../types/ApplicationConfig";

// ✅ Use the same route prefix as backend (app.ts → app.use("/api/config", configRoutes))
const BASE_URL = "http://localhost:3000/api/config";

/**
 * Fetch all configurations
 */
export const getApplicationConfigList = async (
  page: number = 1,
  limit: number = 10,
  status: string = "all"
): Promise<{ data: ApplicationConfig[]; total: number; totalPages: number; currentPage: number }> => {
  const res = await axios.get(BASE_URL, {
    params: { page, limit, status },
    withCredentials: true,
  });
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




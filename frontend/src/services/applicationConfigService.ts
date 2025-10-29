import axios from "axios";
import type { Config } from "../types/Config";

// ✅ Read base API URL from frontend .env (VITE_API_BASE)
const BASE_URL = `${import.meta.env.VITE_API_BASE}/config`;

/**
 * Fetch all configurations-- for pagiantion
 */
// export const getApplicationConfigList = async (
//   page = 1,
//   limit = 10
// ): Promise<{ data: Config[]; total: number }> => {
//   const response = await axios.get(`${BASE_URL}?page=${page}&limit=${limit}`, {
//     withCredentials: true,
//   });
//   return response.data;
// };

export const getApplicationConfigList = async (
  page = 1,
  limit = 10,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
): Promise<{ data: Config[]; total: number; totalPages?: number; currentPage?: number }> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: Record<string, any> = { page, limit };
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;

  const response = await axios.get(`${BASE_URL}`, { params, withCredentials: true });
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




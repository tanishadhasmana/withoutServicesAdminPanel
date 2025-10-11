import api from "../lib/api";
import type { CMS, CMSFormData, CMSStatus } from "../types/CMS";

// Get all CMS pages with optional filters
export const getCmsList = async (filters?: {
  id?: string;
  key?: string;
  title?: string;
  status?: CMSStatus;
}): Promise<CMS[]> => {
  const { data } = await api.get<CMS[]>("/cms", { params: filters });
  return data;
};

// Get single CMS by ID
export const getCmsById = async (id: number): Promise<CMS> => {
  const { data } = await api.get<CMS>(`/cms/${id}`);
  return data;
};

// Create CMS
export const createCms = async (cms: CMSFormData): Promise<CMS> => {
  const { data } = await api.post<CMS>("/cms", cms);
  return data;
};

// Update CMS
export const updateCms = async (id: number, cms: CMSFormData): Promise<CMS> => {
  const { data } = await api.put<CMS>(`/cms/${id}`, cms);
  return data;
};

// Delete CMS
export const deleteCms = async (id: number): Promise<{ message: string }> => {
  const { data } = await api.delete<{ message: string }>(`/cms/${id}`);
  return data;
};








// src/services/cmsService.ts
// import api from "../lib/api";
// import type { CMS, CMSFormData } from "../types/CMS";

// // Get all CMS pages
// export const getCmsList = async (): Promise<CMS[]> => {
//   const { data } = await api.get<CMS[]>("/cms");
//   return data;
// };

// // Get single CMS by ID
// export const getCmsById = async (id: number): Promise<CMS> => {
//   const { data } = await api.get<CMS>(`/cms/${id}`);
//   return data;
// };

// // Create CMS
// export const createCms = async (cms: CMSFormData): Promise<CMS> => {
//   const { data } = await api.post<CMS>("/cms", cms);
//   return data;
// };

// // Update CMS
// export const updateCms = async (id: number, cms: CMSFormData): Promise<CMS> => {
//   const { data } = await api.put<CMS>(`/cms/${id}`, cms);
//   return data;
// };

// // Delete CMS
// export const deleteCms = async (id: number): Promise<{ message: string }> => {
//   const { data } = await api.delete<{ message: string }>(`/cms/${id}`);
//   return data;
// };


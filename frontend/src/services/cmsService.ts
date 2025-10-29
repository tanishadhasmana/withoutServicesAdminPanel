import api from "../lib/api";
import type { CMS, CMSFormData, CMSStatus } from "../types/CMS";

// Get paginated CMS list with optional filters
// export const getCmsList = async ({
//   id,
//   key,
//   title,
//   status,
//   page = 1,
//   limit = 10,
// }: {
//   id?: string;
//   key?: string;
//   title?: string;
//   status?: CMSStatus | "";
//   page?: number;
//   limit?: number;
// }) => {
//   const { data } = await api.get("/cms", {
//     params: { id, key, title, status, page, limit },
//   });
//   return data;
// };

export const getCmsList = async ({
  id,
  key,
  title,
  status,
  page = 1,
  limit = 10,
  sortBy,
  order,
}: {
  id?: string;
  key?: string;
  title?: string;
  status?: CMSStatus | "";
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}) => {
  const params: Record<string, string | number | undefined> = {
    id,
    key,
    title,
    status,
    page,
    limit,
  };

  if (sortBy) params.sortBy = sortBy;
  if (order) params.order = order;

  const { data } = await api.get("/cms", { params });
  return data;
};





// Get single CMS by ID
export const getCmsById = async (id: number): Promise<CMS> => {
  const { data } = await api.get(`/cms/${id}`);
  return data;
};

// Create CMS
export const createCms = async (cms: CMSFormData): Promise<CMS> => {
  const { data } = await api.post("/cms", cms);
  return data;
};

// Update CMS
export const updateCms = async (id: number, cms: CMSFormData): Promise<CMS> => {
  const { data } = await api.put(`/cms/${id}`, cms);
  return data;
};

// Delete CMS
export const deleteCms = async (id: number): Promise<{ message: string }> => {
  const { data } = await api.delete(`/cms/${id}`);
  return data;
};


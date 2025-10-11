import api from "../lib/api";
import type { FAQ, FAQFormData } from "../types/FAQ";

// Get all FAQs
export const getFaqList = async (): Promise<FAQ[]> => {
  const { data } = await api.get<FAQ[]>("/faq");
  return data;
};

// Get single FAQ by ID
export const getFaqById = async (id: number): Promise<FAQ> => {
  const { data } = await api.get<FAQ>(`/faq/${id}`);
  return data;
};

// Create FAQ
export const createFaq = async (faq: FAQFormData): Promise<FAQ> => {
  const { data } = await api.post<FAQ>("/faq", faq);
  return data;
};

// Update FAQ
export const updateFaq = async (id: number, faq: Partial<FAQFormData>): Promise<FAQ> => {
  const { data } = await api.put<FAQ>(`/faq/${id}`, faq);
  return data;
};

// Delete FAQ
export const deleteFaq = async (id: number): Promise<{ message: string }> => {
  const { data } = await api.delete<{ message: string }>(`/faq/${id}`);
  return data;
};






// src/services/faqService.ts
// import api from "../lib/api";
// import type { FAQ } from "../types/FAQ";

// // Existing functions
// export const getFaqList = async (): Promise<FAQ[]> => {
//   const { data } = await api.get<FAQ[]>("/faq");
//   return data;
// };

// export const createFaq = async (faq: Omit<FAQ, "id" | "createdAt" | "updatedAt" | "deletedAt">) => {
//   const { data } = await api.post("/faq", faq);
//   return data;
// };

// export const updateFaq = async (id: number, faq: Partial<FAQ>) => {
//   const { data } = await api.put(`/faq/${id}`, faq);
//   return data;
// };

// export const deleteFaq = async (id: number) => {
//   const { data } = await api.delete(`/faq/${id}`);
//   return data;
// };

// // ✅ Add this function to fetch a single FAQ by id
// export const getFaqById = async (id: number): Promise<FAQ> => {
//   const { data } = await api.get<FAQ>(`/faq/${id}`);
//   return data;
// };



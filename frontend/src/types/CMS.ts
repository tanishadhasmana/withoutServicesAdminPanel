// src/types/CMS.ts
export type CMSStatus = "active" | "inactive";

export interface CMS {
  id: number;
  key: string;
  title?: string | null;
  metaKeyword?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  content?: string | null;
  status: CMSStatus;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

// ✅ CMS Form Data type for Add/Edit form
export interface CMSFormData {
  key: string;
  title: string;
  metaKeyword: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  status: CMSStatus;
}




// export type CMSStatus = "active" | "inactive";

// export interface CMS {
//   id: number;
//   key: string;
//   title?: string | null;
//   metaKeyword?: string | null;
//   metaTitle?: string | null;
//   metaDescription?: string | null;
//   content?: string | null;
//   status: CMSStatus;
//   createdBy?: number | null;
//   updatedBy?: number | null;
//   createdAt: string;
//   updatedAt?: string | null;
//   deletedAt?: string | null;
// }

// // Form data type for Add/Edit CMS
// export interface CMSFormData {
//   key: string;
//   title: string;
//   metaKeyword?: string;
//   metaTitle?: string;
//   metaDescription?: string;
//   content: string;
//   status: CMSStatus;
// }

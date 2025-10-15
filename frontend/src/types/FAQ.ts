export type FAQStatus = "active" | "inactive";

export interface FAQ {
  id: number;
  question: string;
  answer?: string | null;
  displayOrder: number;
  status: FAQStatus;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

// ✅ FAQ Form Data type for Add/Edit
export interface FAQFormData {
  question: string;
  answer: string;
  displayOrder: number;
  status: FAQStatus;
}




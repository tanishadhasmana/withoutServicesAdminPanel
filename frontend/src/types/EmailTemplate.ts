export type TemplateStatus = "active" | "inactive";

export interface EmailTemplate {
  id: number;
  key: string;
  title?: string | null;
  subject?: string | null;
  fromEmail?: string | null;
  fromName?: string | null;
  body?: string | null;
  status: TemplateStatus;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

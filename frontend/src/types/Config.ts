export type ConfigStatus = "active" | "inactive";

export interface Config {
  id: number;
  key: string;
  value?: string | null;
  displayOrder: number;
  status: ConfigStatus;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

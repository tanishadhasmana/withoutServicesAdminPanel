// src/types/ApplicationConfig.ts
export type ConfigStatus = "active" | "inactive";

export interface ApplicationConfig {
  id: number;
  key: string;
  value: string;
  displayOrder: number;
  status: ConfigStatus;
  createdBy?: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt?: string;
}

// Optional: filter params type for API calls
export interface ApplicationConfigFilter {
  id?: string;
  key?: string;
  value?: string;
  status?: ConfigStatus;
}








// export interface ApplicationConfig {
//   id: number;
//   key: string;
//   value?: string | null;
//   displayOrder: number;
//   status: "active" | "inactive";
//   createdAt?: string;  
//   updatedAt?: string;
// }

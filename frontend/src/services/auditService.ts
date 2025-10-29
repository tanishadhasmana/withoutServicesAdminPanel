import axios from "axios";
import type { AuditLog } from "../types/AuditLog";

const BASE_URL = `${import.meta.env.VITE_API_BASE}/audit`;

export interface PaginatedAuditLogsResponse {
  data: AuditLog[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// ✅ Define backend response type (extends AuditLog)
interface BackendAuditLog extends AuditLog {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// export const getAuditLogs = async (
//   page = 1,
//   limit = 10
// ): Promise<PaginatedAuditLogsResponse> => {
//   const response = await axios.get(BASE_URL, {
//     params: { page, limit },
//     withCredentials: true,
//   });

//   const { data, total, totalPages, currentPage } = response.data;

//   // ✅ Use BackendAuditLog instead of any or Partial<AuditLog>
//   const logs: AuditLog[] = (data as BackendAuditLog[]).map((log) => ({
//     id: log.id ?? 0,
//     userId: log.userId ?? null,
//     username:
//       log.username ||
//       `${log.firstName ?? ""} ${log.lastName ?? ""}`.trim() ||
//       log.email ||
//       "Unknown",
//     type: log.type ?? "-",
//     activity: log.activity ?? "-",
//     timestamp: log.timestamp ?? new Date().toISOString(),
//   }));

//   return { data: logs, total, totalPages, currentPage };
// };

export const getAuditLogs = async (
  page = 1,
  limit = 10,
  sortBy?: string,
  order?: "asc" | "desc"
): Promise<PaginatedAuditLogsResponse> => {
  const params: Record<string, any> = { page, limit };
  if (sortBy) params.sortBy = sortBy;
  if (order) params.order = order;

  const response = await axios.get(BASE_URL, {
    params,
    withCredentials: true,
  });

  const { data, total, totalPages, currentPage } = response.data;

  const logs: AuditLog[] = (data as BackendAuditLog[]).map((log) => ({
    id: log.id ?? 0,
    userId: log.userId ?? null,
    username:
      log.username ||
      `${log.firstName ?? ""} ${log.lastName ?? ""}`.trim() ||
      log.email ||
      "Unknown",
    type: log.type ?? "-",
    activity: log.activity ?? "-",
    timestamp: log.timestamp ?? new Date().toISOString(),
  }));

  return { data: logs, total, totalPages, currentPage };
};

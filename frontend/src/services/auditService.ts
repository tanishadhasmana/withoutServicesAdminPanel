// src/services/auditService.ts
import api from "../lib/api";
import type { AuditLog } from "../types/AuditLog";

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const { data } = await api.get<AuditLog[]>("/audit");
  return data;
};

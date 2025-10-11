export interface AuditLog {
  id: number;
  userId?: number | null;
  username: string;
  type?: string | null;
  activity?: string | null;
  timestamp: string;
}

export const getPerformedBy = (log: AuditLog) => log.username || "Unknown";

// src/services/audit.service.ts
import db from "../../connection";

export const getAuditLogsService = async (opts?: { limit?: number; offset?: number; type?: string }) => {
  const { limit = 50, offset = 0, type } = opts || {};
  let query = db("audit_logs as a")
    .select(
      "a.id",
      "a.type",
      "a.activity",
      "a.timestamp",
      "u.id as userId",
      "u.firstName",
      "u.lastName",
      "u.email"
    )
    .leftJoin("users as u", "a.userId", "u.id")
    .orderBy("a.timestamp", "desc")
    .limit(Number(limit))
    .offset(Number(offset));

  if (type) query = query.where("a.type", String(type));

  const rows = await query;
  return rows;
};





// import db from "../../connection";

// export const getAuditLogsService = async () => {
//   return db("audit_logs").select("*").orderBy("created_at", "desc");
// };


// import db from "../../connection";

// export const getAuditLogsService = async () => {
//   return await db("audit_logs").select("*").orderBy("created_at", "desc");
// };

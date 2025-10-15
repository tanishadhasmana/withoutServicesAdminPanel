import db from "../../connection";


export const fetchAuditLogs = async (
  limit: number,
  offset: number,
  type?: string
) => {
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
    .leftJoin("users as u", "a.userId", "u.id");

  if (type) query = query.where("a.type", type);

  // Total count
  const [{ count }] = await query.clone().clearSelect().count({ count: "*" });

  // Paginated data
  const logs = await query
    .orderBy("a.timestamp", "desc")
    .limit(limit)
    .offset(offset);

  return { logs, total: Number(count) };
};

// src/utils/auth.ts
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return {
      userId: user.id,
      username: `${user.firstName} ${user.lastName}`,
    };
  } catch (err) {
    console.error("Failed to parse user from localStorage", err);
    return null;
  }
};

// step 1 to centralize the fucn for audit logs
interface LogActivityParams {
  userId: any;
  username: string;
  type: string; // e.g., "View", "Authentication", "Update"
  activity: string; // e.g., "Viewed dashboard", "Created user"
}
export const logActivity = async ( params: LogActivityParams) => {
  const { userId, username, type, activity } = params;
  return db("audit_logs").insert({
    userId,
    username,
    type,
    activity,
    timestamp: db.fn.now(),
  });
};
// import { Request, Response } from "express";
// import * as auditService from "../services/audit.service";

// export const getAuditLogs = async (req: Request, res: Response) => {
//   try {
//     const logs = await auditService.getAuditLogsService();
//     res.json(logs);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching audit logs", error });
//   }
// };





// import { Request, Response } from "express";
// import * as auditService from "../services/audit.service";

// export const getAuditLogs = async (req: Request, res: Response) => {
//   try {
//     const logs = await auditService.getAuditLogsService();
//     res.json(logs);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching audit logs", error });
//   }
// };





import { Request, Response } from "express";
import db from "../../connection";

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { limit = "50", offset = "0", type } = req.query as {
      limit?: string;
      offset?: string;
      type?: string;
    };

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

    if (type) query = query.where("a.type", type);

    const logs = await query;
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch audit logs",
      error: (err as Error).message,
    });
  }
};

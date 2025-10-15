import { Request, Response } from "express";
import { fetchAuditLogs, logActivity } from "../services/audit.service";

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { limit = "10", page = "1", type } = req.query as {
      limit?: string;
      page?: string;
      type?: string;
    };

    const numericLimit = Number(limit);
    const numericPage = Number(page);
    const offset = (numericPage - 1) * numericLimit;

    const { logs, total } = await fetchAuditLogs(
      numericLimit,
      offset,
      type
    );

    const totalPages = Math.ceil(total / numericLimit);

    return res.json({
      data: logs,
      total,
      totalPages,
      currentPage: numericPage,
    });
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    return res.status(500).json({
      message: "Failed to fetch audit logs",
      error: (err as Error).message,
    });
  }
};

export const getAuditLogsController = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const type = req.query.type as string | undefined;

    const logs = await fetchAuditLogs(limit, offset, type);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch audit logs", error: err });
  }
};

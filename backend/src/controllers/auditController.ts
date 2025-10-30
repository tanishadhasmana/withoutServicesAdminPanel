import { Request, Response } from "express";
import { fetchAuditLogs } from "../services/audit.service";

// fuction for frontend pagination.
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    // feching data from query params
    const { limit = "10", page = "1", type, sortBy, order } = req.query as {
      limit?: string;
      page?: string;
      type?: string;
      sortBy?: string;
      order?: string;
    };
// converting limit and page to numbers and calculating offset
    const numericLimit = Number(limit) || 10;
    const numericPage = Number(page) || 1;
    const offset = (numericPage - 1) * numericLimit;
// calling fetchAuditLogs service function--- which will return logs and total count
    const { logs, total } = await fetchAuditLogs(
      numericLimit,
      offset,
      type,
      sortBy as string | undefined,
      (order as "asc" | "desc") || undefined
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


// 
export const getAuditLogsController = async (req: Request, res: Response) => {
  try {
    // fetching data from query params
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const type = req.query.type as string | undefined;
// calling same sevice fuction with limit, offset, type
    const logs = await fetchAuditLogs(limit, offset, type);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch audit logs", error: err });
  }
};

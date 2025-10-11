// http://localhost:5174/admin/audit
import { Router } from "express";
import { getAuditLogs } from "../controllers/auditController";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect, getAuditLogs);

export default router;

import { Router } from "express";
import { getAuditLogs } from "../controllers/auditController";
import { protect, requirePermission } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect, requirePermission("logs_list"), getAuditLogs); 

export default router;




// import { Router } from "express";
// import { getAuditLogs } from "../controllers/auditController";
// import { protect, requireAdmin } from "../middleware/authMiddleware";

// const router = Router();

// router.get("/", protect, getAuditLogs);
// export default router;

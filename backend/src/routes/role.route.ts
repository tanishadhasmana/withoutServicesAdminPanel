import { Router } from "express";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
  getRoleById,
  getRolesCount
} from "../controllers/roleController";
import { protect, requirePermission } from "../middleware/authMiddleware";

const router = Router();

// 🔒 Role management routes with permissions
router.get("/", protect, requirePermission("role_list"), getRoles);
router.get("/count", protect, requirePermission("role_list"), getRolesCount);
router.get("/:id", protect, requirePermission("role_list"), getRoleById);
router.post("/", protect, requirePermission("role_add"), createRole);
router.put("/:id", protect, requirePermission("role_edit"), updateRole);
router.patch(
  "/:id/status",
  protect,
  requirePermission("role_edit"),
  toggleRoleStatus
);
router.delete("/:id", protect, requirePermission("role_delete"), deleteRole);

export default router;



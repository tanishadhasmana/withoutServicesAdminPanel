import { Router } from "express";
import * as permissionController from "../controllers/permissionController";
import { protect, requirePermission } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect, requirePermission("role_list"), permissionController.getAllPermissions);
router.get("/:roleId", protect, requirePermission("role_list"), permissionController.getRolePermissions);
router.post("/:roleId", protect, requirePermission("role_edit"), permissionController.updateRolePermissions);

export default router;


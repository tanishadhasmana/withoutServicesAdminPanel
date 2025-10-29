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
// router.patch("/:id/status", protect, requirePermission("role_status"), toggleRoleStatus);
router.patch(
  "/:id/status",
  protect,
  requirePermission("role_edit"),  // changed from role_status
  toggleRoleStatus
);
router.delete("/:id", protect, requirePermission("role_delete"), deleteRole);

export default router;




// import { Router } from "express";
// import {
//   getRoles,
//   createRole,
//   updateRole,
//   deleteRole,
//   toggleRoleStatus,
//   getRoleById,
// } from "../controllers/roleController";
// import { protect } from "../middleware/authMiddleware";

// const router = Router();

// router.get("/", protect, getRoles);
// router.get("/:id", protect, getRoleById);
// router.post("/", protect, createRole);
// router.put("/:id", protect, updateRole);
// router.patch("/:id/status", protect, toggleRoleStatus);
// router.delete("/:id", protect, deleteRole);

// export default router;

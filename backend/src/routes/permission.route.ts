import { Router } from "express";
import * as permissionController from "../controllers/permissionController";
import { protect, requirePermission } from "../middleware/authMiddleware";

const router = Router();

// 🔒 Protected routes with permissions
// router.get("/", protect, requirePermission("permission_view"), permissionController.getAllPermissions);
router.get("/", protect, requirePermission("role_list"), permissionController.getAllPermissions);

// router.get("/test", (req, res) => {
//   res.send("✅ Permission test route working!");
// });
// router.get("/:roleId", protect, requirePermission("permission_view"), permissionController.getRolePermissions);
// router.post("/:roleId", protect, requirePermission("permission_edit"), permissionController.updateRolePermissions);
router.get("/:roleId", protect, requirePermission("role_list"), permissionController.getRolePermissions);
router.post("/:roleId", protect, requirePermission("role_edit"), permissionController.updateRolePermissions);

export default router;




// src/routes/permission.route.ts
// import { Router } from "express";
// import * as permissionController from "../controllers/permissionController";

// const router = Router();


// router.get("/", permissionController.getAllPermissions);


// router.get("/test", (req, res) => {
//   res.send("✅ Permission test route working!");
// });


// router.get("/:roleId", permissionController.getRolePermissions);
// router.post("/:roleId", permissionController.updateRolePermissions);

// export default router;

// src/routes/permission.route.ts
import { Router } from "express";
import * as permissionController from "../controllers/permissionController";

const router = Router();


router.get("/", permissionController.getAllPermissions);


router.get("/test", (req, res) => {
  res.send("✅ Permission test route working!");
});


router.get("/:roleId", permissionController.getRolePermissions);
router.post("/:roleId", permissionController.updateRolePermissions);

export default router;

import { Router } from "express";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
  getRoleById,
} from "../controllers/roleController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect, getRoles);
router.post("/", protect, createRole);
router.put("/:id", protect, updateRole);
router.delete("/:id", protect, deleteRole);
router.get("/:id", protect, getRoleById);
router.patch("/:id/status", protect, toggleRoleStatus);

export default router;

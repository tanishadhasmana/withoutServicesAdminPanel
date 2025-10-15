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
router.get("/:id", protect, getRoleById);
router.post("/", protect, createRole);
router.put("/:id", protect, updateRole);
router.patch("/:id/status", protect, toggleRoleStatus);
router.delete("/:id", protect, deleteRole);

export default router;

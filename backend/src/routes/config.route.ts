// src/routes/configRoutes.ts
import { Router } from "express";
import {
  getConfigList,
  getConfigById,
  createConfig,
  updateConfig,
  deleteConfig,
} from "../controllers/configController";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// ✅ Get all configs
router.get("/", protect, getConfigList);

// ✅ Get config by ID (for edit page)
router.get("/:id", protect, getConfigById);

// ✅ Create new config
router.post("/", protect, createConfig);

// ✅ Update config
router.put("/:id", protect, updateConfig);

// ✅ Delete config (soft delete)
router.delete("/:id", protect, deleteConfig);

export default router;

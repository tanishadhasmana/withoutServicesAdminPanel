import { Router } from "express";
import {
  getConfigList,
  getConfigById,
  createConfig,
  updateConfig,
  deleteConfig,
} from "../controllers/configController";
import { protect, requirePermission } from "../middleware/authMiddleware";

const router = Router();

// List all configs → "config_view"
router.get("/", protect, requirePermission("config_list"), getConfigList);

// Get single config → "config_view"
router.get("/:id", protect, requirePermission("config_list"), getConfigById);

// Create new config → "config_create"
router.post("/", protect, requirePermission("config_add"), createConfig);

// Update config → "config_edit"
router.put("/:id", protect, requirePermission("config_edit"), updateConfig);

// Soft delete → "config_delete"
router.delete("/:id", protect, requirePermission("config_delete"), deleteConfig);

export default router;





// src/routes/configRoutes.ts
// import { Router } from "express";
// import {
//   getConfigList,
//   getConfigById,
//   createConfig,
//   updateConfig,
//   deleteConfig,
// } from "../controllers/configController";
// import { protect, requireAdmin } from "../middleware/authMiddleware";

// const router = Router();

// // ✅ Get all configs
// router.get("/", protect, getConfigList);

// // ✅ Get config by ID (for edit page)
// router.get("/:id", protect, getConfigById);

// // ✅ Create new config
// router.post("/", protect, createConfig);

// // ✅ Update config
// router.put("/:id", protect, updateConfig);

// // ✅ Delete config (soft delete)
// router.delete("/:id", protect, deleteConfig);

// export default router;

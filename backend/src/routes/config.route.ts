// import { Router } from "express";
// import {
//   getConfigList,
//   getConfigById,
//   createConfig,
//   updateConfig,
//   deleteConfig,
// } from "../controllers/configController";
// import { protect } from "../middleware/authMiddleware";

// const router = Router();

// router.get("/", protect, getConfigList); 
// router.get("/:id", protect, getConfigById); 
// router.post("/", protect, createConfig); 
// router.put("/:id", protect, updateConfig); 
// router.delete("/:id", protect, deleteConfig); 

// export default router;




// import { Router } from "express";
// import {
//   getConfigList,
//   getConfigById,
//   createConfig,
//   updateConfig,
//   deleteConfig,
// } from "../controllers/configController";
// import { protect } from "../middleware/authMiddleware";

// const router = Router();

// router.get("/", protect, getConfigList); // List all configs (with optional status filter)
// router.get("/:id", protect, getConfigById); // Get config by ID
// router.post("/", protect, createConfig); // Create config
// router.put("/:id", protect, updateConfig); // Update config
// router.delete("/:id", protect, deleteConfig); // Soft delete

// export default router;






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

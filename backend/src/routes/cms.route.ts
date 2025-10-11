// import { Router } from "express";
// import {
//   getCmsList,
//   getCmsById,
//   createCms,
//   updateCms,
//   deleteCms,
// } from "../controllers/cmsController";
// import { protect } from "../middleware/authMiddleware";

// const router = Router();

// // List all CMS pages with optional filters
// router.get("/", protect, getCmsList);

// // Get single CMS page (for edit prefill)
// router.get("/:id", protect, getCmsById);

// // Create CMS
// router.post("/", protect, createCms);

// // Update CMS
// router.put("/:id", protect, updateCms);

// // Delete CMS
// router.delete("/:id", protect, deleteCms);

// export default router;




import { Router } from "express";
import { 
  getCmsList, 
  getCmsById, 
  createCms, 
  updateCms, 
  deleteCms 
} from "../controllers/cmsController";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// List all CMS pages
router.get("/", protect, getCmsList);

// Get single CMS page (for edit prefill)
router.get("/:id", protect, getCmsById);

// Create CMS
router.post("/", protect, createCms);

// Update CMS
router.put("/:id", protect, updateCms);

// Delete CMS
router.delete("/:id", protect, deleteCms);

export default router;

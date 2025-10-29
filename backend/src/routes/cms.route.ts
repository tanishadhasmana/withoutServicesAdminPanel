import { Router } from "express";
import {  
  getCmsById, 
  createCms, 
  updateCms, 
  deleteCms, 
  getAllCms
} from "../controllers/cmsController";
import { protect, requirePermission } from "../middleware/authMiddleware";

const router = Router();

// List all CMS pages → "cms_view"
router.get("/", protect, requirePermission("cms_list"), getAllCms);

// Get single CMS page → "cms_view"
router.get("/:id", protect, requirePermission("cms_list"), getCmsById);

// Create CMS → "cms_create"
router.post("/", protect, requirePermission("cms_add"), createCms);

// Update CMS → "cms_edit"
router.put("/:id", protect, requirePermission("cms_edit"), updateCms);

// Delete CMS → "cms_delete"
router.delete("/:id", protect, requirePermission("cms_delete"), deleteCms);

export default router;




// import { Router } from "express";
// import {  
//   getCmsById, 
//   createCms, 
//   updateCms, 
//   deleteCms, 
//   getAllCms
// } from "../controllers/cmsController";
// import { protect, requireAdmin } from "../middleware/authMiddleware";

// const router = Router();

// // List all CMS pages
// router.get("/", protect, getAllCms);

// // Get single CMS page (for edit prefill)
// router.get("/:id", protect, getCmsById);

// // Create CMS
// router.post("/", protect, createCms);

// // Update CMS
// router.put("/:id", protect, updateCms);

// // Delete CMS
// router.delete("/:id", protect, deleteCms);

// export default router;

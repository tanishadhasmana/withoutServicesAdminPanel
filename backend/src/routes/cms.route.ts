import { Router } from "express";
import {  
  getCmsById, 
  createCms, 
  updateCms, 
  deleteCms, 
  getAllCms
} from "../controllers/cmsController";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// List all CMS pages
router.get("/", protect, getAllCms);

// Get single CMS page (for edit prefill)
router.get("/:id", protect, getCmsById);

// Create CMS
router.post("/", protect, createCms);

// Update CMS
router.put("/:id", protect, updateCms);

// Delete CMS
router.delete("/:id", protect, deleteCms);

export default router;

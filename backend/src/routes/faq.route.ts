// src/routes/faqRoutes.ts
import { Router } from "express";
import { 
  getFaqList, 
  getFaqById,        // ✅ import the new controller
  createFaq, 
  updateFaq, 
  deleteFaq 
} from "../controllers/faqController";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// ✅ List all FAQs
router.get("/", protect, getFaqList);

// ✅ Get single FAQ by ID (must be BEFORE PUT/DELETE)
router.get("/:id", protect, getFaqById);

// ✅ Create new FAQ
router.post("/", protect, createFaq);

// ✅ Update FAQ
router.put("/:id", protect, updateFaq);

// ✅ Delete FAQ
router.delete("/:id", protect, deleteFaq);

export default router;

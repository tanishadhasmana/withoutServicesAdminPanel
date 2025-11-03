import { Router } from "express";
import { 
  getFaqList, 
  getFaqById,
  createFaq, 
  updateFaq, 
  deleteFaq 
} from "../controllers/faqController";
import { protect, requirePermission } from "../middleware/authMiddleware";

const router = Router();

// List all FAQs → user must have "faq_view" permission
router.get("/", protect, requirePermission("faq_list"), getFaqList);

// Get single FAQ → "faq_view"
router.get("/:id", protect, requirePermission("faq_list"), getFaqById);

// Create new FAQ → "faq_create"
router.post("/", protect, requirePermission("faq_add"), createFaq);

// Update FAQ → "faq_edit"
router.put("/:id", protect, requirePermission("faq_edit"), updateFaq);

// Delete FAQ → "faq_delete"
router.delete("/:id", protect, requirePermission("faq_delete"), deleteFaq);

export default router;

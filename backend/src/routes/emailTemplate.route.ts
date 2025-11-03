import { Router } from "express";
import {
  getEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "../controllers/emailTemplateController";
import { protect, requirePermission } from "../middleware/authMiddleware";

const router = Router();

// List all templates → "email_template_view"
router.get("/", protect, requirePermission("email_list"), getEmailTemplates);

// Get one template → "email_template_view"
router.get("/:id", protect, requirePermission("email_list"), getEmailTemplateById);

// Create new template → "email_template_create"
router.post("/", protect, requirePermission("email_add"), createEmailTemplate);

// Update template → "email_template_edit"
router.put("/:id", protect, requirePermission("email_edit"), updateEmailTemplate);

// Soft delete → "email_template_delete"
router.delete("/:id", protect, requirePermission("email_delete"), deleteEmailTemplate);

export default router;



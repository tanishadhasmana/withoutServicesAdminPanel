// import { Router } from "express";
// import {
//   getEmailTemplates,
//   getEmailTemplateById,
//   createEmailTemplate,
//   updateEmailTemplate,
//   deleteEmailTemplate,
// } from "../controllers/emailTemplateController";
// import { protect } from "../middleware/authMiddleware";

// const router = Router();

// // 📬 All routes are protected
// router.get("/", protect, getEmailTemplates); // List all templates with optional status filter
// router.get("/:id", protect, getEmailTemplateById); // Get single template
// router.post("/", protect, createEmailTemplate); // Create template
// router.put("/:id", protect, updateEmailTemplate); // Update template
// router.delete("/:id", protect, deleteEmailTemplate); // Soft delete

// export default router;



import { Router } from "express";
import {
  getEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "../controllers/emailTemplateController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// 📬 All routes below are protected
router.get("/", protect, getEmailTemplates); // List all templates
router.get("/:id", protect, getEmailTemplateById); // Get one template
router.post("/", protect, createEmailTemplate); // Create new template
router.put("/:id", protect, updateEmailTemplate); // Update template
router.delete("/:id", protect, deleteEmailTemplate); // Soft delete

export default router;



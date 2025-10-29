// src/controllers/emailTemplateController.ts
import { Request, Response } from "express";
import {
  getEmailTemplatesService,
  fetchEmailTemplateById,
  insertEmailTemplate,
  updateEmailTemplateById,
  softDeleteEmailTemplate,
} from "../services/emailTemplate.service";
import { logActivity } from "../services/audit.service";

// ----------------------------
// Get all email templates (pagination + filters)
// ----------------------------
export const getEmailTemplates = async (req: Request, res: Response) => {
  try {
    const { key, title, subject, status, page = "1", limit = "10", sortBy, order } = req.query;

    // Build filters object (explicit)
    const filters: Record<string, any> = {};
    if (key) filters.key = String(key);
    if (title) filters.title = String(title);
    if (subject) filters.subject = String(subject);
    if (status) filters.status = String(status);

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 10;

    const result = await getEmailTemplatesService(
      filters,
      pageNum,
      limitNum,
      sortBy as string | undefined,
      (order as "asc" | "desc") || undefined
    );

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "View",
      activity: `Viewed Email Templates (filters: ${JSON.stringify(filters)}, page: ${pageNum})`,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching email templates:", err);
    return res.status(500).json({ message: "Failed to fetch email templates" });
  }
};

// ----------------------------
// Get email template by ID
// ----------------------------
export const getEmailTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await fetchEmailTemplateById(id);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "View",
      activity: `Viewed Email Template (ID: ${id})`,
    });

    if (!template) return res.status(404).json({ message: "Template not found" });
    res.json(template);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch email template",
      error: (err as Error).message,
    });
  }
};

// ----------------------------
// Create new email template
// ----------------------------
export const createEmailTemplate = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || null;
    const payload = {
      ...req.body,
      createdBy: userId,
      status: req.body.status || "active",
    };
    const created = await insertEmailTemplate(payload);

    await logActivity({
      userId,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Create",
      activity: `Created Email Template (Title: ${req.body.title || "N/A"})`,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Create Template Error:", err);
    res.status(500).json({
      message: "Failed to create email template",
      error: (err as Error).message,
    });
  }
};

// ----------------------------
// Update email template
// ----------------------------
export const updateEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateEmailTemplateById(id, {
      ...req.body,
      updatedBy: req.user?.id || null,
    });

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Update",
      activity: `Updated Email Template (ID: ${id})`,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update email template",
      error: (err as Error).message,
    });
  }
};

// ----------------------------
// Soft delete email template
// ----------------------------
export const deleteEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await softDeleteEmailTemplate(id, req.user?.id || null);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Delete",
      activity: `Deleted Email Template (ID: ${id})`,
    });

    res.json({ message: "Email template deleted (soft)" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete email template",
      error: (err as Error).message,
    });
  }
};




// import { Request, Response } from "express";
// import {
//   getEmailTemplatesService,
//   fetchEmailTemplateById,
//   insertEmailTemplate,
//   updateEmailTemplateById,
//   softDeleteEmailTemplate,
// } from "../services/emailTemplate.service";
// import { logActivity } from "../services/audit.service";

// // ----------------------------
// // Get all email templates (pagination + filters)
// // ----------------------------
// export const getEmailTemplates = async (req: Request, res: Response) => {
//   try {
//     const { key, title, subject, status, page = "1", limit = "10" } = req.query;
//     const filters: any = {};

//     if (key) filters.key = String(key);
//     if (title) filters.title = String(title);
//     if (subject) filters.subject = String(subject);
//     if (status) filters.status = String(status);

//     const pageNum = parseInt(String(page), 10) || 1;
//     const limitNum = parseInt(String(limit), 10) || 10;

//     // ✅ Using named service function
//     const result = await getEmailTemplatesService(filters, pageNum, limitNum);

//     await logActivity({
//       userId: req.user?.id || null,
//       username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
//       type: "View",
//       activity: `Viewed Email Templates (filters: ${JSON.stringify(filters)}, page: ${pageNum})`,
//     });

//     return res.status(200).json(result);
//   } catch (err) {
//     console.error("Error fetching email templates:", err);
//     return res.status(500).json({ message: "Failed to fetch email templates" });
//   }
// };

// // ----------------------------
// // Get email template by ID
// // ----------------------------
// export const getEmailTemplateById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const template = await fetchEmailTemplateById(id);

//     await logActivity({
//       userId: req.user?.id || null,
//       username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
//       type: "View",
//       activity: `Viewed Email Template (ID: ${id})`,
//     });

//     if (!template) return res.status(404).json({ message: "Template not found" });
//     res.json(template);
//   } catch (err) {
//     res.status(500).json({
//       message: "Failed to fetch email template",
//       error: (err as Error).message,
//     });
//   }
// };

// // ----------------------------
// // Create new email template
// // ----------------------------
// export const createEmailTemplate = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id || null;
//     const payload = {
//       ...req.body,
//       createdBy: userId,
//       status: req.body.status || "active",
//     };
//     const created = await insertEmailTemplate(payload);

//     await logActivity({
//       userId,
//       username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
//       type: "Create",
//       activity: `Created Email Template (Title: ${req.body.title || "N/A"})`,
//     });

//     res.status(201).json(created);
//   } catch (err) {
//     console.error("Create Template Error:", err);
//     res.status(500).json({
//       message: "Failed to create email template",
//       error: (err as Error).message,
//     });
//   }
// };

// // ----------------------------
// // Update email template
// // ----------------------------
// export const updateEmailTemplate = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const updated = await updateEmailTemplateById(id, {
//       ...req.body,
//       updatedBy: req.user?.id || null,
//     });

//     await logActivity({
//       userId: req.user?.id || null,
//       username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
//       type: "Update",
//       activity: `Updated Email Template (ID: ${id})`,
//     });

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({
//       message: "Failed to update email template",
//       error: (err as Error).message,
//     });
//   }
// };

// // ----------------------------
// // Soft delete email template
// // ----------------------------
// export const deleteEmailTemplate = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     await softDeleteEmailTemplate(id, req.user?.id || null);

//     await logActivity({
//       userId: req.user?.id || null,
//       username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
//       type: "Delete",
//       activity: `Deleted Email Template (ID: ${id})`,
//     });

//     res.json({ message: "Email template deleted (soft)" });
//   } catch (err) {
//     res.status(500).json({
//       message: "Failed to delete email template",
//       error: (err as Error).message,
//     });
//   }
// };


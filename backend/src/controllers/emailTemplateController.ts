// import { Request, Response } from "express";
// import * as emailService from "../services/emailTemplate.service";

// export const getEmailTemplates = async (req: Request, res: Response) => {
//   try {
//     const templates = await emailService.getEmailTemplatesService();
//     res.json(templates);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching email templates", error });
//   }
// };

// export const getEmailTemplateById = async (req: Request, res: Response) => {
//   try {
//     const template = await emailService.getEmailTemplateByIdService(Number(req.params.id));
//     res.json(template);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching email template", error });
//   }
// };

// export const createEmailTemplate = async (req: Request, res: Response) => {
//   try {
//     const template = await emailService.createEmailTemplateService(req.body);
//     res.status(201).json(template);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating email template", error });
//   }
// };

// export const updateEmailTemplate = async (req: Request, res: Response) => {
//   try {
//     const template = await emailService.updateEmailTemplateService(Number(req.params.id), req.body);
//     res.json(template);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating email template", error });
//   }
// };

// export const deleteEmailTemplate = async (req: Request, res: Response) => {
//   try {
//     const template = await emailService.deleteEmailTemplateService(Number(req.params.id));
//     res.json(template);
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting email template", error });
//   }
// };






// import db from "../../connection"; // your knex connection

// // Define query type for filtering
// interface EmailTemplateQuery {
//   status?: "active" | "inactive";
// }

// // ✅ Get all email templates, optionally filtered by status
// export const getEmailTemplatesService = async (query?: EmailTemplateQuery) => {
//   let q = db("email_templates").select("*");

//   if (query?.status) {
//     q = q.where("status", query.status);
//   }

//   return await q;
// };

// // ✅ Get single email template by ID
// export const getEmailTemplateByIdService = async (id: number) => {
//   return await db("email_templates").where({ id }).first();
// };

// // ✅ Create new email template
// export const createEmailTemplateService = async (data: any) => {
//   const [newTemplate] = await db("email_templates").insert(data).returning("*");
//   return newTemplate;
// };

// // ✅ Update existing email template
// export const updateEmailTemplateService = async (id: number, data: any) => {
//   const [updatedTemplate] = await db("email_templates")
//     .where({ id })
//     .update(data)
//     .returning("*");
//   return updatedTemplate;
// };

// // ✅ Soft delete (mark as inactive)
// export const deleteEmailTemplateService = async (id: number) => {
//   const [deletedTemplate] = await db("email_templates")
//     .where({ id })
//     .update({ status: "inactive" })
//     .returning("*");
//   return deletedTemplate;
// };






// import { Request, Response } from "express";
// import * as emailService from "../services/emailTemplate.service";

// export const getEmailTemplates = async (req: Request, res: Response) => {
//   try {
//     const templates = await emailService.getEmailTemplatesService(req.query);
//     res.json(templates);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching email templates", error });
//   }
// };

// export const getEmailTemplateById = async (req: Request, res: Response) => {
//   try {
//     const template = await emailService.getEmailTemplateByIdService(Number(req.params.id));
//     res.json(template);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching email template", error });
//   }
// };

// export const createEmailTemplate = async (req: Request, res: Response) => {
//   try {
//     const template = await emailService.createEmailTemplateService(req.body);
//     res.status(201).json(template);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating email template", error });
//   }
// };

// export const updateEmailTemplate = async (req: Request, res: Response) => {
//   try {
//     const template = await emailService.updateEmailTemplateService(Number(req.params.id), req.body);
//     res.json(template);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating email template", error });
//   }
// };

// export const deleteEmailTemplate = async (req: Request, res: Response) => {
//   try {
//     const template = await emailService.deleteEmailTemplateService(Number(req.params.id));
//     res.json(template);
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting email template", error });
//   }
// };





import { Request, Response } from "express";
import db from "../../connection";

/**
 * 📨 Get all Email Templates with optional status filter
 */
export const getEmailTemplates = async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: "active" | "inactive" | "all" };

    let query = db("email_templates")
      .select("*")
      .whereNull("deletedAt")
      .orderBy("id", "desc");

    // Filter by status if provided
    if (status && status !== "all") {
      query = query.where({ status });
    }

    const rows = await query;
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch email templates",
      error: (err as Error).message,
    });
  }
};

/**
 * 📨 Get Single Email Template by ID
 */
export const getEmailTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const template = await db("email_templates")
      .where({ id })
      .whereNull("deletedAt")
      .first();

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.json(template);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch email template",
      error: (err as Error).message,
    });
  }
};

/**
 * 📨 Create New Email Template
 */
export const createEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { key, title, subject, fromEmail, fromName, body, status = "active" } = req.body;

    const [id] = await db("email_templates").insert({
      key,
      title,
      subject,
      fromEmail,
      fromName,
      body,
      status,
      createdBy: req.user?.id || null,
    });

    const created = await db("email_templates").where({ id }).first();
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create email template",
      error: (err as Error).message,
    });
  }
};

/**
 * 📨 Update Existing Email Template
 */
export const updateEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { title, subject, fromEmail, fromName, body, status } = req.body;

    await db("email_templates")
      .where({ id })
      .update({
        title,
        subject,
        fromEmail,
        fromName,
        body,
        status,
        updatedBy: req.user?.id || null,
        updatedAt: db.fn.now(),
      });

    const updated = await db("email_templates").where({ id }).first();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update email template",
      error: (err as Error).message,
    });
  }
};

/**
 * 📨 Soft Delete Email Template
 */
export const deleteEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    await db("email_templates")
      .where({ id })
      .update({
        deletedAt: db.fn.now(),
        status: "inactive",
        updatedBy: req.user?.id || null,
      });

    return res.json({ message: "Email template deleted (soft)" });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete email template",
      error: (err as Error).message,
    });
  }
};



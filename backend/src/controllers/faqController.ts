// src/controllers/faqController.ts
import { Request, Response } from "express";
import {
  getFaqs,
  fetchFaqById,
  createFaq as createFaqService,
  updateFaq as updateFaqService,
  deleteFaq as deleteFaqService,
} from "../services/faq.service";
import { logActivity } from "../services/audit.service";

export const getFaqList = async (req: Request, res: Response) => {
  try {
    const { id, question, answer, displayOrder, status, page = "1", limit = "10", sortBy, order } = req.query;
// make status obj like { status: "Active" }
    const filters: any = {};
    if (id) filters.id = id;
    if (question) filters.question = question;
    if (answer) filters.answer = answer;
    if (displayOrder) filters.displayOrder = displayOrder;
    if (status) filters.status = status;
// converting the pages into number.
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    
    const result = await getFaqs(
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
      activity: `Viewed FAQ List | page: ${pageNum} | filters: ${JSON.stringify(filters)} | sortBy: ${sortBy} | order: ${order}`,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Failed to fetch FAQs:", err);
    return res.status(500).json({ message: "Failed to fetch FAQs" });
  }
};



// ----------------------------
// Get single FAQ by ID
// ----------------------------
export const getFaqById = async (req: Request, res: Response) => {
  try {
    const faq = await fetchFaqById(req.params.id);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "View",
      activity: `Viewed FAQ (ID: ${req.params.id})`,
    });

    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    return res.json(faq);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch FAQ", error: (err as Error).message });
  }
};

// ----------------------------
// Create new FAQ
// ----------------------------
export const createFaq = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body, createdBy: req.user?.id || null };
    const created = await createFaqService(data);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Create",
      activity: `Created FAQ (Question: ${req.body.question || "N/A"})`,
    });

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create FAQ", error: (err as Error).message });
  }
};

// ----------------------------
// Update FAQ
// ----------------------------
export const updateFaq = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body, updatedBy: req.user?.id || null };
    const updated = await updateFaqService(req.params.id, data);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Update",
      activity: `Updated FAQ (ID: ${req.params.id})`,
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update FAQ", error: (err as Error).message });
  }
};

// ----------------------------
// Soft Delete FAQ
// ----------------------------
export const deleteFaq = async (req: Request, res: Response) => {
  try {
    await deleteFaqService(req.params.id, req.user?.id || null);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Delete",
      activity: `Deleted FAQ (ID: ${req.params.id})`,
    });

    return res.json({ message: "FAQ deleted (soft)" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete FAQ", error: (err as Error).message });
  }
};



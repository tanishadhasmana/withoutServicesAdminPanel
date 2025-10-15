import { Request, Response } from "express";
import {
  getCmsListService,
  getCmsByIdService,
  createCmsService,
  updateCmsService,
  deleteCmsService,
} from "../services/cms.service";
import { logActivity } from "../services/audit.service";

// ----------------------------
// Get CMS List (Pagination + Filters)
// ----------------------------
export const getAllCms = async (req: Request, res: Response) => {
  try {
    const { id, key, title, status, page = "1", limit = "10" } = req.query;
    const filters: any = {};

    if (id) filters.id = id;
    if (key) filters.key = key;
    if (title) filters.title = title;
    if (status) filters.status = status;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;

    const result = await getCmsListService(filters, pageNum, limitNum);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "View",
      activity: `Fetched CMS list with filters: ${JSON.stringify(filters)} | page: ${pageNum}`,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching CMS list:", err);
    return res.status(500).json({ message: "Failed to fetch CMS list" });
  }
};

// ----------------------------
// Get CMS by ID
// ----------------------------
export const getCmsById = async (req: Request, res: Response) => {
  try {
    const cms = await getCmsByIdService(Number(req.params.id));
    if (!cms) return res.status(404).json({ message: "CMS not found" });

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "View",
      activity: `Viewed CMS ID: ${req.params.id}`,
    });

    return res.status(200).json(cms);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch CMS" });
  }
};

// ----------------------------
// Create CMS
// ----------------------------
export const createCms = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body, createdBy: req.user?.id || null };
    const created = await createCmsService(data);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Create",
      activity: `Created CMS: ${req.body.title}`,
    });

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create CMS" });
  }
};

// ----------------------------
// Update CMS
// ----------------------------
export const updateCms = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body, updatedBy: req.user?.id || null };
    const updated = await updateCmsService(Number(req.params.id), data);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Update",
      activity: `Updated CMS ID: ${req.params.id}`,
    });

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update CMS" });
  }
};

// ----------------------------
// Delete CMS (Soft Delete)
// ----------------------------
export const deleteCms = async (req: Request, res: Response) => {
  try {
    const result = await deleteCmsService(Number(req.params.id), req.user?.id || null);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Delete",
      activity: `Deleted CMS ID: ${req.params.id}`,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete CMS" });
  }
};




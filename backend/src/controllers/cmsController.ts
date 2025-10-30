import { Request, Response } from "express";
import {
  getCmsListService,
  getCmsByIdService,
  createCmsService,
  updateCmsService,
  deleteCmsService,
} from "../services/cms.service";
import { logActivity } from "../services/audit.service";

// // ----------------------------
// // Get CMS by ID
// // ----------------------------
export const getCmsById = async (req: Request, res: Response) => {
  try {
    // firstly getting cms by id from service, req params, and calling getCmsByIdService fucn to fetch cms record from db---- if found log activity generated else show not found
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


// // ----------------------------
// // Get All CMS 
// // ----------------------------
export const getAllCms = async (req: Request, res: Response) => {
  try {
    // feching data from query params
    const { id, key, title, status, page = "1", limit = "10", sortBy, order } = req.query;
    const filters: any = {};

    if (id) filters.id = id;
    if (key) filters.key = key;
    if (title) filters.title = title;
    if (status) filters.status = status;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
// and passung that query params to getCmsListService fucn to fetch filtered paginated list.
    const result = await getCmsListService(
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
      activity: `Fetched CMS list with filters: ${JSON.stringify(filters)} | page: ${pageNum}`,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching CMS list:", err);
    return res.status(500).json({ message: "Failed to fetch CMS list" });
  }
};



// ----------------------------
// Create CMS
// ----------------------------
export const createCms = async (req: Request, res: Response) => {
  try {
    // feching data from query params
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
    // feching data from query params, id and the body means the data
    const data = { ...req.body, updatedBy: req.user?.id || null };
    // and adding the updatedBy field to track who updated the record
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
    // feching id from req params and calling deleteCmsService fucn to soft delete the record
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




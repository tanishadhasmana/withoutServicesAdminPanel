import { Request, Response } from "express";
import {fetchConfigList, fetchConfigById, insertConfig, updateConfigById, softDeleteConfig} from "../services/config.service";
import { logActivity } from "../services/audit.service"; 

// ✅ Local type declaration
type ConfigStatus = "active" | "inactive";

export const getConfigList = async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as ConfigStatus | "all") || "all";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // read sorting params from query (sortBy + sortOrder)
    const sortBy = (req.query.sortBy as string) || undefined;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || undefined;

    const { rows, total } = await fetchConfigList(status, page, limit, sortBy, sortOrder);
    const totalPages = Math.ceil(total / limit);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "View",
      activity: `Viewed Config List (page: ${page}, limit: ${limit}, sort: ${sortBy || "id"} ${sortOrder || "desc"})`,
    });

    res.json({
      data: rows,
      total,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch configs",
      error: (err as Error).message,
    });
  }
};


// Get config by ID
export const getConfigById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await fetchConfigById(id);

    // 🟢 Log user activity
    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "View",
      activity: `Viewed Config (ID: ${id})`,
    });

    if (!config) return res.status(404).json({ message: "Config not found" });
    res.json(config);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch config",
      error: (err as Error).message,
    });
  }
};

// Create new config
export const createConfig = async (req: Request, res: Response) => {
  try {
    const { key, value, displayOrder = 0, status = "active" } = req.body;
    const created = insertConfig({
      key,
      value,
      displayOrder,
      status,
      createdBy: req.user?.id || null,
    });

    // 🟢 Log user activity
    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Create",
      activity: `Created Config Key: ${key}`,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({
      message: "Failed to create config",
      error: (err as Error).message,
    });
  }
};

// Update config
export const updateConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { value, displayOrder, status } = req.body;
    const updated = updateConfigById(id, {
      value,
      displayOrder,
      status,
      updatedBy: req.user?.id || null,
    });

    // 🟢 Log user activity
    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Update",
      activity: `Updated Config (ID: ${id})`,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update config",
      error: (err as Error).message,
    });
  }
};

// Soft delete config
export const deleteConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
   softDeleteConfig(id, req.user?.id || null);

    // 🟢 Log user activity
    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Delete",
      activity: `Deleted Config (ID: ${id})`,
    });

    res.json({ message: "Config deleted (soft)" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete config",
      error: (err as Error).message,
    });
  }
};




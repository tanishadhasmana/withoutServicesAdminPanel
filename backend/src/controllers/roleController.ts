import { Request, Response } from "express";
import {
  getRoles as getRolesService,
  fetchRoleById,
  createRole as createRoleService,
  updateRole as updateRoleService,
  toggleRoleStatus as toggleRoleStatusService,
  deleteRole as deleteRoleService,
  getRolesCountService
} from "../services/role.service";
import { logActivity } from "../services/audit.service";

export const getRoles = async (req: Request, res: Response) => {
  try {
    const {
      id,
      role,
      description,
      status,
      page = "1",
      limit = "10",
      sortBy,
      order
    } = req.query;

    const filters: any = {};
    if (id) filters.id = id;
    if (role) filters.role = role;
    if (description) filters.description = description;
    if (status) filters.status = status;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    // pass sorting to service
    const { roles, total } = await getRolesService(
      filters,
      limitNum,
      offset,
      sortBy as string | undefined,
      (order as "asc" | "desc") || undefined
    );

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "View",
      activity: `Fetched role list with filters & sorting`,
    });

    return res.json({
      roles,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });

  } catch (err) {
    console.error("Error fetching roles:", err);
    return res.status(500).json({ message: "Failed to fetch roles" });
  }
};


// ----------------------------
// Get Roles Count
// ----------------------------
export const getRolesCount = async (req: Request, res: Response) => {
  try {
    const total = await getRolesCountService();
    return res.json({ total });
  } catch (err) {
    console.error("Error getting role count:", err);
    return res.status(500).json({ message: "Failed to fetch roles count" });
  }
};


// ----------------------------
// Get Role by ID
// ----------------------------
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const role = await fetchRoleById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "View",
      activity: `Viewed role ID: ${req.params.id}`,
    });

    return res.json(role);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch role", error: (err as Error).message });
  }
};

// ----------------------------
// Create Role
// ----------------------------
export const createRole = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body, createdBy: req.user?.id || null };
    const created = await createRoleService(data);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Create",
      activity: `Created role: ${data.role}`,
    });

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create role", error: (err as Error).message });
  }
};

// ----------------------------
// Update Role
// ----------------------------
export const updateRole = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body, updatedBy: req.user?.id || null };
    const updated = await updateRoleService(req.params.id, data);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Update",
      activity: `Updated role ID: ${req.params.id} with data: ${JSON.stringify(data)}`,
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update role", error: (err as Error).message });
  }
};

// ----------------------------
// Toggle Role Status
// ----------------------------
export const toggleRoleStatus = async (req: Request, res: Response) => {
  try {
    const updated = await toggleRoleStatusService(req.params.id, req.body.status);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Update",
      activity: `Toggled status for role ID: ${req.params.id} to: ${req.body.status}`,
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Failed to toggle role status", error: (err as Error).message });
  }
};

// ----------------------------
// Delete Role (Soft Delete)
// ----------------------------
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const result = await deleteRoleService(req.params.id, req.user?.id || null);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Delete",
      activity: `Deleted role ID: ${req.params.id}`,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Delete Role Error:", err);
    return res.status(500).json({ message: "Failed to delete role", error: (err as Error).message });
  }
};


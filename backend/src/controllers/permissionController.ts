// src/controllers/permissionController.ts
import { Request, Response } from "express";
import { 
  getAllPermissions as getAllPermissionsService,
  getRolePermissions as getRolePermissionsService,
  updateRolePermissions as updateRolePermissionsService
} from "../services/permission.service";

// GET all permissions
export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const data = await getAllPermissionsService(); // data: PermissionItem[]
    res.json(data);
  } catch (err) {
    console.error("Failed to get permissions:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET role permissions
export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const data = await getRolePermissionsService(Number(roleId)); 
    res.json(data);
  } catch (err) {
    console.error("Failed to get role permissions:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST update role permissions
export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({ message: "permissionIds must be an array" });
    }

    await updateRolePermissionsService(Number(roleId), permissionIds);
    res.json({ message: "Permissions updated successfully" });
  } catch (err) {
    console.error("Failed to update role permissions:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// import { Request, Response } from "express";
// import * as roleService from "../services/role.service";

// export const getRoles = async (req: Request, res: Response) => {
//   try {
//     const roles = await roleService.getRolesService();
//     res.json(roles);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching roles", error });
//   }
// };

// export const getRoleById = async (req: Request, res: Response) => {
//   try {
//     const role = await roleService.getRoleByIdService(Number(req.params.id));
//     res.json(role);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching role", error });
//   }
// };

// export const createRole = async (req: Request, res: Response) => {
//   try {
//     const role = await roleService.createRoleService(req.body);
//     res.status(201).json(role);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating role", error });
//   }
// };

// export const updateRole = async (req: Request, res: Response) => {
//   try {
//     const role = await roleService.updateRoleService(Number(req.params.id), req.body);
//     res.json(role);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating role", error });
//   }
// };

// export const deleteRole = async (req: Request, res: Response) => {
//   try {
//     const result = await roleService.deleteRoleService(Number(req.params.id));
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting role", error });
//   }
// };

// export const toggleRoleStatus = async (req: Request, res: Response) => {
//   try {
//     const result = await roleService.toggleRoleStatusService(Number(req.params.id), req.body.status);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating role status", error });
//   }
// };






// import { Request, Response } from "express";
// import * as roleService from "../services/role.service";

// export const getRoles = async (req: Request, res: Response) => {
//   try {
//     const roles = await roleService.getRolesService();
//     res.json(roles);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching roles", error });
//   }
// };

// export const getRoleById = async (req: Request, res: Response) => {
//   try {
//     const role = await roleService.getRoleByIdService(Number(req.params.id));
//     res.json(role);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching role", error });
//   }
// };

// export const createRole = async (req: Request, res: Response) => {
//   try {
//     const role = await roleService.createRoleService(req.body);
//     res.status(201).json(role);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating role", error });
//   }
// };

// export const updateRole = async (req: Request, res: Response) => {
//   try {
//     const role = await roleService.updateRoleService(Number(req.params.id), req.body);
//     res.json(role);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating role", error });
//   }
// };

// export const deleteRole = async (req: Request, res: Response) => {
//   try {
//     const role = await roleService.deleteRoleService(Number(req.params.id));
//     res.json(role);
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting role", error });
//   }
// };

// export const toggleRoleStatus = async (req: Request, res: Response) => {
//   try {
//     const role = await roleService.toggleRoleStatusService(Number(req.params.id), req.body.status);
//     res.json(role);
//   } catch (error) {
//     res.status(500).json({ message: "Error toggling status", error });
//   }
// };



import { Request, Response } from "express";
import db from "../../connection";

// Get all roles with optional filtering
export const getRoles = async (req: Request, res: Response) => {
  try {
    const { id, role, description, status } = req.query;
    const query = db("roles").select("*").orderBy("id", "asc");

    if (id) query.where("id", "like", `%${id}%`);
    if (role) query.where("role", "like", `%${role}%`);
    if (description) query.where("description", "like", `%${description}%`);
    if (status) query.where("status", status);

    const rows = await query;
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch roles", error: (err as Error).message });
  }
};

// Create role
export const createRole = async (req: Request, res: Response) => {
  try {
    const { role, description, status = "active" } = req.body;
    const [id] = await db("roles").insert({
      role,
      description,
      status,
      createdBy: req.user?.id || null,
    });
    const created = await db("roles").where({ id }).first();
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create role", error: (err as Error).message });
  }
};

// Update role
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, description, status } = req.body;
    const updated = await db("roles")
      .where({ id })
      .update({
        role,
        description,
        status,
        updatedBy: req.user?.id || null,
        updatedAt: db.fn.now(),
      })
      .returning("*");
    if (!updated || updated.length === 0) return res.status(404).json({ message: "Role not found" });
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update role", error: (err as Error).message });
  }
};

// Toggle role status
export const toggleRoleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status required" });
    const updated = await db("roles")
      .where({ id })
      .update({ status, updatedBy: req.user?.id || null, updatedAt: db.fn.now() })
      .returning("*");
    if (!updated || updated.length === 0) return res.status(404).json({ message: "Role not found" });
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status", error: (err as Error).message });
  }
};

// Get role by ID
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await db("roles").where({ id }).first();
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch role", error: (err as Error).message });
  }
};

// Soft delete role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await db("roles")
      .where({ id })
      .update({ status: "inactive", deletedAt: db.fn.now(), updatedBy: req.user?.id || null })
      .returning("*");
    if (!deleted || deleted.length === 0) return res.status(404).json({ message: "Role not found" });
    res.json({ message: "Role deleted (soft)", role: deleted[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete role", error: (err as Error).message });
  }
};



// import { Request, Response } from "express";
// import * as configService from "../services/config.service";

// export const getConfigList = async (req: Request, res: Response) => {
//   try {
//     const configs = await configService.getConfigListService();
//     res.json(configs);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching configs", error });
//   }
// };

// export const getConfigById = async (req: Request, res: Response) => {
//   try {
//     const config = await configService.getConfigByIdService(Number(req.params.id));
//     res.json(config);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching config", error });
//   }
// };

// export const createConfig = async (req: Request, res: Response) => {
//   try {
//     const config = await configService.createConfigService(req.body);
//     res.status(201).json(config);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating config", error });
//   }
// };

// export const updateConfig = async (req: Request, res: Response) => {
//   try {
//     const config = await configService.updateConfigService(Number(req.params.id), req.body);
//     res.json(config);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating config", error });
//   }
// };

// export const deleteConfig = async (req: Request, res: Response) => {
//   try {
//     const result = await configService.deleteConfigService(Number(req.params.id));
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting config", error });
//   }
// };









// import { Request, Response } from "express";
// import * as configService from "../services/config.service";

// // ✅ Get all configs
// export const getConfigList = async (req: Request, res: Response) => {
//   try {
//     const configs = await configService.getConfigListService();
//     res.json(configs);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching configs", error });
//   }
// };

// // ✅ Get single config by ID
// export const getConfigById = async (req: Request, res: Response) => {
//   try {
//     const config = await configService.getConfigByIdService(Number(req.params.id));
//     res.json(config);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching config", error });
//   }
// };

// // ✅ Create new config
// export const createConfig = async (req: Request, res: Response) => {
//   try {
//     const config = await configService.createConfigService(req.body);
//     res.status(201).json(config);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating config", error });
//   }
// };

// // ✅ Update config
// export const updateConfig = async (req: Request, res: Response) => {
//   try {
//     const config = await configService.updateConfigService(Number(req.params.id), req.body);
//     res.json(config);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating config", error });
//   }
// };

// // ✅ Delete config
// export const deleteConfig = async (req: Request, res: Response) => {
//   try {
//     const config = await configService.deleteConfigService(Number(req.params.id));
//     res.json(config);
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting config", error });
//   }
// };






import { Request, Response } from "express";
import db from "../../connection";

export type ConfigStatus = "active" | "inactive";

/**
 * Get all configs with optional status filter
 */
export const getConfigList = async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: ConfigStatus | "all" };

    let query = db("application_config").select("*").orderBy("displayOrder", "asc");

    // Filter by status if provided
    if (status && status !== "all") {
      query = query.where({ status });
    }

    const rows = await query;
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch configs",
      error: (err as Error).message,
    });
  }
};

export const getConfigById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const config = await db("application_config").where({ id }).first();
    if (!config) return res.status(404).json({ message: "Config not found" });
    return res.json(config);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch config",
      error: (err as Error).message,
    });
  }
};

export const createConfig = async (req: Request, res: Response) => {
  try {
    const { key, value, displayOrder = 0, status = "active" } = req.body;
    const [id] = await db("application_config").insert({
      key,
      value,
      displayOrder,
      status,
      createdBy: req.user?.id || null,
    });
    const created = await db("application_config").where({ id }).first();
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create config",
      error: (err as Error).message,
    });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { value, displayOrder, status } = req.body;
    await db("application_config")
      .where({ id })
      .update({
        value,
        displayOrder,
        status,
        updatedBy: req.user?.id || null,
        updatedAt: db.fn.now(),
      });
    const updated = await db("application_config").where({ id }).first();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update config",
      error: (err as Error).message,
    });
  }
};

export const deleteConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await db("application_config")
      .where({ id })
      .update({
        deletedAt: db.fn.now(),
        status: "inactive",
        updatedBy: req.user?.id || null,
      });
    return res.json({ message: "Config deleted (soft)" });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete config",
      error: (err as Error).message,
    });
  }
};


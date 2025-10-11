// import { Request, Response } from "express";
// import * as cmsService from "../services/cms.service";

// export const getCmsList = async (req: Request, res: Response) => {
//   try {
//     const cms = await cmsService.getCmsListService();
//     res.json(cms);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching CMS list", error });
//   }
// };

// export const getCmsById = async (req: Request, res: Response) => {
//   try {
//     const cms = await cmsService.getCmsByIdService(Number(req.params.id));
//     res.json(cms);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching CMS", error });
//   }
// };

// export const createCms = async (req: Request, res: Response) => {
//   try {
//     const cms = await cmsService.createCmsService(req.body);
//     res.status(201).json(cms);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating CMS", error });
//   }
// };

// export const updateCms = async (req: Request, res: Response) => {
//   try {
//     const cms = await cmsService.updateCmsService(Number(req.params.id), req.body);
//     res.json(cms);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating CMS", error });
//   }
// };

// export const deleteCms = async (req: Request, res: Response) => {
//   try {
//     const result = await cmsService.deleteCmsService(Number(req.params.id));
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting CMS", error });
//   }
// };





// import { Request, Response } from "express";
// import * as cmsService from "../services/cms.service";

// export const getCmsList = async (req: Request, res: Response) => {
//   try {
//     const cms = await cmsService.getCmsListService();
//     res.json(cms);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching CMS pages", error });
//   }
// };

// export const getCmsById = async (req: Request, res: Response) => {
//   try {
//     const cms = await cmsService.getCmsByIdService(Number(req.params.id));
//     res.json(cms);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching CMS page", error });
//   }
// };

// export const createCms = async (req: Request, res: Response) => {
//   try {
//     const cms = await cmsService.createCmsService(req.body);
//     res.status(201).json(cms);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating CMS page", error });
//   }
// };

// export const updateCms = async (req: Request, res: Response) => {
//   try {
//     const cms = await cmsService.updateCmsService(Number(req.params.id), req.body);
//     res.json(cms);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating CMS page", error });
//   }
// };

// export const deleteCms = async (req: Request, res: Response) => {
//   try {
//     const cms = await cmsService.deleteCmsService(Number(req.params.id));
//     res.json(cms);
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting CMS page", error });
//   }
// };




import { Request, Response } from "express";
import db from "../../connection";

// Get all CMS pages with optional filters
export const getCmsList = async (req: Request, res: Response) => {
  try {
    const { id, key, title, status } = req.query;

    const query = db("cms").select("*").orderBy("id", "desc");

    if (id) query.where("id", "like", `%${id}%`);
    if (key) query.where("key", "like", `%${key}%`);
    if (title) query.where("title", "like", `%${title}%`);
    if (status) query.where("status", status);

    const rows = await query;
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch CMS",
      error: (err as Error).message,
    });
  }
};

// Get single CMS by ID
export const getCmsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cms = await db("cms").where({ id }).first();
    if (!cms) return res.status(404).json({ message: "CMS not found" });
    return res.json(cms);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch CMS",
      error: (err as Error).message,
    });
  }
};

// Create CMS
export const createCms = async (req: Request, res: Response) => {
  try {
    const {
      key,
      title,
      metaKeyword,
      metaTitle,
      metaDescription,
      content,
      status = "active",
    } = req.body;
    const [id] = await db("cms").insert({
      key,
      title,
      metaKeyword,
      metaTitle,
      metaDescription,
      content,
      status,
      createdBy: req.user?.id || null,
    });

    const created = await db("cms").where({ id }).first();
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create CMS",
      error: (err as Error).message,
    });
  }
};

// Update CMS
export const updateCms = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { title, metaKeyword, metaTitle, metaDescription, content, status } =
      req.body;

    await db("cms")
      .where({ id })
      .update({
        title,
        metaKeyword,
        metaTitle,
        metaDescription,
        content,
        status,
        updatedBy: req.user?.id || null,
        updatedAt: db.fn.now(),
      });

    const updated = await db("cms").where({ id }).first();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update CMS",
      error: (err as Error).message,
    });
  }
};

// Delete CMS (soft delete)
export const deleteCms = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await db("cms")
      .where({ id })
      .update({
        deletedAt: db.fn.now(),
        status: "inactive",
        updatedBy: req.user?.id || null,
      });
    return res.json({ message: "CMS deleted (soft)" });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete CMS",
      error: (err as Error).message,
    });
  }
};



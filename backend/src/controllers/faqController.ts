// import { Request, Response } from "express";
// import * as faqService from "../services/faq.service";

// export const getFaqList = async (req: Request, res: Response) => {
//   try {
//     const faqs = await faqService.getFaqListService();
//     res.json(faqs);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching FAQs", error });
//   }
// };

// export const getFaqById = async (req: Request, res: Response) => {
//   try {
//     const faq = await faqService.getFaqByIdService(Number(req.params.id));
//     res.json(faq);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching FAQ", error });
//   }
// };

// export const createFaq = async (req: Request, res: Response) => {
//   try {
//     const faq = await faqService.createFaqService(req.body);
//     res.status(201).json(faq);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating FAQ", error });
//   }
// };

// export const updateFaq = async (req: Request, res: Response) => {
//   try {
//     const faq = await faqService.updateFaqService(Number(req.params.id), req.body);
//     res.json(faq);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating FAQ", error });
//   }
// };

// export const deleteFaq = async (req: Request, res: Response) => {
//   try {
//     const result = await faqService.deleteFaqService(Number(req.params.id));
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting FAQ", error });
//   }
// };





// import { Request, Response } from "express";
// import * as faqService from "../services/faq.service";

// export const getFaqList = async (req: Request, res: Response) => {
//   try {
//     const faqs = await faqService.getFaqListService();
//     res.json(faqs);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching FAQs", error });
//   }
// };

// export const getFaqById = async (req: Request, res: Response) => {
//   try {
//     const faq = await faqService.getFaqByIdService(Number(req.params.id));
//     res.json(faq);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching FAQ", error });
//   }
// };

// export const createFaq = async (req: Request, res: Response) => {
//   try {
//     const faq = await faqService.createFaqService(req.body);
//     res.status(201).json(faq);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating FAQ", error });
//   }
// };

// export const updateFaq = async (req: Request, res: Response) => {
//   try {
//     const faq = await faqService.updateFaqService(Number(req.params.id), req.body);
//     res.json(faq);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating FAQ", error });
//   }
// };

// export const deleteFaq = async (req: Request, res: Response) => {
//   try {
//     const faq = await faqService.deleteFaqService(Number(req.params.id));
//     res.json(faq);
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting FAQ", error });
//   }
// };








import { Request, Response } from "express";
import db from "../../connection";

// Get FAQs with optional status filter
export const getFaqList = async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };

    let query = db("faq").select("*").orderBy("displayOrder", "asc");

    if (status && (status === "active" || status === "inactive")) {
      query = query.where({ status });
    }

    const rows = await query;
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch FAQ", error: (err as Error).message });
  }
};

// Get single FAQ by ID
export const getFaqById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const faq = await db("faq").where({ id }).first();

    if (!faq) return res.status(404).json({ message: "FAQ not found" });

    return res.json(faq);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch FAQ", error: (err as Error).message });
  }
};

// Create FAQ
export const createFaq = async (req: Request, res: Response) => {
  try {
    const { question, answer, displayOrder = 1, status = "active" } = req.body;

    let created;
    if (db.client.config.client === "pg") {
      [created] = await db("faq")
        .insert({ question, answer, displayOrder, status, createdBy: req.user?.id || null })
        .returning("*");
    } else {
      const [id] = await db("faq").insert({ question, answer, displayOrder, status, createdBy: req.user?.id || null });
      created = await db("faq").where({ id }).first();
    }

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create FAQ", error: (err as Error).message });
  }
};

// Update FAQ
export const updateFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { question, answer, displayOrder, status } = req.body;

    await db("faq")
      .where({ id })
      .update({
        question,
        answer,
        displayOrder,
        status,
        updatedBy: req.user?.id || null,
        updatedAt: db.fn.now(),
      });

    const updated = await db("faq").where({ id }).first();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update FAQ", error: (err as Error).message });
  }
};

// Delete FAQ (soft delete)
export const deleteFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await db("faq")
      .where({ id })
      .update({ deletedAt: db.fn.now(), status: "inactive", updatedBy: req.user?.id || null });
    return res.json({ message: "FAQ deleted (soft)" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete FAQ", error: (err as Error).message });
  }
};



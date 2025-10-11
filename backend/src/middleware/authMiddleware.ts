// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();

// export interface AuthRequest extends Request {
//   user?: any;
// }

// // Authenticate JWT from cookies
// export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// // Authorize admin only
// export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
//   if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
//   next();
// };






// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();

// // ✅ Custom type for authenticated requests
// export interface AuthRequest extends Request {
//   user?: {
//     id: number;
//     role: string;
//     email?: string;
//     firstName?: string;
//     lastName?: string;
//   };
// }

// // 🔒 Protect middleware — verify JWT
// export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
//   const token =
//     req.cookies?.token ||
//     (req.headers.authorization?.startsWith("Bearer ")
//       ? req.headers.authorization.split(" ")[1]
//       : null);

//   if (!token) {
//     return res.status(401).json({ success: false, message: "Not authorized, token missing" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
//       id: number;
//       role: string;
//       email?: string;
//     };
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: "Invalid or expired token" });
//   }
// };

// // 🛡 Admin-only middleware
// export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
//   if (!req.user) return res.status(401).json({ message: "Not authenticated" });
//   if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
//   next();
// };




// src/middleware/authMiddleware.ts
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();

// // ✅ define a custom type for authenticated requests
// export interface AuthRequest extends Request {
//   user?: {
//     id: number;
//     role: string;
//     email?: string;
//     firstName?: string;
//     lastName?: string;
//   };
// }

// // ✅ Middleware to verify token
// export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
//   const token =
//     req.cookies?.token ||
//     (req.headers.authorization ? req.headers.authorization.split(" ")[1] : null);

//   if (!token) {
//     return res.status(401).json({ success: false, message: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
//       id: number;
//       role: string;
//       email?: string;
//     };
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: "Invalid token" });
//   }
// };





import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../../connection";

declare module "express" {
  interface Request {
    user?: {
      id: number;
      role: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    };
  }
}

/**
 * 🔒 Protect middleware — verifies JWT (from cookie or Authorization header)
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server misconfiguration: missing JWT_SECRET" });
    }

    const decoded = jwt.verify(token, secret) as { id: number };

    // ✅ JOIN users with roles table to fetch role name
    const user = await db("users")
      .leftJoin("roles", "users.roleId", "roles.id")
      .select(
        "users.id",
        "users.firstName",
        "users.lastName",
        "users.email",
        "users.status",
        "roles.role as role"
      )
      .where("users.id", decoded.id)
      .first();

    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.status !== "active")
      return res.status(403).json({ message: "User is inactive, contact admin" });

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (err) {
    console.error("❌ protect middleware error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * 🛡 Admin-only route guard
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

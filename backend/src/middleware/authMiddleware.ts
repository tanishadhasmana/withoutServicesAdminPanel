// src/middleware/authMiddleware.ts
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
      permissions?: string[];
    };
  }
}

/**
 * 🔒 Protect middleware — verifies JWT (from cookie or Authorization header)
 * Attaches user info + permissions to req.user
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token)
      return res.status(401).json({ message: "Not authorized, token missing" });

    const secret = process.env.JWT_SECRET;
    if (!secret)
      return res
        .status(500)
        .json({ message: "Server misconfiguration: missing JWT_SECRET" });

    const decoded = jwt.verify(token, secret) as { id: number };

    // Fetch user info with roleId
    const user = await db("users")
      .leftJoin("roles", "users.roleId", "roles.id")
      .select(
        "users.id",
        "users.firstName",
        "users.lastName",
        "users.email",
        "users.status",
        "users.roleId",
        "roles.role as role"
      )
      .where("users.id", decoded.id)
      .first();

    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.status !== "active")
      return res
        .status(403)
        .json({ message: "User is inactive, contact admin" });

    // Fetch permissions for this user's role
    const permissions =
      (await db("role_permissions")
        .join("permissions", "role_permissions.permissionId", "permissions.id")
        .where("role_permissions.roleId", user.roleId) // use roleId from fetched user
        .pluck("permissions.name")) || [];

    // Attach user + permissions to req.user
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions,
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
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied: Admins only" });
  next();
};

/**
 * Middleware to check if user has required permission
 */
export const requirePermission = (permissionKey: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    // ✅ Allow admin full access bypass
    if (req.user.role?.toLowerCase() === "admin") {
      return next();
    }

    if (
      !req.user.permissions ||
      !req.user.permissions.includes(permissionKey)
    ) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permission" });
    }

    next();
  };
};





// export const requirePermission = (permissionKey: string) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) return res.status(401).json({ message: "Not authenticated" });

//     if (!req.user.permissions || !req.user.permissions.includes(permissionKey)) {
//       return res.status(403).json({ message: "Access denied: insufficient permission" });
//     }

//     next();
//   };
// };

// src/middleware/authMiddleware.ts
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import db from "../../connection";

// declare module "express" {
//   interface Request {
//     user?: {
//       id: number;
//       role: string;
//       email?: string;
//       firstName?: string;
//       lastName?: string;
//       permissions?: string[];
//     };
//   }
// }

// /**
//  * 🔒 Protect middleware — verifies JWT (from cookie or Authorization header)
//  * Attaches user info + permissions to req.user
//  */
// export const protect = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token =
//       req.cookies?.token ||
//       (req.headers?.authorization?.startsWith("Bearer ")
//         ? req.headers.authorization.split(" ")[1]
//         : null);

//     if (!token) return res.status(401).json({ message: "Not authorized, token missing" });

//     const secret = process.env.JWT_SECRET;
//     if (!secret) return res.status(500).json({ message: "Server misconfiguration: missing JWT_SECRET" });

//     const decoded = jwt.verify(token, secret) as { id: number };

//     // Fetch user info with role
//     const user = await db("users")
//       .leftJoin("roles", "users.roleId", "roles.id")
//       .select(
//         "users.id",
//         "users.firstName",
//         "users.lastName",
//         "users.email",
//         "users.status",
//         "roles.role as role"
//       )
//       .where("users.id", decoded.id)
//       .first();

//     if (!user) return res.status(401).json({ message: "User not found" });
//     if (user.status !== "active") return res.status(403).json({ message: "User is inactive, contact admin" });

//     // ✅ Fetch permissions for this user's role
//     const permissions = await db("role_permissions")
//   .join("permissions", "role_permissions.permissionId", "permissions.id")
//   .where("role_permissions.roleId", user.roleId) // use roleId from fetched user
//   .pluck("permissions.key") || [];

//     // const permissions = await db("role_permissions")
//     //   .join("permissions", "role_permissions.permissionId", "permissions.id")
//     //   .where("role_permissions.roleId", (await db("users").select("roleId").where("id", user.id).first())?.roleId)
//     //   .pluck("permissions.key");

//     // Attach user + permissions to req.user
//     req.user = {
//       id: user.id,
//       role: user.role,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       permissions,
//     };

//     next();
//   } catch (err) {
//     console.error("❌ protect middleware error:", err);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// /**
//  * 🛡 Admin-only route guard
//  */
// export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.user) return res.status(401).json({ message: "Not authenticated" });
//   if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied: Admins only" });
//   next();
// };

// /**
//  * Middleware to check if user has required permission
//  */
// export const requirePermission = (permissionKey: string) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) return res.status(401).json({ message: "Not authenticated" });

//     // ✅ Use permissions attached to req.user, no DB query needed
//     if (!req.user.permissions || !req.user.permissions.includes(permissionKey)) {
//       return res.status(403).json({ message: "Access denied: insufficient permission" });
//     }

//     next();
//   };
// };

// ---- only middleware file
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import db from "../../connection";

// declare module "express" {
//   interface Request {
//     user?: {
//       id: number;
//       role: string;
//       email?: string;
//       firstName?: string;
//       lastName?: string;
//     };
//   }
// }

// /**
//  * 🔒 Protect middleware — verifies JWT (from cookie or Authorization header)
//  */
// export const protect = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token =
//       req.cookies?.token ||
//       (req.headers?.authorization?.startsWith("Bearer ")
//         ? req.headers.authorization.split(" ")[1]
//         : null);

//     if (!token) {
//       return res.status(401).json({ message: "Not authorized, token missing" });
//     }

//     const secret = process.env.JWT_SECRET;
//     if (!secret) {
//       return res.status(500).json({ message: "Server misconfiguration: missing JWT_SECRET" });
//     }

//     const decoded = jwt.verify(token, secret) as { id: number };

//     // ✅ JOIN users with roles table to fetch role name
//     const user = await db("users")
//       .leftJoin("roles", "users.roleId", "roles.id")
//       .select(
//         "users.id",
//         "users.firstName",
//         "users.lastName",
//         "users.email",
//         "users.status",
//         "roles.role as role"
//       )
//       .where("users.id", decoded.id)
//       .first();

//     if (!user) return res.status(401).json({ message: "User not found" });
//     if (user.status !== "active")
//       return res.status(403).json({ message: "User is inactive, contact admin" });

//     req.user = {
//       id: user.id,
//       role: user.role,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//     };

//     next();
//   } catch (err) {
//     console.error("❌ protect middleware error:", err);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// /**
//  * 🛡 Admin-only route guard
//  */
// export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.user) return res.status(401).json({ message: "Not authenticated" });
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "Access denied: Admins only" });
//   }
//   next();
// };

// /**
//  * Middleware to check if user has required permission
//  */
// export const requirePermission = (permissionKey: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) return res.status(401).json({ message: "Not authenticated" });

//     // Fetch permissions of the user's role
//     const permissions = await db("role_permissions")
//       .join("permissions", "role_permissions.permissionId", "permissions.id")
//       .where("role_permissions.roleId", (await db("users").select("roleId").where("id", req.user.id).first())?.roleId)
//       .pluck("permissions.key"); // make sure your permission table has 'key'

//     if (!permissions.includes(permissionKey)) {
//       return res.status(403).json({ message: "Access denied: insufficient permission" });
//     }
//     next();
//   };
// };

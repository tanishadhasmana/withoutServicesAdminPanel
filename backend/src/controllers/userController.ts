// // src/controllers/user.controller.ts
// import { Request, Response } from "express";
// import {
//   createFirstAdminService,
//   loginUserService,
//   logoutUserService,
//   getAllUsersService,
//   getUserByIdService,
//   createUserService,
//   updateUserService,
//   updateUserStatusService,
//   getMeService,
// } from "../services/user.service";
// import { AuthRequest } from "../middleware/authMiddleware";

// /**
//  * Create first admin (one-time setup)
//  */
// export const createFirstAdmin = async (req: Request, res: Response) => {
//   try {
//     const admin = await createFirstAdminService(req.body);
//     res.status(201).json({ success: true, data: admin });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * Login user - sets JWT in cookie
//  */
// export const loginUser = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const { user, token } = await loginUserService(email, password);

//     res.cookie("token", token, {
//       httpOnly: false, // should be true in production
//       sameSite: "lax",
//       secure: false,
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     });

//     res.status(200).json({ success: true, user, token });
//   } catch (err: any) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };

// /**
//  * Logout user - clear cookie
//  */
// export const logoutUser = async (req: Request, res: Response) => {
//   try {
//     await logoutUserService();
//     res.clearCookie("token");
//     res.status(200).json({ success: true, message: "Logged out successfully" });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * Get all users (admin only)
//  */
// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const filters = {
//       search: req.query.search as string,
//       column: req.query.column as string,
//     };

//     const users = await getAllUsersService(filters);
//     res.status(200).json({ success: true, data: users });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * Get single user by ID
//  */
// export const getUserById = async (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.id);
//     const user = await getUserByIdService(id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     res.status(200).json({ success: true, data: user });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * Create a new user
//  */
// export const createUser = async (req: Request, res: Response) => {
//   try {
//     const created = await createUserService(req.body, req.file);
//     res.status(201).json({ success: true, data: created });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * Update user by ID
//  */
// export const updateUser = async (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.id);
//     const updated = await updateUserService(id, req.body, req.file);
//     res.status(200).json({ success: true, data: updated });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * Update user status (active/inactive)
//  */
// export const updateUserStatus = async (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.id);
//     const { status } = req.body;
//     const updated = await updateUserStatusService(id, status);
//     res.status(200).json({ success: true, data: updated });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * Get current logged-in user (from JWT)
//  */
// export const getMe = async (req: AuthRequest, res: Response) => {
//   try {
//     if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });

//     const me = await getMeService(req.user.id);
//     res.status(200).json({ success: true, data: me });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };





// import { Request, Response } from "express";
// import * as userService from "../services/user.service";

// export const createFirstAdmin = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.createFirstAdminService(req.body);
//     res.status(201).json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating admin", error });
//   }
// };

// export const loginUser = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.loginUserService(req.body.email, req.body.password);
//     res.json(user);
//   } catch (error) {
//     res.status(401).json({ message: error.message });
//   }
// };

// export const logoutUser = async (req: Request, res: Response) => {
//   try {
//     const result = await userService.logoutUserService(req.body.userId);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error logging out", error });
//   }
// };

// export const getMe = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.getMeService(Number(req.user?.id));
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching profile", error });
//   }
// };

// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await userService.getAllUsersService();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching users", error });
//   }
// };

// export const getUserById = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.getUserByIdService(Number(req.params.id));
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching user", error });
//   }
// };

// export const createUser = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.createUserService(req.body);
//     res.status(201).json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating user", error });
//   }
// };

// export const updateUser = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.updateUserService(Number(req.params.id), req.body);
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating user", error });
//   }
// };

// export const updateUserStatus = async (req: Request, res: Response) => {
//   try {
//     const result = await userService.updateUserStatusService(Number(req.params.id), req.body.status);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating status", error });
//   }
// };





// import { Request, Response } from "express";
// import * as userService from "../services/user.service";

// // ✅ Create first admin
// export const createFirstAdmin = async (req: Request, res: Response) => {
//   try {
//     const result = await userService.createFirstAdminService(req.body);
//     res.status(201).json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating admin", error });
//   }
// };

// // ✅ Login
// export const loginUser = async (req: Request, res: Response) => {
//   try {
//     const result = await userService.loginUserService(req.body);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error logging in", error });
//   }
// };

// // ✅ Logout
// export const logoutUser = async (req: Request, res: Response) => {
//   try {
//     const result = await userService.logoutUserService(req);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error logging out", error });
//   }
// };

// // ✅ Get current user
// export const getMe = async (req: Request, res: Response) => {
//   try {
//     const result = await userService.getMeService(req.user?.id);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching current user", error });
//   }
// };

// // ✅ Get all users
// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const result = await userService.getAllUsersService();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching users", error });
//   }
// };

// // ✅ Get user by ID
// export const getUserById = async (req: Request, res: Response) => {
//   try {
//     const result = await userService.getUserByIdService(Number(req.params.id));
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching user", error });
//   }
// };

// // ✅ Create user
// export const createUser = async (req: Request, res: Response) => {
//   try {
//     const result = await userService.createUserService(req.body, req.file?.filename);
//     res.status(201).json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating user", error });
//   }
// };

// // ✅ Update user
// export const updateUser = async (req: Request, res: Response) => {
//   try {
//     const result = await userService.updateUserService(Number(req.params.id), req.body, req.file?.filename);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating user", error });
//   }
// };

// // ✅ Update user status
// export const updateUserStatus = async (req: Request, res: Response) => {
//   try {
//     const result = await userService.updateUserStatusService(Number(req.params.id), req.body.status);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating user status", error });
//   }
// };





// import { Request, Response } from "express";
// import * as userService from "../services/user.service";
// import { generateToken } from "../utils/generateToken";
// import { comparePassword } from "../utils/hashPassword";

// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await userService.getAllUsersService();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching users", error });
//   }
// };

// export const getUserById = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.getUserByIdService(Number(req.params.id));
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching user", error });
//   }
// };

// export const createUser = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.createUserService(req.body);
//     res.status(201).json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating user", error });
//   }
// };

// export const updateUser = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.updateUserService(Number(req.params.id), req.body);
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating user", error });
//   }
// };

// export const updateUserStatus = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.updateUserStatusService(Number(req.params.id), req.body.status);
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating status", error });
//   }
// };

// export const loginUser = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.loginUserService(req.body.email);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isValid = await comparePassword(req.body.password, user.password);
//     if (!isValid) return res.status(401).json({ message: "Invalid password" });

//     const token = generateToken({ id: user.id, role: user.role });
//     res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
//     res.json({ user, token });
//   } catch (error) {
//     res.status(500).json({ message: "Login error", error });
//   }
// };

// export const getMe = async (req: Request, res: Response) => {
//   try {
//     const user = await userService.getUserByIdService(req.user!.id);
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching profile", error });
//   }
// };




import { Request, Response } from "express";
import db from "../../connection";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/mailer";

/* -------------------------
   Create First Admin (One-Time Setup)
-------------------------- */
export const createFirstAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existing = await db("users").where({ email }).first();
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [id] = await db("users").insert({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      roleId: null, // since first admin has no roleId
      role: role || "admin",
      status: "active",
    });

    const subject = "Welcome to the Admin Panel";
    const html = `
      <h3>Hello ${firstName || ""},</h3>
      <p>Your admin account has been created successfully.</p>
      <p><strong>Email:</strong> ${email}</p>
      <a href="http://localhost:5173/login">Login Here</a>
    `;

    await sendMail(email, subject, subject, html);
    res.status(201).json({ message: "Admin created successfully", id });
  } catch (error) {
    console.error("createFirstAdmin error:", error);
    res.status(500).json({ message: "Error creating admin", error });
  }
};

/* -------------------------
   Login User (Cookie-based Auth)
-------------------------- */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await db("users").where({ email }).first();

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (user.status !== "active")
      return res.status(403).json({ message: "User is inactive" });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    // ✅ Cookie setup for cross-port local dev (5173 → 3000)
    res.cookie("token", token, {
      httpOnly: false,
      sameSite: "lax", 
      secure: false,    // true only if you use HTTPS
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error });
  }
};

/* -------------------------
   Logout User (Clears Cookie)
-------------------------- */
export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

/* -------------------------
   Get Current User (Using protect middleware)
-------------------------- */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // ✅ Join with roles table to get role name
    const user = await db("users")
      .leftJoin("roles", "users.roleId", "roles.id")
      .select(
        "users.id",
        "users.firstName",
        "users.lastName",
        "users.email",
        "roles.role as role",
        "users.profileImage",
        "users.status"
      )
      .where("users.id", userId)
      .first();

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};


/* -------------------------
   Create User (Admin Panel)
-------------------------- */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, roleId, status } = req.body;
    const imagePath = req.file ? `/assets/images/${req.file.filename}` : null;

    const existing = await db("users").where({ email }).first();
    if (existing) return res.status(400).json({ message: "User already exists" });

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const [id] = await db("users").insert({
      firstName,
      lastName,
      email,
      phone,
      roleId: roleId ? Number(roleId) : null,
      password: hashedPassword,
      status: status || "active",
      profileImage: imagePath,
    });

    const subject = "Your Account Has Been Created";
    const html = `
      <h3>Hello ${firstName},</h3>
      <p>Your account has been successfully created.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${randomPassword}</p>
      <a href="http://localhost:5173/login">Login Now</a>
    `;
    await sendMail(email, subject, subject, html);

    res.status(201).json({ message: "User created successfully", id });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

/* -------------------------
   Update User (Admin Panel)
-------------------------- */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, roleId, status } = req.body;
    const imagePath = req.file ? `/assets/images/${req.file.filename}` : undefined;

    const updateData: Record<string, unknown> = {
      firstName,
      lastName,
      email,
      phone,
      roleId: roleId ? Number(roleId) : null,
      status,
      updatedAt: new Date(),
    };

    if (imagePath) updateData.profileImage = imagePath;

    await db("users").where({ id }).update(updateData);

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Error updating user", error });
  }
};

/* -------------------------
   Get All Users
-------------------------- */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, column } = req.query;

    let query = db("users")
      .leftJoin("roles", "users.roleId", "roles.id")
      .select(
        "users.id",
        "users.firstName",
        "users.lastName",
        "users.email",
        "users.phone",
        "roles.role as role",
        "users.status",
        "users.profileImage",
        "users.createdAt"
      );

    if (search && column) {
      const col = column.toString();
      const searchTerm = search.toString();

      // ✅ Exact match for status, LIKE for other fields
      if (col === "status") {
        query = query.where(`users.${col}`, searchTerm);
      } else {
        query = query.where(`users.${col}`, "like", `%${searchTerm}%`);
      }
    }

    const users = await query.orderBy("users.createdAt", "desc");
    res.json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};


/* -------------------------
   Update User Status
-------------------------- */
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    await db("users").where({ id }).update({ status });
    res.json({ message: `User marked as ${status}`, status });
  } catch (error) {
    console.error("updateUserStatus error:", error);
    res.status(500).json({ message: "Failed to update status", error });
  }
};

/* -------------------------
   ✅ Get User By ID (Fixed - outside updateUserStatus)
-------------------------- */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await db("users")
      .leftJoin("roles", "users.roleId", "roles.id")
      .select(
        "users.id",
        "users.firstName",
        "users.lastName",
        "users.email",
        "users.phone",
        "roles.role as role",
        "users.status",
        "users.profileImage"
      )
      .where("users.id", id)
      .first();

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

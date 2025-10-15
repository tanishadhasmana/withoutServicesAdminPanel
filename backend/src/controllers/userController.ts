import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import {
  createFirstAdminService,
  getAllUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  updateUserStatusService,
  loginUserService,
  getMeService,
  deleteUserService
} from "../services/user.service";
import { sendMail } from "../utils/mailer";
import { logActivity } from "../services/audit.service";

const router = Router();

// ----------------------------
// Generate JWT
// ----------------------------
const generateToken = (user: any) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );
};

// ----------------------------
// Create First Admin
// ----------------------------
export const createFirstAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await createFirstAdminService(req.body);

    await logActivity({
      userId: admin.id,
      username: `${admin.firstName} ${admin.lastName}`,
      type: "Create",
      activity: "Created first admin account",
    });

    res.status(201).json(admin);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// Get All Users
// ----------------------------

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, column } = req.query;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await getAllUsersService(
      search as string,
      column as string,
      page,
      limit
    );

    await logActivity({
      userId: req.user?.id || null,
      username: req.user
        ? `${req.user.firstName} ${req.user.lastName}`
        : "Unknown",
      type: "View",
      activity: `Fetched users - page ${page}`,
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// Get User by ID
// ----------------------------
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await getUserByIdService(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "View",
      activity: `Viewed user ID: ${req.params.id}`,
    });

    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// Create User
// ----------------------------
export const createUser = async (req: Request, res: Response) => {
  try {
    let imagePath;
    if (req.file) imagePath = `/images/${req.file.filename}`;

    const { user, tempPassword } = await createUserService({ ...req.body, imagePath });

    const loginUrl = process.env.FRONTEND_URL || "http://localhost:5173/login";
    const subject = "Welcome to Our Platform!";
    const html = `
      <p>Hello ${user.firstName},</p>
      <p>Your account has been successfully created.</p>
      <p><strong>Email:</strong> ${user.email}<br/>
      <strong>Temporary Password:</strong> ${tempPassword}</p>
      <p><a href="${loginUrl}" style="padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Login Now</a></p>
    `;
    sendMail(user.email, subject, `Hello ${user.firstName}, use this link to login: ${loginUrl}`, html)
      .then(() => console.log("Welcome email sent to:", user.email))
      .catch((err) => console.error("Failed to send email:", err));

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Create",
      activity: `Created user: ${user.email}`,
    });

    res.status(201).json({ user, tempPassword });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// Update User
// ----------------------------
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

    let imagePath: string | undefined;
    if (req.file) {
      imagePath = `/images/${req.file.filename}`;
      const oldUser = await getUserByIdService(userId);
      if (oldUser?.profileImage) {
        const oldImagePath = path.join(__dirname, "../../assets", oldUser.profileImage.replace(/^\//, ""));
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
    }

    const roleId = req.body.roleId ? Number(req.body.roleId) : null;

    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone || null,
      status: req.body.status || "active",
      roleId: roleId,
      imagePath,
    };

    const updatedUser = await updateUserService(userId, updateData);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Update",
      activity: `Updated user ID: ${userId}`,
    });

    res.status(200).json(updatedUser);
  } catch (err: any) {
    console.error("Update user error:", err);
    res.status(500).json({ message: err.message || "Something went wrong" });
  }
};

// ----------------------------
// Update User Status
// ----------------------------
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;
    const updatedUser = await updateUserStatusService(userId, status);

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Update",
      activity: `Updated status of user ID: ${userId} to ${status}`,
    });

    res.status(200).json(updatedUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// Login User
// ----------------------------
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await loginUserService(email, password);
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    await logActivity({
      userId: user.id,
      username: `${user.firstName} ${user.lastName}`,
      type: "Authentication",
      activity: "User logged in",
    });

    res.status(200).json({ user, token });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------------------
// Logout User
// ----------------------------
export const logoutUser = async (req: Request, res: Response) => {
  res.cookie("token", "", { maxAge: 0 });

  await logActivity({
    userId: req.user?.id || null,
    username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
    type: "Authentication",
    activity: "User logged out",
  });

  res.status(200).json({ message: "Logged out" });
};

// ----------------------------
// Get Current User
// ----------------------------
export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const user = await getMeService(req.user.id);

    await logActivity({
      userId: req.user.id,
      username: `${req.user.firstName} ${req.user.lastName}`,
      type: "View",
      activity: "Viewed own profile",
    });

    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// Delete User
// ----------------------------
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

    const deleted = await deleteUserService(userId);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    await logActivity({
      userId: req.user?.id || null,
      username: req.user ? `${req.user.firstName} ${req.user.lastName}` : "Unknown",
      type: "Delete",
      activity: `Deleted user ID: ${userId}`,
    });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err: any) {
    console.error("Delete user error:", err);
    return res.status(500).json({ message: err.message || "Failed to delete user" });
  }
};

export default router;



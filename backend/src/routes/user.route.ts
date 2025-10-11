// import { Router, Request, Response } from "express";
// import mysql from "mysql2/promise";
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const router = Router();

// // ----------------------
// // ✅ Database connection
// // ----------------------
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// // ----------------------
// // ✅ Multer setup (profile image)
// // ----------------------
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = path.join(__dirname, "../../assets/images");
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `user_${Date.now()}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const allowed = /jpeg|jpg|png|gif/;
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowed.test(ext)) cb(null, true);
//     else cb(new Error("Only images are allowed"));
//   },
// });

// // ----------------------
// // ✅ Routes
// // ----------------------

// // Get all users
// router.get("/", async (req: Request, res: Response) => {
//   const [rows] = await pool.query("SELECT * FROM users");
//   res.json(rows);
// });

// // Get single user
// router.get("/:id", async (req: Request, res: Response) => {
//   const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [req.params.id]);
//   if (!(rows as any).length) return res.status(404).json({ message: "User not found" });
//   res.json((rows as any)[0]);
// });

// // Create user
// router.post("/", upload.single("profileImage"), async (req: Request, res: Response) => {
//   const file = req.file;
//   const data = req.body;
//   const profileImage = file ? `/assets/images/${file.filename}` : null;

//   const { firstName, lastName, email, password, roleId, mobile, status } = data;

//   const [result] = await pool.query(
//     `INSERT INTO users (firstName,lastName,email,password,roleId,mobile,status,profileImage,createdAt) 
//      VALUES (?,?,?,?,?,?,?,?,?,NOW())`,
//     [firstName, lastName, email, password, roleId, mobile, status, profileImage]
//   );

//   const insertId = (result as any).insertId;
//   const [newUser] = await pool.query("SELECT * FROM users WHERE id=?", [insertId]);
//   res.status(201).json((newUser as any)[0]);
// });

// // Update user
// router.put("/:id", upload.single("profileImage"), async (req: Request, res: Response) => {
//   const file = req.file;
//   const data = req.body;
//   const profileImage = file ? `/assets/images/${file.filename}` : data.profileImage;

//   const { firstName, lastName, email, password, roleId, mobile, status } = data;

//   await pool.query(
//     `UPDATE users SET firstName=?, lastName=?, email=?, password=?, roleId=?, mobile=?, status=?, profileImage=?, updatedAt=NOW() 
//      WHERE id=?`,
//     [firstName, lastName, email, password, roleId, mobile, status, profileImage, req.params.id]
//   );

//   const [updated] = await pool.query("SELECT * FROM users WHERE id=?", [req.params.id]);
//   if (!(updated as any).length) return res.status(404).json({ message: "User not found" });
//   res.json((updated as any)[0]);
// });

// // Delete user
// router.delete("/:id", async (req: Request, res: Response) => {
//   const [result] = await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
//   if ((result as any).affectedRows === 0) return res.status(404).json({ message: "User not found" });
//   res.json({ message: "User deleted successfully" });
// });

// // Toggle active/inactive
// router.patch("/:id/toggle-status", async (req: Request, res: Response) => {
//   const [user] = await pool.query("SELECT status FROM users WHERE id=?", [req.params.id]);
//   if (!(user as any).length) return res.status(404).json({ message: "User not found" });

//   const newStatus = (user as any)[0].status === "active" ? "inactive" : "active";
//   await pool.query("UPDATE users SET status=?, updatedAt=NOW() WHERE id=?", [newStatus, req.params.id]);

//   const [updated] = await pool.query("SELECT * FROM users WHERE id=?", [req.params.id]);
//   res.json((updated as any)[0]);
// });

// export default router;




import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createFirstAdmin,
  getAllUsers,
  loginUser,
  createUser,
  logoutUser,
  getMe,
  updateUserStatus,
  updateUser,
  getUserById
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ Ensure image directory exists
const imageDir = path.join(__dirname, "../../assets/images");
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `user_${Date.now()}${ext}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, or WEBP image files are allowed"));
    }
    cb(null, true);
  },
});

// ----------------------------
// 🔐 Auth routes
// ----------------------------
router.post("/create-admin", createFirstAdmin);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// ----------------------------
// 🔒 Protected routes
// ----------------------------
router.get("/me", protect, getMe);

// ----------------------------
// 👥 Admin panel user management
// ----------------------------
router.get("/", getAllUsers);
router.post("/", upload.single("image"), createUser);
router.put("/:id", upload.single("image"), updateUser);
router.put("/:id/status", updateUserStatus);
router.get("/:id", protect, getUserById);

export default router;

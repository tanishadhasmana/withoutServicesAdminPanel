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
  getUserById,
  deleteUser,
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
router.delete("/:id", protect, deleteUser);

export default router;

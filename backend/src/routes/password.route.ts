// import { Router, Request, Response } from "express";
// import mysql from "mysql2/promise";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import cookieParser from "cookie-parser";

// const router = Router();

// // ✅ DB connection
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// // ----------------------
// // ✅ Login
// // ----------------------
// router.post("/login", async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
//   if (!(rows as any).length) return res.status(401).json({ message: "Invalid credentials" });

//   const user = (rows as any)[0];
//   const match = await bcrypt.compare(password, user.password);
//   if (!match) return res.status(401).json({ message: "Invalid credentials" });

//   // ✅ Generate JWT
//   const token = jwt.sign({ id: user.id, roleId: user.roleId }, process.env.JWT_SECRET!, {
//     expiresIn: "1d",
//   });

//   res.cookie("token", token, {
//     httpOnly: true,
//     sameSite: "lax",
//     secure: false,
//     maxAge: 24 * 60 * 60 * 1000,
//   });

//   res.json({ message: "Login successful", user });
// });

// // ----------------------
// // ✅ Logout
// // ----------------------
// router.post("/logout", (req: Request, res: Response) => {
//   res.clearCookie("token");
//   res.json({ message: "Logged out" });
// });

// export default router;




import { Router } from "express";
import { forgotPassword, resetPassword } from "../controllers/passwordController";

const router = Router();

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;

// import { Request, Response } from "express";
// import * as passwordService from "../services/password.service";

// export const forgotPassword = async (req: Request, res: Response) => {
//   try {
//     const result = await passwordService.forgotPasswordService(req.body.email);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error sending reset email", error });
//   }
// };

// export const resetPassword = async (req: Request, res: Response) => {
//   try {
//     const result = await passwordService.resetPasswordService(req.body);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error resetting password", error });
//   }
// };




// import db from "../../connection"; // your knex connection
// import { sendMail } from "../utils/mailer";
// import bcrypt from "bcrypt";
// import crypto from "crypto";

// // ✅ Forgot Password: Generate token and send email
// export const forgotPasswordService = async (email: string) => {
//   // Check if user exists
//   const user = await db("users").where({ email }).first();
//   if (!user) throw new Error("User not found");

//   // Generate reset token
//   const token = crypto.randomBytes(32).toString("hex");

//   // Save token and expiry (e.g., 1 hour)
//   await db("users")
//     .where({ email })
//     .update({
//       reset_token: token,
//       reset_token_expiry: new Date(Date.now() + 3600 * 1000),
//     });

//   // Send email
//   await sendMail(
//     email,
//     "Password Reset",
//     `Use this token to reset your password: ${token}`
//   );

//   return { message: "Password reset email sent" };
// };

// // ✅ Reset Password
// export const resetPasswordService = async (data: { email: string; token: string; password: string }) => {
//   const { email, token, password } = data;

//   const user = await db("users")
//     .where({ email, reset_token: token })
//     .andWhere("reset_token_expiry", ">", new Date())
//     .first();

//   if (!user) throw new Error("Invalid token or expired");

//   // Hash new password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // Update user password and remove token
//   await db("users")
//     .where({ email })
//     .update({
//       password: hashedPassword,
//       reset_token: null,
//       reset_token_expiry: null,
//     });

//   return { message: "Password reset successful" };
// };






// import { Request, Response } from "express";
// import * as passwordService from "../services/password.service";

// export const forgotPassword = async (req: Request, res: Response) => {
//   try {
//     const result = await passwordService.forgotPasswordService(req.body.email);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error sending reset email", error });
//   }
// };

// export const resetPassword = async (req: Request, res: Response) => {
//   try {
//     const result = await passwordService.resetPasswordService(req.body);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error resetting password", error });
//   }
// };






import { Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../../connection";
import { sendMail } from "../utils/mailer";
import dotenv from "dotenv";
dotenv.config();

const RESET_SECRET: Secret = (process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET || "default_secret") as Secret;
const RESET_EXPIRES = process.env.RESET_TOKEN_EXPIRES || "15m";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await db("users").where({ email }).first();
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Type-safe sign
    const token = jwt.sign(
      { id: user.id, email: user.email },
      RESET_SECRET,
      { expiresIn: RESET_EXPIRES } as SignOptions
    );

    const resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

    const subject = "Reset your admin panel password";
    const text = `Hello ${user.firstName || ""},

We received a request to reset your password. Use the link below to set a new password (link expires in ${RESET_EXPIRES}):

${resetLink}

If you did not request this, you can ignore this email.

Thanks,
Admin Panel`;

    const html = `
      <p>Hello ${user.firstName || ""},</p>
      <p>We received a request to reset your password. Click the button below to reset it. The link expires in ${RESET_EXPIRES}.</p>
      <p><a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#0366d6;color:white;border-radius:6px;text-decoration:none">Reset password</a></p>
      <p>If you did not request this, ignore this email.</p>
      <p style="font-size:12px;color:#666;">This is an automated message.</p>
    `;

    await sendMail(user.email, subject, text, html);
    return res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Failed to send reset link" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ message: "Token and newPassword are required" });

  try {
    const decoded = jwt.verify(token, RESET_SECRET) as { id: number; email: string };
    const hashed = await bcrypt.hash(newPassword, 10);

    await db("users")
      .where({ id: decoded.id })
      .update({
        password: hashed,
        updatedAt: db.fn.now(),
      });

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

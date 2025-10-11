// src/services/password.service.ts
import db from "../../connection";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { hashPassword } from "../utils/hashPassword";
import { sendMail } from "../utils/mailer";

dotenv.config();

const RESET_SECRET = process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET || "default_reset_secret";
const RESET_EXPIRES = process.env.RESET_TOKEN_EXPIRES || "15m";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const forgotPasswordService = async (email: string) => {
  if (!email) throw new Error("Email is required");
  const user = await db("users").where({ email }).first();
  if (!user) throw new Error("User not found");

  const token = jwt.sign({ id: user.id, email: user.email }, RESET_SECRET, { expiresIn: RESET_EXPIRES as jwt.SignOptions["expiresIn"] });
  const resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const subject = "Reset your admin panel password";
  const text = `Use this link to reset your password (expires in ${RESET_EXPIRES}): ${resetLink}`;
  const html = `<p>Click the link to reset password (expires in ${RESET_EXPIRES}): <a href="${resetLink}">Reset password</a></p>`;

  await sendMail(user.email, subject, text, html);
  return { message: "Reset link sent" };
};

export const resetPasswordService = async (payload: { token: string; newPassword: string }) => {
  const { token, newPassword } = payload;
  if (!token || !newPassword) throw new Error("Token and newPassword are required");

  const decoded = jwt.verify(token, RESET_SECRET) as { id: number; email: string };
  const hashed = await hashPassword(newPassword);
  await db("users").where({ id: decoded.id }).update({ password: hashed, updatedAt: db.fn.now() });

  return { message: "Password updated successfully" };
};



// import db from "../../connection";
// import { sendMail } from "../utils/mailer";
// import { hashPassword } from "../utils/hashPassword";

// export const forgotPasswordService = async (email: string) => {
//   const user = await db("users").where({ email }).first();
//   if (!user) throw new Error("User not found");

//   const resetToken = Math.random().toString(36).substring(2, 12); // simple token
//   await db("users").where({ email }).update({ reset_token: resetToken });

//   await sendMail(email, "Reset Password", `Your token: ${resetToken}`);
//   return { message: "Password reset email sent" };
// };

// export const resetPasswordService = async ({ email, token, newPassword }: any) => {
//   const user = await db("users").where({ email, reset_token: token }).first();
//   if (!user) throw new Error("Invalid token or email");

//   const hashed = await hashPassword(newPassword);
//   await db("users").where({ email }).update({ password: hashed, reset_token: null });
//   return { message: "Password reset successful" };
// };



// import db from "../../connection";
// import { hashPassword } from "../utils/hashPassword";

// export const updatePasswordService = async (email: string, password: string) => {
//   const hashedPassword = await hashPassword(password);
//   const [user] = await db("users").where({ email }).update({ password: hashedPassword }).returning("*");
//   return user;
// };

// export const getUserByEmailService = async (email: string) => {
//   return await db("users").where({ email }).first();
// };

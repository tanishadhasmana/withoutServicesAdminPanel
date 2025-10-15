import { Request, Response } from "express";
import {
  forgotPasswordService,
  resetPasswordService,
} from "../services/password.service";
import { logActivity } from "../services/audit.service";

// ----------------------------
// Forgot Password
// ----------------------------
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    await forgotPasswordService(email);

    // 🟢 Log activity
    await logActivity({
      userId: null, // user is unknown here
      username: email,
      type: "Authentication",
      activity: `Requested password reset for email: ${email}`,
    });

    return res.json({ message: "Reset link sent to your email" });
  } catch (err: any) {
    console.error("forgotPassword error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to send reset link" });
  }
};

// ----------------------------
// Reset Password
// ----------------------------
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res
      .status(400)
      .json({ message: "Token and newPassword are required" });

  try {
    await resetPasswordService(token, newPassword);

    // 🟢 Log activity
    await logActivity({
      userId: null, // we might not know user id here
      username: "Unknown",
      type: "Authentication",
      activity: `Password reset using token: ${token}`,
    });

    return res.json({ message: "Password updated successfully" });
  } catch (err: any) {
    console.error("resetPassword error:", err);
    return res
      .status(400)
      .json({ message: err.message || "Invalid or expired token" });
  }
};


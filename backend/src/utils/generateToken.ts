import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("❌ Missing JWT_SECRET in environment variables");
}

export const generateToken = (
  payload: object,
  expiresIn: number | string = "1d"
): string => {
  try {
    const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
    return jwt.sign(payload, JWT_SECRET, options);
  } catch (err) {
    console.error("❌ generateToken error:", err);
    throw new Error("Failed to generate token");
  }
};


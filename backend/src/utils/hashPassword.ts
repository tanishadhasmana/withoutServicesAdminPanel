import bcrypt from "bcrypt";

/**
 * Hash a plain text password
 * @param password string
 * @returns hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare plain text password with hashed password
 * @param password string
 * @param hashedPassword string
 * @returns boolean
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

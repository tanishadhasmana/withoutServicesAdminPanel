// src/services/user.service.ts
import db from "../../connection";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { generateToken } from "../utils/generateToken";
import { sendMail } from "../utils/mailer";

/**
 * Create first admin (one-time)
 */
export const createFirstAdminService = async (data: any) => {
  const { firstName, lastName, email, password, role } = data;
  const hashed = await hashPassword(password || Math.random().toString(36).slice(-8));

  const inserted = await db("users").insert({
    firstName,
    lastName,
    email,
    password: hashed,
    roleId: null,
    role: role || "admin",
    status: "active",
  });

  const id = Array.isArray(inserted) ? inserted[0] : (inserted as number);
  const user = await db("users")
    .leftJoin("roles", "users.roleId", "roles.id")
    .select(
      "users.id",
      "users.firstName",
      "users.lastName",
      "users.email",
      "roles.role as role",
      "users.profileImage as image",
      "users.status"
    )
    .where("users.id", id)
    .first();

  // Optionally send welcome mail
  try {
    await sendMail(email, "Welcome to Admin Panel", `Your account is created`, `<p>Hello ${firstName}</p>`);
  } catch (e) {
    // don't block creation on mail failure
    console.warn("Welcome mail failed:", e);
  }

  return user;
};

/**
 * Login user - returns { user, token }
 */
export const loginUserService = async (email: string, password: string) => {
  const user = await db("users")
    .leftJoin("roles", "users.roleId", "roles.id")
    .select("users.id", "users.firstName", "users.lastName", "users.email", "users.password", "roles.role as role", "users.status", "users.profileImage as image")
    .where("users.email", email)
    .first();

  if (!user) throw new Error("User not found");
  if (user.status !== "active") throw new Error("User inactive");

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // remove password from returned user object
  const { password: _pwd, ...userWithoutPassword } = user;

  const token = generateToken({ id: user.id, role: user.role });
  return { user: userWithoutPassword, token };
};

export const logoutUserService = async () => {
  // Nothing server-side necessary here for stateless JWT; controller can clear cookie.
  return { message: "Logged out successfully" };
};

export const getAllUsersService = async (filters?: { search?: string; column?: string }) => {
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
      "users.profileImage as profileImage",
      "users.createdAt"
    );

  if (filters?.search && filters.column) {
    const col = String(filters.column);
    const searchTerm = String(filters.search);
    if (col === "status") query = query.where(`users.${col}`, searchTerm);
    else query = query.where(`users.${col}`, "like", `%${searchTerm}%`);
  }

  const rows = await query.orderBy("users.createdAt", "desc");
  return rows;
};

export const getUserByIdService = async (id: number) => {
  const row = await db("users")
    .leftJoin("roles", "users.roleId", "roles.id")
    .select("users.id", "users.firstName", "users.lastName", "users.email", "users.phone", "roles.role as role", "users.status", "users.profileImage as profileImage")
    .where("users.id", id)
    .first();
  return row;
};

export const createUserService = async (data: any, file?: Express.Multer.File) => {
  const { firstName, lastName, email, password, roleId, status } = data;
  const hashed = await hashPassword(password || Math.random().toString(36).slice(-8));
  const image = file ? `/assets/images/${file.filename}` : null;

  const inserted = await db("users").insert({
    firstName,
    lastName,
    email,
    password: hashed,
    roleId: roleId ? Number(roleId) : null,
    status: status || "active",
    profileImage: image,
  });

  const id = Array.isArray(inserted) ? inserted[0] : (inserted as number);
  const created = await getUserByIdService(Number(id));
  return created;
};

export const updateUserService = async (id: number, data: any, file?: Express.Multer.File) => {
  const { firstName, lastName, email, password, roleId, status } = data;
  const updateData: any = {
    firstName,
    lastName,
    email,
    roleId: roleId ? Number(roleId) : null,
    status,
    updatedAt: db.fn.now(),
  };

  if (password) updateData.password = await hashPassword(password);
  if (file) updateData.profileImage = `/assets/images/${file.filename}`;

  await db("users").where({ id }).update(updateData);
  const updated = await getUserByIdService(id);
  return updated;
};

export const updateUserStatusService = async (id: number, status: string) => {
  await db("users").where({ id }).update({ status, updatedAt: db.fn.now() });
  const updated = await getUserByIdService(id);
  return updated;
};

export const getMeService = async (id: number) => {
  const row = await db("users")
    .leftJoin("roles", "users.roleId", "roles.id")
    .select("users.id", "users.firstName", "users.lastName", "users.email", "roles.role as role", "users.profileImage as profileImage", "users.status")
    .where("users.id", id)
    .first();

  if (!row) throw new Error("User not found");
  return row;
};



// src/services/user.service.ts
// import db from "../../connection";
// import { hashPassword } from "../utils/hashPassword";
// import { comparePassword } from "../utils/hashPassword";
// import { generateToken } from "../utils/generateToken";

// /* ---------------------------
//    👤 Create First Admin
// ---------------------------- */
// export const createFirstAdminService = async (data: any) => {
//   const { firstName, lastName, email, password, role } = data;
//   const hashedPassword = await hashPassword(password);

//   const insertedId = await db("users").insert({
//     firstName,
//     lastName,
//     email,
//     password: hashedPassword,
//     roleId: role, // Assuming role is roleId here
//     status: "active",
//   });

//   const user = await db("users")
//     .leftJoin("roles", "users.roleId", "roles.id")
//     .select("users.id", "users.firstName", "users.lastName", "users.email", "users.status", "roles.role as role")
//     .where("users.id", insertedId[0])
//     .first();

//   return user;
// };

// /* ---------------------------
//    👤 Login User
// ---------------------------- */
// export const loginUserService = async (email: string, password: string) => {
//   const user = await db("users")
//     .leftJoin("roles", "users.roleId", "roles.id")
//     .select("users.*", "roles.role as role")
//     .where("users.email", email)
//     .first();

//   if (!user) throw new Error("User not found");

//   const isMatch = await comparePassword(password, user.password);
//   if (!isMatch) throw new Error("Invalid credentials");

//   const token = generateToken({ id: user.id, role: user.role });
//   return { user, token };
// };

// /* ---------------------------
//    👤 Get All Users
// ---------------------------- */
// export const getAllUsersService = async () => {
//   return await db("users")
//     .leftJoin("roles", "users.roleId", "roles.id")
//     .select("users.id", "users.firstName", "users.lastName", "users.email", "users.status", "roles.role as role", "users.image");
// };

// /* ---------------------------
//    👤 Get User By ID
// ---------------------------- */
// export const getUserByIdService = async (id: number) => {
//   return await db("users")
//     .leftJoin("roles", "users.roleId", "roles.id")
//     .select("users.id", "users.firstName", "users.lastName", "users.email", "users.status", "roles.role as role", "users.image")
//     .where("users.id", id)
//     .first();
// };

// /* ---------------------------
//    👤 Create User
// ---------------------------- */
// export const createUserService = async (data: any, file?: Express.Multer.File) => {
//   const { firstName, lastName, email, password, role } = data;
//   const hashedPassword = await hashPassword(password);
//   const image = file?.filename || null;

//   const insertedId = await db("users").insert({
//     firstName,
//     lastName,
//     email,
//     password: hashedPassword,
//     roleId: role,
//     status: "active",
//     image,
//   });

//   const user = await db("users")
//     .leftJoin("roles", "users.roleId", "roles.id")
//     .select("users.id", "users.firstName", "users.lastName", "users.email", "users.status", "roles.role as role", "users.image")
//     .where("users.id", insertedId[0])
//     .first();

//   return user;
// };

// /* ---------------------------
//    👤 Update User
// ---------------------------- */
// export const updateUserService = async (id: number, data: any, file?: Express.Multer.File) => {
//   const { firstName, lastName, email, password, role } = data;
//   const updateData: any = { firstName, lastName, email, roleId: role };

//   if (password) updateData.password = await hashPassword(password);
//   if (file?.filename) updateData.image = file.filename;

//   await db("users").where({ id }).update(updateData);

//   const user = await db("users")
//     .leftJoin("roles", "users.roleId", "roles.id")
//     .select("users.id", "users.firstName", "users.lastName", "users.email", "users.status", "roles.role as role", "users.image")
//     .where("users.id", id)
//     .first();

//   return user;
// };

// /* ---------------------------
//    👤 Update User Status
// ---------------------------- */
// export const updateUserStatusService = async (id: number, status: string) => {
//   await db("users").where({ id }).update({ status });

//   const user = await db("users")
//     .leftJoin("roles", "users.roleId", "roles.id")
//     .select("users.id", "users.firstName", "users.lastName", "users.email", "users.status", "roles.role as role", "users.image")
//     .where("users.id", id)
//     .first();

//   return user;
// };

// /* ---------------------------
//    👤 Get Current Logged-in User
// ---------------------------- */
// export const getMeService = async (id: number) => {
//   const user = await db("users")
//     .leftJoin("roles", "users.roleId", "roles.id")
//     .select("users.id", "users.firstName", "users.lastName", "users.email", "users.status", "roles.role as role", "users.image")
//     .where("users.id", id)
//     .first();

//   if (!user) throw new Error("User not found");
//   return user;
// };

// /* ---------------------------
//    👤 Logout User
// ---------------------------- */
// export const logoutUserService = async () => {
//   return { message: "Logged out successfully" };
// };




// import db from "../../connection";
// import { hashPassword } from "../utils/hashPassword";
// import { comparePassword } from "../utils/hashPassword";
// import { generateToken } from "../utils/generateToken";

// // ✅ Create first admin
// export const createFirstAdminService = async (data: any) => {
//   const { firstName, lastName, email, password } = data;

//   const hashedPassword = await hashPassword(password);

//   const [admin] = await db("users").insert(
//     {
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       role: "admin",
//       status: "active",
//     },
//     ["id", "firstName", "lastName", "email", "role", "status"]
//   );

//   return admin;
// };

// // ✅ Login user
// export const loginUserService = async (data: any) => {
//   const { email, password } = data;

//   const user = await db("users").where({ email }).first();
//   if (!user) throw new Error("User not found");

//   const isMatch = await comparePassword(password, user.password);
//   if (!isMatch) throw new Error("Invalid password");

//   const token = generateToken({ id: user.id, role: user.role });

//   // Return user info + token
//   return { user, token };
// };

// // ✅ Logout user
// export const logoutUserService = async (req: any) => {
//   req.res?.clearCookie("token");
//   return { message: "Logged out successfully" };
// };

// // ✅ Get current logged-in user
// export const getMeService = async (userId: number) => {
//   const user = await db("users").where({ id: userId }).first();
//   return user;
// };

// // ✅ Get all users
// export const getAllUsersService = async () => {
//   return await db("users").select("id", "firstName", "lastName", "email", "role", "status");
// };

// // ✅ Get single user by ID
// export const getUserByIdService = async (id: number) => {
//   return await db("users").where({ id }).first();
// };

// // ✅ Create user
// export const createUserService = async (data: any, file?: Express.Multer.File) => {
//   const { firstName, lastName, email, password, role } = data;
//   const hashedPassword = await hashPassword(password);

//   const image = file?.filename || null;

//   const [user] = await db("users").insert(
//     {
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       role,
//       image,
//       status: "active",
//     },
//     ["id", "firstName", "lastName", "email", "role", "status", "image"]
//   );

//   return user;
// };

// // ✅ Update user
// export const updateUserService = async (id: number, data: any, file?: Express.Multer.File) => {
//   const { firstName, lastName, email, password, role } = data;

//   const updateData: any = { firstName, lastName, email, role };
//   if (password) updateData.password = await hashPassword(password);
//   if (file?.filename) updateData.image = file.filename;

//   const [user] = await db("users")
//     .where({ id })
//     .update(updateData, ["id", "firstName", "lastName", "email", "role", "status", "image"]);

//   return user;
// };

// // ✅ Update user status
// export const updateUserStatusService = async (id: number, status: string) => {
//   const [user] = await db("users").where({ id }).update({ status }, ["id", "status"]);
//   return user;
// };







// import db from "../../connection";
// import { comparePassword } from "../utils/hashPassword";
// import { generateToken } from "../utils/generateToken";

// interface LoginInput {
//   email: string;
//   password: string;
// }

// export const loginUserService = async ({ email, password }: LoginInput) => {
//   const user = await db("users").where({ email }).first();
//   if (!user) throw new Error("User not found");

//   const isMatch = await comparePassword(password, user.password);
//   if (!isMatch) throw new Error("Invalid credentials");

//   // Return user + token
//   const token = generateToken({ id: user.id, role: user.role });
//   return { ...user, token };
// };

// export const getMeService = async (userId: number) => {
//   const user = await db("users").where({ id: userId }).first();
//   if (!user) throw new Error("User not found");
//   return user;
// };

// Add more functions here as needed (createUser, updateUser, etc.)


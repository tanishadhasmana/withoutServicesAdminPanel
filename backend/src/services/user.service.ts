import db from "../../connection";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";
import { logActivity } from "./audit.service";

// ----------------------------
// Create First Admin
// ----------------------------
export const createFirstAdminService = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const [id] = await db("users").insert({
    ...data,
    password: hashedPassword,
    role: "admin",
    roleId: null,
    status: "active",
  });

  return db("users").where({ id }).first();
};

// ----------------------------
// Get All Users (with pagination & search)
// ----------------------------
export const getAllUsersService = async (
  search?: string,
  column?: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  // 🧱 Base query for users list
  let baseQuery = db("users")
    .leftJoin("roles", "users.roleId", "roles.id")
    .select(
      "users.id",
      "users.firstName",
      "users.lastName",
      "users.email",
      "users.phone",
      "roles.role as role",
      "users.status",
      "users.profileImage",
      "users.createdAt"
    );

  // 🧩 Search filter (optional)
  if (search && column) {
    const searchColumn = `users.${column}`;
    if (column === "status") {
      baseQuery = baseQuery.where(searchColumn, search.toLowerCase());
    } else {
      baseQuery = baseQuery.where(searchColumn, "like", `%${search}%`);
    }
  }

  // ✅ Consistent count query
  const countResult = await db("users")
    .modify((qb) => {
      if (search && column) {
        if (column === "status") {
          qb.where(`users.${column}`, search.toLowerCase());
        } else {
          qb.where(`users.${column}`, "like", `%${search}%`);
        }
      }
    })
    .count<{ total: number }>("id as total");

  const total = Number(countResult[0]?.total || 0);

  const users = await baseQuery
    .orderBy("users.createdAt", "desc")
    .limit(limit)
    .offset(offset);

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return { users, total, totalPages, currentPage: page };
};

// ----------------------------
// Get User By ID
// ----------------------------
export const getUserByIdService = async (id: number) => {
  return db("users")
    .leftJoin("roles", "users.roleId", "roles.id")
    .select(
      "users.id",
      "users.firstName",
      "users.lastName",
      "users.email",
      "users.phone",
      "roles.role as role",
      "users.status",
      "users.profileImage",
      "users.createdAt"
    )
    .where("users.id", id)
    .first();
};

// ----------------------------
// Create User
// ----------------------------
export const createUserService = async (data: any) => {
  const existing = await db("users").where({ email: data.email }).first();
  if (existing) throw new Error("User already exists");

  const tempPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  let roleName: string | null = null;
  if (data.roleId) {
    const roleRow = await db("roles").where({ id: Number(data.roleId) }).first();
    if (roleRow) roleName = roleRow.role;
  }

  const insertData: any = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || null,
    status: data.status || "active",
    role: roleName,
    roleId: data.roleId ? Number(data.roleId) : null,
    profileImage: data.imagePath || null,
    password: hashedPassword,
  };

  const [id] = await db("users").insert(insertData);
  const user = await db("users").where({ id }).first();

  return { user, tempPassword };
};

// ----------------------------
// Update User
// ----------------------------
export const updateUserService = async (id: number, data: any) => {
  if (data.roleId) {
    const roleRow = await db("roles").where({ id: Number(data.roleId) }).first();
    if (roleRow) data.role = roleRow.role;
  }

  if (data.imagePath) data.profileImage = data.imagePath;

  await db("users").where({ id }).update({ ...data, updatedAt: db.fn.now() });
  return db("users").where({ id }).first();
};

// ----------------------------
// Update User Status
// ----------------------------
export const updateUserStatusService = async (id: number, status: string) => {
  await db("users").where({ id }).update({ status, updatedAt: db.fn.now() });
  return db("users").where({ id }).first();
};

// ----------------------------
// Login User
// ----------------------------
export const loginUserService = async (email: string, password: string) => {
  const user = await db("users").where({ email }).first();
  if (!user) throw new Error("Invalid email or password");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error("Invalid email or password");

  if (user.status !== "active") throw new Error("User is inactive");

  return user;
};

// ----------------------------
// Get Current User
// ----------------------------
export const getMeService = async (id: number) => {
  return db("users").where({ id }).first();
};

// ----------------------------
// Delete User (hard delete + image cleanup)
// ----------------------------
export const deleteUserService = async (id: number | string) => {
  const userId = Number(id);
  if (isNaN(userId)) {
    console.log("Invalid user ID provided to service:", id);
    return null;
  }

  console.log("Trying to delete user ID:", userId);

  const user = await db("users").where({ id: userId }).first();
  if (!user) {
    console.log("User not found in DB for ID:", userId);
    return null;
  }

  // 🧹 Remove profile image if exists
  if (user.profileImage) {
    const imagePath = path.join(__dirname, "../../assets", user.profileImage.replace(/^\//, ""));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log("Deleted profile image for user ID:", userId);
    }
  }

  await db("users").where({ id: userId }).del();
  console.log("User deleted successfully from DB ID:", userId);

  return true;
};








// import db from "../../connection";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// // ----------------------------
// // Generate JWT
// // ----------------------------
// export const generateToken = (user: any) => {
//   return jwt.sign(
//     { id: user.id, role: user.role, email: user.email },
//     process.env.JWT_SECRET as string,
//     { expiresIn: "1d" }
//   );
// };

// // ----------------------------
// // Create First Admin
// // ----------------------------
// export const createFirstAdminDb = async (data: any) => {
//   const hashedPassword = await bcrypt.hash(data.password, 10);
//   const [id] = await db("users").insert({
//     ...data,
//     password: hashedPassword,
//     role: "admin",
//     roleId: null,
//     status: "active",
//   });
//   return db("users").where({ id }).first();
// };

// // ----------------------------
// // Get All Users (Newest First)
// // ----------------------------
// export const getAllUsersDb = async (search?: string, column?: string) => {
//   let query = db("users")
//     .leftJoin("roles", "users.roleId", "roles.id")
//     .select(
//       "users.id",
//       "users.firstName",
//       "users.lastName",
//       "users.email",
//       "users.phone",
//       "roles.role as role",
//       "users.status",
//       "users.profileImage",
//       "users.createdAt"
//     )
//     .orderBy("users.createdAt", "desc"); // NEWEST first

//   if (search && column) {
//     if (column === "status") {
//       query = query.where(`users.${column}`, search.toLowerCase());
//     } else {
//       query = query.where(`users.${column}`, "like", `%${search}%`);
//     }
//   }

//   return query;
// };

// // ----------------------------
// // Get User by ID
// // ----------------------------
// export const getUserByIdDb = async (id: string | number) => {
//   return db("users").where({ id: Number(id) }).first();
// };

// // ----------------------------
// // Create User
// // ----------------------------
// export const createUserDb = async (data: any) => {
//   const existing = await db("users").where({ email: data.email }).first();
//   if (existing) throw new Error("User already exists");

//   const tempPassword = Math.random().toString(36).slice(-8);
//   const hashedPassword = await bcrypt.hash(tempPassword, 10);

//   let roleName: string | null = null;
//   if (data.roleId) {
//     const roleRow = await db("roles").where({ id: Number(data.roleId) }).first();
//     if (roleRow) roleName = roleRow.role;
//   }

//   const insertData: any = {
//     firstName: data.firstName,
//     lastName: data.lastName,
//     email: data.email,
//     phone: data.phone || null,
//     status: data.status || "active",
//     role: roleName,
//     roleId: data.roleId ? Number(data.roleId) : null,
//     profileImage: data.imagePath || null,
//     password: hashedPassword,
//   };

//   const [id] = await db("users").insert(insertData);
//   const user = await db("users").where({ id }).first();
//   return { user, tempPassword };
// };

// // ----------------------------
// // Update User
// // ----------------------------
// export const updateUserDb = async (id: string | number, data: any) => {
//   if (data.roleId) {
//     const roleRow = await db("roles").where({ id: Number(data.roleId) }).first();
//     if (roleRow) data.role = roleRow.role;
//   }

//   if (data.imagePath) data.profileImage = data.imagePath;

//   await db("users").where({ id: Number(id) }).update({ ...data, updatedAt: db.fn.now() });
//   return db("users").where({ id: Number(id) }).first();
// };

// // ----------------------------
// // Update User Status
// // ----------------------------
// export const updateUserStatusDb = async (id: string | number, status: string) => {
//   await db("users").where({ id: Number(id) }).update({ status, updatedAt: db.fn.now() });
//   return db("users").where({ id: Number(id) }).first();
// };

// // ----------------------------
// // Login User
// // ----------------------------
// export const loginUserDb = async (email: string, password: string) => {
//   const user = await db("users").where({ email }).first();
//   if (!user) throw new Error("Invalid email or password");

//   const validPassword = await bcrypt.compare(password, user.password);
//   if (!validPassword) throw new Error("Invalid email or password");

//   if (user.status !== "active") throw new Error("User is inactive");

//   return user;
// };

// // ----------------------------
// // Get Current User
// // ----------------------------
// export const getMeDb = async (id: number) => {
//   return db("users").where({ id }).first();
// };








// import db from "../../connection";
// import bcrypt from "bcrypt";

// // ----------------------------
// // Create first admin
// // ----------------------------
// export const createFirstAdminDb = async (data: any) => {
//   const hashedPassword = await bcrypt.hash(data.password, 10);
//   const [id] = await db("users").insert({
//     ...data,
//     password: hashedPassword,
//     role: "admin",
//   });
//   const user = await db("users").where({ id }).first();
//   return user;
// };

// // ----------------------------
// // Login user
// // ----------------------------
// export const loginUserDb = async (email: string, password: string) => {
//   const user = await db("users").where({ email }).first();
//   if (!user) throw new Error("Invalid email or password");

//   const validPassword = await bcrypt.compare(password, user.password);
//   if (!validPassword) throw new Error("Invalid email or password");

//   if (user.status !== "active") throw new Error("User is inactive");

//   return user;
// };

// // ----------------------------
// // Get current user
// // ----------------------------
// export const getMeDb = async (id: number) => {
//   return db("users").where({ id }).first();
// };

// // ----------------------------
// // Create new user
// // ----------------------------
// export const createUserDb = async (data: any) => {
//   // Generate a random temporary password
//   const tempPassword = Math.random().toString(36).slice(-8);
//   const hashedPassword = await bcrypt.hash(tempPassword, 10);

//   // Resolve role name
//   if (data.roleId) {
//     const roleRow = await db("roles").where({ id: Number(data.roleId) }).first();
//     if (roleRow) data.role = roleRow.role;
//   }

//   if (!data.status) data.status = "active";
//   if (data.imagePath) data.profileImage = data.imagePath;

//   const insertData: any = {
//     firstName: data.firstName,
//     lastName: data.lastName,
//     email: data.email,
//     phone: data.phone || null,
//     status: data.status,
//     role: data.role || null,
//     profileImage: data.profileImage || null,
//     password: hashedPassword,
//   };

//   const [id] = await db("users").insert(insertData);

//   const user = await db("users").where({ id }).first();

//   // Include tempPassword so controller can send in email
//   return { ...user, tempPassword };
// };

// // ----------------------------
// // Update user
// // ----------------------------
// export const updateUserDb = async (id: string | number, data: any) => {
//   if (data.roleId) {
//     const roleRow = await db("roles").where({ id: Number(data.roleId) }).first();
//     if (roleRow) data.role = roleRow.role;
//   }
//   if (data.imagePath) data.profileImage = data.imagePath;

//   await db("users").where({ id: Number(id) }).update({ ...data, updatedAt: db.fn.now() });
//   return db("users").where({ id: Number(id) }).first();
// };

// // ----------------------------
// // Update user status
// // ----------------------------
// export const updateUserStatusDb = async (id: string | number, status: string) => {
//   await db("users").where({ id: Number(id) }).update({ status, updatedAt: db.fn.now() });
//   return db("users").where({ id: Number(id) }).first();
// };

// // ----------------------------
// // Get all users
// // ----------------------------
// export const getAllUsersDb = async (search?: string, column?: string) => {
//   let query = db("users").select("*").orderBy("id", "asc");

//   if (search && column) {
//     if (column === "status") {
//       query = query.where(column, search.toLowerCase());
//     } else {
//       query = query.where(column, "like", `%${search}%`);
//     }
//   }

//   return query;
// };

// // ----------------------------
// // Get user by ID
// // ----------------------------
// export const getUserByIdDb = async (id: string | number) => {
//   return db("users").where({ id: Number(id) }).first();
// };









// import db from "../../connection";
// import bcrypt from "bcrypt";
// import { sendMail } from "../utils/mailer";

// // ----------------------------
// // Create first admin
// // ----------------------------
// export const createFirstAdminDb = async (data: any) => {
//   const hashedPassword = await bcrypt.hash(data.password, 10);
//   const [id] = await db("users").insert({
//     ...data,
//     password: hashedPassword,
//     role: "admin",
//     roleId: null,
//     status: "active",
//   });
//   return db("users").where({ id }).first();
// };

// // ----------------------------
// // Get all users
// // ----------------------------
// export const getAllUsersDb = async (search?: string, column?: string) => {
//   let query = db("users")
//     .leftJoin("roles", "users.roleId", "roles.id")
//     .select(
//       "users.id",
//       "users.firstName",
//       "users.lastName",
//       "users.email",
//       "users.phone",
//       "roles.role as role",
//       "users.status",
//       "users.profileImage",
//       "users.createdAt"
//     )
//     .orderBy("users.createdAt", "desc");

//   if (search && column) {
//     if (column === "status") {
//       query = query.where(`users.${column}`, search.toLowerCase());
//     } else {
//       query = query.where(`users.${column}`, "like", `%${search}%`);
//     }
//   }

//   return query;
// };

// // ----------------------------
// // Get user by ID
// // ----------------------------
// export const getUserByIdDb = async (id: string | number) => {
//   return db("users")
//     .leftJoin("roles", "users.roleId", "roles.id")
//     .select(
//       "users.id",
//       "users.firstName",
//       "users.lastName",
//       "users.email",
//       "users.phone",
//       "roles.role as role",
//       "users.status",
//       "users.profileImage"
//     )
//     .where("users.id", Number(id))
//     .first();
// };

// // ----------------------------
// // Create new user
// // ----------------------------
// export const createUserDb = async (data: any) => {
//   // Generate random password if not provided
//   const passwordPlain = data.password || Math.random().toString(36).slice(-8);
//   const hashedPassword = await bcrypt.hash(passwordPlain, 10);

//   // Resolve role
//   let role = null;
//   if (data.roleId) {
//     const roleRow = await db("roles").where({ id: Number(data.roleId) }).first();
//     if (roleRow) role = roleRow.role;
//   }

//   // Default status
//   const status = data.status || "active";

//   // Image handling
//   const profileImage = data.imagePath || null;

//   // Insert user
//   const insertData: any = {
//     firstName: data.firstName,
//     lastName: data.lastName,
//     email: data.email,
//     phone: data.phone || null,
//     password: hashedPassword,
//     role,
//     roleId: data.roleId ? Number(data.roleId) : null,
//     status,
//     profileImage,
//   };

//   const [id] = await db("users").insert(insertData);

//   // Optionally, send welcome email
//   const subject = "Your Account Has Been Created";
//   const html = `
//     <h3>Hello ${data.firstName},</h3>
//     <p>Your account has been successfully created.</p>
//     <p><strong>Email:</strong> ${data.email}</p>
//     <p><strong>Temporary Password:</strong> ${passwordPlain}</p>
//     <a href="http://localhost:5173/login">Login Now</a>
//   `;
//   await sendMail(data.email, subject, subject, html);

//   return db("users").where({ id }).first();
// };

// // ----------------------------
// // Update user
// // ----------------------------
// export const updateUserDb = async (id: string | number, data: any) => {
//   if (data.roleId) {
//     const roleRow = await db("roles").where({ id: Number(data.roleId) }).first();
//     if (roleRow) data.role = roleRow.role;
//   }

//   if (data.imagePath) data.profileImage = data.imagePath;

//   await db("users").where({ id: Number(id) }).update({ ...data, updatedAt: db.fn.now() });
//   return db("users").where({ id: Number(id) }).first();
// };

// // ----------------------------
// // Update user status
// // ----------------------------
// export const updateUserStatusDb = async (id: string | number, status: string) => {
//   await db("users").where({ id: Number(id) }).update({ status, updatedAt: db.fn.now() });
//   return db("users").where({ id: Number(id) }).first();
// };

// // ----------------------------
// // Login user
// // ----------------------------
// export const loginUserDb = async (email: string, password: string) => {
//   const user = await db("users").where({ email }).first();
//   if (!user) throw new Error("Invalid email or password");

//   const validPassword = await bcrypt.compare(password, user.password);
//   if (!validPassword) throw new Error("Invalid email or password");

//   return user;
// };

// // ----------------------------
// // Get current user
// // ----------------------------
// export const getMeDb = async (id: number) => {
//   return db("users").where({ id }).first();
// };








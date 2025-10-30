import db from "../../connection";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

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
// Fast user count service
// ----------------------------
export const getUsersCountService = async (): Promise<number> => {
  const result = await db("users").count<{ total: number }>("id as total");
  // knex returns array like [{ total: '123' }] depending on DB driver
  const total = result?.[0]?.total ?? 0;
  return Number(total);
};

export const getAllUsersService = async (
  search?: string,
  column?: string,
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder: "asc" | "desc" = "desc",
  includeCount: boolean = true
) => {
  const offset = (page - 1) * limit;

  const ALLOWED_SORTS: Record<string, string> = {
    id: "users.id",
    firstName: "users.firstName",
    lastName: "users.lastName",
    email: "users.email",
    phone: "users.phone",
    role: "roles.role",
    createdAt: "users.createdAt",
  };

  const sortColumn = sortBy && ALLOWED_SORTS[sortBy] ? ALLOWED_SORTS[sortBy] : "users.createdAt";
  const order = sortOrder === "asc" ? "asc" : "desc";

  // Base query builder (for rows)
  const rowsQuery = db("users")
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
    .modify((qb) => {
      if (search && column) {
        // allow searching on status as exact match
        const searchCol = column === "role" ? "roles.role" : `users.${column}`;
        if (column === "status") {
          qb.where(searchCol, search.toLowerCase());
        } else {
          qb.where(searchCol, "like", `%${search}%`);
        }
      }
    })
    .orderBy(sortColumn, order)
    .limit(limit)
    .offset(offset);

  // If count requested, build countQuery with same filters
  let countResult: any = null;
  if (includeCount) {
    const countQuery = db("users")
      .modify((qb) => {
        if (search && column) {
          const searchCol = column === "role" ? "roles.role" : `users.${column}`;
          if (column === "status") {
            qb.where(searchCol, search.toLowerCase());
          } else {
            qb.where(searchCol, "like", `%${search}%`);
          }
        }
      })
      .count<{ total: number }>("id as total");

    // run both queries in parallel
    const [usersResult, cnt] = await Promise.all([rowsQuery, countQuery]);
    countResult = cnt;
    const users = usersResult || [];
    const total = Number(countResult?.[0]?.total ?? 0);
    // at least 1 page for consistent UI even if total is 0
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      users,
      total,
      totalPages,
      currentPage: page,
      includeCount,
    };
  } else {
    // count not requested: only run rowsQuery
    const users = await rowsQuery;
    // when count not included, signal with -1 so frontend can handle gracefully
    return {
      users,
      total: -1,
      totalPages: -1,
      currentPage: page,
      includeCount,
    };
  }
};


// ----------------------------
// Export All Users Service (CSV data source)
// ----------------------------
export const exportUsersCSVService = async () => {
  // Fetch all users from DB with role info
  const users = await db("users")
    .leftJoin("roles", "users.roleId", "roles.id")
    .select(
      "users.id",
      "users.firstName",
      "users.lastName",
      "users.email",
      "users.phone",
      "roles.role as role",
      "users.status"
    )
    .orderBy("users.id", "asc");

  // Format headers and rows for CSV export
  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Role",
    "Status",
  ];

  const rows = users.map((u) => [
    u.id,
    u.firstName,
    u.lastName,
    u.email,
    u.phone || "-",
    u.role || "",
    u.status,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  // Return as plain string (controller will handle sending file + headers)
  return {
    csvContent,
    users, // optional, in case you need count or logging
  };
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

  // if (data.imagePath) data.profileImage = data.imagePath;
  if (data.imagePath) {
  data.profileImage = data.imagePath;   
}


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

  // 🔹 Fetch role info
  const role = user.roleId
    ? await db("roles").where({ id: user.roleId }).first()
    : null;

  // 🔹 Fetch permissions for the role
  let permissions: string[] = [];
  if (role) {
    const rolePermissions = await db("role_permissions")
      .join("permissions", "role_permissions.permissionId", "permissions.id")
      .where("role_permissions.roleId", user.roleId)
      .select("permissions.name");
    permissions = rolePermissions.map((p) => p.name);
  }

  // 🔹 Merge all into one object
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: role ? role.role : user.role,
    roleId: user.roleId,
    status: user.status,
    permissions, // ✅ Added here
  };
};

// fixing as shwoing access denied after refresh
export const getMeService = async (id: number) => {
  // 1) Get user basic info
  const user = await db("users")
    .where("users.id", id)
    .first();

  if (!user) return null;

  // 2) Get role name
  let roleName = user.role;
  if (user.roleId) {
    const roleRow = await db("roles").where({ id: user.roleId }).first();
    if (roleRow) roleName = roleRow.role;
  }

  // 3) Get permissions based on role
  let permissions: string[] = [];
  if (user.roleId) {
    const rolePermissions = await db("role_permissions")
      .join("permissions", "role_permissions.permissionId", "permissions.id")
      .where("role_permissions.roleId", user.roleId)
      .select("permissions.name");

    permissions = rolePermissions.map((p) => p.name);
  }

  // 4) Return final user object
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: roleName,
    roleId: user.roleId,
    status: user.status,
    permissions,
    profileImage: user.profileImage,
  };
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




import db from "../../connection";
// bcrypt is a pashword hashing library, used to hash pass before saving to db.
import bcrypt from "bcrypt";
// node js core module, to handle file and directory path.
import path from "path";
// node js core module for file system to read write files.
import fs from "fs";

// ----------------------------
// Create First Admin
// ----------------------------
export const createFirstAdminService = async (data: any) => {
  // hashes pass using salt round 10 times,like user pass is accessed as data.pass like it is Tani123, then after hash it like of7QF4.OGJfYvq
  const hashedPassword = await bcrypt.hash(data.password, 10);
  // inserting admin record to users table.
  const [id] = await db("users").insert({
    // spread operator to copy all properties from data
    ...data,
    password: hashedPassword,
    role: "admin",
    roleId: null,
    status: "active",
  });
// SELECT * FROM users WHERE id=? LIMIT 1, only 1st user.
  return db("users").where({ id }).first();
};

// ----------------------------
// Fast user count service
// ----------------------------
export const getUsersCountService = async (): Promise<number> => {
  // like as user table has 123 record then total 123.
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
  // if page 1, offset-0, page 2 offset 10,page 3 offset 20, offset used to skip record.
  const offset = (page - 1) * limit;
// only these cols are allowed for soting.
  const ALLOWED_SORTS: Record<string, string> = {
    id: "users.id",
    firstName: "users.firstName",
    lastName: "users.lastName",
    email: "users.email",
    phone: "users.phone",
    role: "roles.role",
    createdAt: "users.createdAt",
  };
// if frontend sends value of sort by use it, else by createdAt, and in desc order by default.
  const sortColumn = sortBy && ALLOWED_SORTS[sortBy] ? ALLOWED_SORTS[sortBy] : "users.createdAt";
  const order = sortOrder === "asc" ? "asc" : "desc";

  // SELECT users.id, users.firstName, users.lastName, users.email, ... FROM users LEFT JOIN roles ON users.roleId = roles id

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
        // allow searching on status as exact match, like we say where user.email LIKE %tani%
        const searchCol = column === "role" ? "roles.role" : `users.${column}`;
        if (column === "status") {
          qb.where(searchCol, search.toLowerCase());
        } else {
          qb.where(searchCol, "like", `%${search}%`);
        }
      }
    })
    // how to show like order by the searched col, and ordr like asc, desc 
    .orderBy(sortColumn, order)
    .limit(limit)
    .offset(offset);

  // like we are getting, SELECT COUNT(id) AS total FROM users WHERE email LIKE '%tanisha%'
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

    // run both queries in parallel, for speed here rawquery gets actual user data, and cntquery get total no of users that matchs, promise all wait for all to complete.
    const [usersResult, cnt] = await Promise.all([rowsQuery, countQuery]);
    countResult = cnt;
    const users = usersResult || [];
    //convert total into numbers, and if no total than place 0
    const total = Number(countResult?.[0]?.total ?? 0);
    // ike if total 45 users, and limit is 10, then ceil 45/10 = 5 pages, max 1 ensure even if there is 0 user return atleast 1 page.
    const totalPages = Math.max(1, Math.ceil(total / limit));
// if we have cnt, then we show these
    return {
      users,
      total,
      totalPages,
      currentPage: page,
      includeCount,
    };
    // if not, show these, -1 is for signal that, total cnt was not calculated
  } else {
    const users = await rowsQuery;
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
    // data to show in csv file
    u.id,
    u.firstName,
    u.lastName,
    u.email,
    // if no number, then show -,like 2,Simran,Kaur,simran@ex.com,-,hr,active
    u.phone || "-",
    u.role || "",
    u.status,
  ]);
// format data as "ID,First Name,Last Name,Email,Phone,Role,Status"
  const csvContent = [
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  // Return as plain string (controller will handle sending file + headers)
  return {
    csvContent,
    users, 
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
  if (existing) throw new Error(`User with email ${data.email} already exists`);
// Math.random genereate random nos b/w 0 and 1, then convert to base 36, means with 0-9 digits and a-z letters, slice(-8) means take the last 8 character, this is the temp pass, to send to user.
  const tempPassword = Math.random().toString(36).slice(-8);
  // and store it as hashed in DB 
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
// like as we assign a rifole id, like if role id=2, it map to admin, so rol as admin
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
    // with logged in user we must have to pass the permissions.
    permissions, 
  };
};


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


export const deleteUserService = async (id: number | string) => {
  const userId = Number(id);
  if (isNaN(userId)) {
    console.log("Invalid user ID provided to service:", id);
    return null;
  }

  const user = await db("users").where({ id: userId }).first();
  if (!user) {
    console.log("User not found in DB for ID:", userId);
    return null;
  }

  // Remove profile image if exists
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




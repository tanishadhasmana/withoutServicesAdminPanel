import db from "../../connection";

const ALLOWED_SORT_COLUMNS = new Set([
  "id",
  "key",
  "title",
  "createdAt",
  "updatedAt",
]);

// ----------------------------
// Get CMS List (with pagination & filters)
// ----------------------------
// export const getCmsListService = async (
//   filters: any = {},
//   page: number = 1,
//   limit: number = 10
// ) => {
//   const offset = (page - 1) * limit;

//   // Base query
//   let query = db("cms")
//     .whereNull("deletedAt")
//     .orderBy("id", "desc");

//   // Apply filters
//   if (filters.id) query = query.where("id", filters.id);
//   if (filters.key) query = query.where("key", "like", `%${filters.key}%`);
//   if (filters.title) query = query.where("title", "like", `%${filters.title}%`);
//   if (filters.status) query = query.where("status", filters.status);

//   // Total count query (for pagination)
//   const totalRow = await db("cms")
//     .whereNull("deletedAt")
//     .modify((qb) => {
//       if (filters.id) qb.where("id", filters.id);
//       if (filters.key) qb.where("key", "like", `%${filters.key}%`);
//       if (filters.title) qb.where("title", "like", `%${filters.title}%`);
//       if (filters.status) qb.where("status", filters.status);
//     })
//     .count({ count: "id" })
//     .first();

//   const total = Number(totalRow?.count ?? 0);
//   const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

//   // ✅ Adjust the current page if it's beyond the last page
//   const currentPage = page > totalPages ? totalPages : page;
//   const adjustedOffset = (currentPage - 1) * limit;

//   // Fetch paginated records
//   const cms = await query.limit(limit).offset(adjustedOffset);

//   // Return unified response
//   return { cms, total, totalPages, currentPage };
// };

export const getCmsListService = async (
  filters: any = {},
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  order?: "asc" | "desc"
) => {
  const offset = (page - 1) * limit;

  // Validate sort column & order
  let sortColumn = "id";
  let sortOrder: "asc" | "desc" = "desc";
  if (sortBy && ALLOWED_SORT_COLUMNS.has(sortBy)) {
    sortColumn = sortBy;
    if (order && (order === "asc" || order === "desc")) sortOrder = order;
  }

  // If attempted to sort by status, ignore (same as other pages)
  if (sortBy === "status") {
    sortColumn = "id";
    sortOrder = "desc";
  }

  // Base query with sorting
  let query = db("cms").whereNull("deletedAt").orderBy(sortColumn, sortOrder);

  // Apply filters
  if (filters.id) query = query.where("id", filters.id);
  if (filters.key) query = query.where("key", "like", `%${filters.key}%`);
  if (filters.title) query = query.where("title", "like", `%${filters.title}%`);
  if (filters.status) query = query.where("status", filters.status);

  // Total count (same filters)
  const totalRow = await db("cms")
    .whereNull("deletedAt")
    .modify((qb) => {
      if (filters.id) qb.where("id", filters.id);
      if (filters.key) qb.where("key", "like", `%${filters.key}%`);
      if (filters.title) qb.where("title", "like", `%${filters.title}%`);
      if (filters.status) qb.where("status", filters.status);
    })
    .count({ count: "id" })
    .first();

  const total = Number(totalRow?.count ?? 0);
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  // Adjust page if beyond last
  const currentPage = page > totalPages ? totalPages : page;
  const adjustedOffset = (currentPage - 1) * limit;

  // Fetch paginated records
  const cms = await query.limit(limit).offset(adjustedOffset);

  return { cms, total, totalPages, currentPage };
};

// ----------------------------
// Get CMS by ID
// ----------------------------
export const getCmsByIdService = async (id: number) => {
  return db("cms").where({ id }).whereNull("deletedAt").first();
};

// ----------------------------
// Create CMS
// ----------------------------
export const createCmsService = async (data: any) => {
  const [id] = await db("cms").insert(data);
  return db("cms").where({ id }).first();
};

// ----------------------------
// Update CMS
// ----------------------------
export const updateCmsService = async (id: number, data: any) => {
  await db("cms").where({ id }).update({ ...data, updatedAt: db.fn.now() });
  return db("cms").where({ id }).first();
};

// ----------------------------
// Delete CMS (soft delete)
// ----------------------------
export const deleteCmsService = async (id: number, updatedBy?: number | null) => {
  await db("cms").where({ id }).update({
    deletedAt: db.fn.now(),
    status: "inactive",
    updatedBy: updatedBy || null,
  });
  return { message: "CMS deleted (soft)" };
};








// import db from "../../connection";

// // for pagination and filters
// export const getCmsListDb = async (queryParams: any) => {
//   const { id, key, title, status, page = 1, limit = 10 } = queryParams;

//   let query = db("cms")
//     .select("*")
//     .whereNull("deletedAt");

//   if (id) query.andWhere("id", id);
//   if (key) query.andWhere("key", "like", `%${key}%`);
//   if (title) query.andWhere("title", "like", `%${title}%`);
//   if (status) query.andWhere("status", status);

//   // Count total
//   const totalQuery = query.clone();
//   const [{ count }] = await totalQuery.count({ count: "*" });

//   // Pagination logic
//   const offset = (Number(page) - 1) * Number(limit);
//   const rows = await query
//     .orderBy("id", "desc")
//     .limit(Number(limit))
//     .offset(offset);

//   return {
//     cms: rows,
//     totalPages: Math.ceil(Number(count) / Number(limit)) || 1,
//     currentPage: Number(page),
//   };
// };

// export const getCmsByIdDb = async (id: string) => {
  
//   return db("cms").where({ id }).first();
// };

// export const createCmsDb = async (data: any) => {
//   const [id] = await db("cms").insert(data);
//   return db("cms").where({ id }).first();

// };

// export const updateCmsDb = async (id: string, data: any) => {
//   await db("cms").where({ id }).update({ ...data, updatedAt: db.fn.now() });
//   return db("cms").where({ id }).first();
// };

// export const deleteCmsDb = async (id: string, updatedBy?: number | null) => {
//   return db("cms").where({ id }).update({
//     deletedAt: db.fn.now(),
//     status: "inactive",
//     updatedBy: updatedBy || null,
//   });
// };


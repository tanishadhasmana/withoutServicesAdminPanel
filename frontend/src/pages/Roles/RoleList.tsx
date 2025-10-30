// src/pages/Roles/RoleList.tsx
import React, { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import {
  getRoles,
  deleteRole,
  toggleRoleStatus,
} from "../../services/roleService";
import type { Role } from "../../types/Role";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert";

import Pagination from "../../components/common/Pagination";

type RoleSearchKey = "id" | "role" | "description" | "status";

const RoleList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchValues, setSearchValues] = useState<{
    id: string;
    role: string;
    description: string;
    status: "" | "active" | "inactive";
  }>({
    id: "",
    role: "",
    description: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const nav = useNavigate();

  // Sorting state: sortBy undefined means no sorting (NONE).
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load roles (pagination + filters + sorting)
  const loadRoles = useCallback(
    async (
      filterColumn?: RoleSearchKey,
      filterValue?: string,
      page: number = 1,
      newLimit: number = limit,
      sb?: string | undefined,
      so?: "asc" | "desc" | undefined
    ) => {
      try {
        setLoading(true);
        const data = await getRoles(
          filterColumn,
          filterValue,
          page,
          newLimit,
          sb ?? sortBy,
          so ?? sortOrder
        );
        // api returns { roles, total, totalPages, currentPage }
        setRoles(data.roles);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
        toast.error("Failed to load roles");
      } finally {
        setLoading(false);
      }
    },
    [limit, sortBy, sortOrder]
  );

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     const key = (Object.keys(searchValues).find(
  //       (k) => searchValues[k as RoleSearchKey]
  //     ) as RoleSearchKey | undefined) ?? undefined;

  //     if (key && searchValues[key]) {
  //       loadRoles(key, searchValues[key], 1, limit);
  //     }
  //   }, 500);

  //   return () => clearTimeout(timeout);
  // }, [searchValues, limit, loadRoles]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const key =
        (Object.keys(searchValues).find(
          (k) => searchValues[k as RoleSearchKey]
        ) as RoleSearchKey | undefined) ?? undefined;

      // If a filter key exists and has a non-empty value -> apply filter
      if (key && searchValues[key]) {
        loadRoles(key, searchValues[key], 1, limit);
      } else {
        // No filter value -> reset to full, first page
        loadRoles(undefined, undefined, 1, limit);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchValues, limit, loadRoles]);

  // initial load
  useEffect(() => {
    loadRoles(undefined, undefined, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sorting handler with cycle: ASC -> DESC -> NONE
  const handleSort = (columnKey: string) => {
    if (sortBy !== columnKey) {
      // new column: set ASC
      setSortBy(columnKey);
      setSortOrder("asc");
      loadRoles(undefined, undefined, 1, limit, columnKey, "asc");
      return;
    }

    // same column clicked again
    if (sortOrder === "asc") {
      // go to desc
      setSortOrder("desc");
      loadRoles(undefined, undefined, 1, limit, columnKey, "desc");
      return;
    }

    if (sortOrder === "desc") {
      // reset to NONE
      setSortBy(undefined);
      setSortOrder("desc"); // keep default order in state when re-enabling sort later
      loadRoles(undefined, undefined, 1, limit, undefined, undefined);
      return;
    }
  };

  // Delete role (soft delete via API)
  // const handleDelete = async (id: number) => {
  //   if (!window.confirm("Are you sure you want to delete this role?")) return;
  //   try {
  //     await deleteRole(id);
  //     setRoles((prev) => prev.filter((r) => r.id !== id));
  //     toast.success("Role deleted successfully");
  //   } catch (err) {
  //     console.error("Delete failed:", err);
  //     toast.error("Failed to delete role");
  //   }
  // };

  const handleDeleteConfirmed = async (id: number, onClose: () => void) => {
    try {
      await deleteRole(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      toast.success("Role deleted successfully");
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete role");
      onClose();
    }
  };

  const confirmDelete = (id: number) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
              Are you sure you want to delete this role?
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirmed(id, onClose)}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  // Toggle role status active/inactive
  const handleToggle = async (
    id: number,
    currentStatus: "active" | "inactive"
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await toggleRoleStatus(id, newStatus);
      setRoles((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast.success(
        newStatus === "active"
          ? "Role marked as active"
          : "Role marked as inactive"
      );
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status");
    }
  };

  // UI helper: render arrows (always visible neutral ▲▼ when not active)
  const SortArrow = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return (
        <span className="inline-block ml-2 opacity-50 select-none cursor-pointer" aria-hidden>
          ▲▼
        </span>
      );
    }
    return sortOrder === "asc" ? (
      <span className="inline-block ml-2 select-none">▲</span>
    ) : (
      <span className="inline-block ml-2 select-none">▼</span>
    );
  };

  return (
    <div>
      <PageHeader
        title="Roles"
        right={
          <div className="flex gap-2">
            {/* Export CSV */}
            <button
              onClick={() => {
                if (!roles.length) {
                  toast.error("No roles to export");
                  return;
                }

                const headers = ["ID", "Role", "Description", "Status"];
                const csvRows = [
                  headers.join(","),
                  ...roles.map((r) =>
                    [
                      r.id,
                      `"${r.role}"`,
                      `"${r.description ?? "-"}"`,
                      `"${r.status}"`,
                    ].join(",")
                  ),
                ];

                const blob = new Blob([csvRows.join("\n")], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "roles_export.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success("CSV exported successfully");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
            >
              Export CSV
            </button>

            {/* Add Role */}
            <button
              onClick={() => nav("/roles/add")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
            >
              Add Role
            </button>
          </div>
        }
      />

      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading roles...</div>
        ) : (
          <>
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">
                    <button
                      className="flex items-center"
                      onClick={() => handleSort("id")}
                      aria-label="Sort by ID"
                    >
                      ID <SortArrow column="id" />
                    </button>
                  </th>

                  <th className="p-3 text-left">
                    <button
                      className="flex items-center"
                      onClick={() => handleSort("role")}
                      aria-label="Sort by Role"
                    >
                      Role <SortArrow column="role" />
                    </button>
                  </th>

                  <th className="p-3 text-left">
                    <button
                      className="flex items-center"
                      onClick={() => handleSort("description")}
                      aria-label="Sort by Description"
                    >
                      Description <SortArrow column="description" />
                    </button>
                  </th>

                  {/* Status - no sorting UI for status */}
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>

                {/* Search inputs row */}
                <tr className="border-t bg-gray-100">
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search ID"
                      className="border p-1 text-sm rounded w-full"
                      value={searchValues.id}
                      onChange={(e) =>
                        setSearchValues({
                          id: e.target.value.replace(/\D/g, ""),
                          role: "",
                          description: "",
                          status: "",
                        })
                      }
                    />
                  </th>

                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Role"
                      className="border p-1 text-sm rounded w-full"
                      value={searchValues.role}
                      onChange={(e) =>
                        setSearchValues((prev) => ({
                          ...prev,
                          id: "",
                          role: e.target.value.replace(/^\s+/, ""),
                        }))
                      }
                    />
                  </th>

                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Description"
                      className="border p-1 text-sm rounded w-full"
                      value={searchValues.description}
                      onChange={(e) =>
                        setSearchValues((prev) => ({
                          ...prev,
                          id: "",
                          description: e.target.value.replace(/^\s+/, ""),
                        }))
                      }
                    />
                  </th>

                  <th className="p-2">
                    <select
                      className="border p-1 text-sm rounded w-full"
                      value={searchValues.status}
                      onChange={(e) =>
                        setSearchValues((prev) => ({
                          ...prev,
                          id: "",
                          status: e.target.value as "" | "active" | "inactive",
                        }))
                      }
                    >
                      <option value="">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center p-4 text-gray-500 italic"
                    >
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  roles.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{r.id}</td>
                      <td className="p-3">{r.role}</td>
                      <td className="p-3">{r.description ?? "-"}</td>

                      <td className="p-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={r.status === "active"}
                            onChange={() => handleToggle(r.id, r.status)}
                            className="sr-only peer"
                          />
                          <div
                            className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer
                            peer-checked:bg-green-500
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                            after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full"
                          />
                        </label>
                      </td>

                      <td className="p-3 text-center space-x-3">
                        <button
                          onClick={() => nav(`/roles/edit/${r.id}`)}
                          className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                          title="Edit Role"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(r.id)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          title="Delete Role"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex justify-end items-center py-4 pr-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) =>
                  loadRoles(
                    undefined,
                    undefined,
                    page,
                    limit,
                    sortBy,
                    sortOrder
                  )
                }
                limit={limit}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  loadRoles(
                    undefined,
                    undefined,
                    1,
                    newLimit,
                    sortBy,
                    sortOrder
                  );
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleList;

// // src/pages/Roles/RoleList.tsx
// import React, { useCallback, useEffect, useState } from "react";
// import PageHeader from "../../components/layout/PageHeader";
// import {
//   getRoles,
//   deleteRole,
//   toggleRoleStatus,
// } from "../../services/roleService";
// import type { Role } from "../../types/Role";
// import { useNavigate } from "react-router-dom";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Pagination from "../../components/common/Pagination";

// type RoleSearchKey = "id" | "role" | "description" | "status";

// const RoleList: React.FC = () => {
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [searchValues, setSearchValues] = useState<{
//     id: string;
//     role: string;
//     description: string;
//     status: "" | "active" | "inactive";
//   }>({
//     id: "",
//     role: "",
//     description: "",
//     status: "",
//   });

//   const [loading, setLoading] = useState(true);
//   const [totalPages, setTotalPages] = useState(1);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const nav = useNavigate();

//   // Sorting state: sortBy undefined means no sorting (NONE).
//   const [sortBy, setSortBy] = useState<string | undefined>(undefined);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

//   // Load roles (pagination + filters + sorting)
//   const loadRoles = useCallback(
//     async (
//       filterColumn?: RoleSearchKey,
//       filterValue?: string,
//       page: number = 1,
//       newLimit: number = limit,
//       sb?: string | undefined,
//       so?: "asc" | "desc" | undefined
//     ) => {
//       try {
//         setLoading(true);
//         const data = await getRoles(
//           filterColumn,
//           filterValue,
//           page,
//           newLimit,
//           sb ?? sortBy,
//           so ?? sortOrder
//         );
//         // api returns { roles, total, totalPages, currentPage }
//         setRoles(data.roles);
//         setCurrentPage(data.currentPage);
//         setTotalPages(data.totalPages);
//       } catch (err) {
//         console.error("Failed to fetch roles:", err);
//         toast.error("Failed to load roles");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [limit, sortBy, sortOrder]
//   );

//   // Debounced search filter--- changed
//   // useEffect(() => {
//   //   const timeout = setTimeout(() => {
//   //     const key = (Object.keys(searchValues).find(
//   //       (k) => searchValues[k as RoleSearchKey]
//   //     ) as RoleSearchKey | undefined) ?? undefined;

//   //     if (key && searchValues[key]) {
//   //       loadRoles(key, searchValues[key], 1, limit);
//   //     } else {
//   //       // reset to first page
//   //       loadRoles(undefined, undefined, 1, limit);
//   //     }
//   //   }, 500);

//   //   return () => clearTimeout(timeout);
//   // }, [searchValues, limit, loadRoles]);
// useEffect(() => {
//   const timeout = setTimeout(() => {
//     const key = (Object.keys(searchValues).find(
//       (k) => searchValues[k as RoleSearchKey]
//     ) as RoleSearchKey | undefined) ?? undefined;

//     if (key && searchValues[key]) {
//       loadRoles(key, searchValues[key], 1, limit);
//     }
//   }, 500);

//   return () => clearTimeout(timeout);
// }, [searchValues, limit, loadRoles]);

//   // initial load
//   useEffect(() => {
//     loadRoles(undefined, undefined, 1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Sorting handler with cycle: ASC -> DESC -> NONE
//   const handleSort = (columnKey: string) => {
//     if (sortBy !== columnKey) {
//       // new column: set ASC
//       setSortBy(columnKey);
//       setSortOrder("asc");
//       loadRoles(undefined, undefined, 1, limit, columnKey, "asc");
//       return;
//     }

//     // same column clicked again
//     if (sortOrder === "asc") {
//       // go to desc
//       setSortOrder("desc");
//       loadRoles(undefined, undefined, 1, limit, columnKey, "desc");
//       return;
//     }

//     if (sortOrder === "desc") {
//       // reset to NONE
//       setSortBy(undefined);
//       setSortOrder("desc"); // keep default order in state when re-enabling sort later
//       loadRoles(undefined, undefined, 1, limit, undefined, undefined);
//       return;
//     }
//   };

//   // Delete role (soft delete via API)
//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this role?")) return;
//     try {
//       await deleteRole(id);
//       setRoles((prev) => prev.filter((r) => r.id !== id));
//       toast.success("Role deleted successfully");
//     } catch (err) {
//       console.error("Delete failed:", err);
//       toast.error("Failed to delete role");
//     }
//   };

//   // Toggle role status active/inactive
//   const handleToggle = async (id: number, currentStatus: "active" | "inactive") => {
//     const newStatus = currentStatus === "active" ? "inactive" : "active";
//     try {
//       await toggleRoleStatus(id, newStatus);
//       setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
//       toast.success(newStatus === "active" ? "Role marked as active" : "Role marked as inactive");
//     } catch (err) {
//       console.error("Status update failed:", err);
//       toast.error("Failed to update status");
//     }
//   };

//   // UI helper: render arrows (always visible neutral ▲▼ when not active)
//   const SortArrow = ({ column }: { column: string }) => {
//     if (sortBy !== column) {
//       return (
//         <span className="inline-block ml-2 opacity-50 select-none" aria-hidden>
//           ▲▼
//         </span>
//       );
//     }
//     return sortOrder === "asc" ? (
//       <span className="inline-block ml-2 select-none">▲</span>
//     ) : (
//       <span className="inline-block ml-2 select-none">▼</span>
//     );
//   };

//   return (
//     <div>
//       <PageHeader
//         title="Roles"
//         right={
//           <div className="flex gap-2">
//             {/* Export CSV */}
//             <button
//               onClick={() => {
//                 if (!roles.length) {
//                   toast.error("No roles to export");
//                   return;
//                 }

//                 const headers = ["ID", "Role", "Description", "Status"];
//                 const csvRows = [
//                   headers.join(","),
//                   ...roles.map((r) =>
//                     [
//                       r.id,
//                       `"${r.role}"`,
//                       `"${r.description ?? "-"}"`,
//                       `"${r.status}"`,
//                     ].join(",")
//                   ),
//                 ];

//                 const blob = new Blob([csvRows.join("\n")], {
//                   type: "text/csv;charset=utf-8;",
//                 });
//                 const url = window.URL.createObjectURL(blob);

//                 const link = document.createElement("a");
//                 link.href = url;
//                 link.setAttribute("download", "roles_export.csv");
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);

//                 toast.success("CSV exported successfully");
//               }}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
//             >
//               Export CSV
//             </button>

//             {/* Add Role */}
//             <button
//               onClick={() => nav("/roles/add")}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
//             >
//               Add Role
//             </button>
//           </div>
//         }
//       />

//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="text-center py-6 text-gray-500">Loading roles...</div>
//         ) : (
//           <>
//             <table className="min-w-full border text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="p-3 text-left">
//                     <button
//                       className="flex items-center"
//                       onClick={() => handleSort("id")}
//                       aria-label="Sort by ID"
//                     >
//                       ID <SortArrow column="id" />
//                     </button>
//                   </th>

//                   <th className="p-3 text-left">
//                     <button
//                       className="flex items-center"
//                       onClick={() => handleSort("role")}
//                       aria-label="Sort by Role"
//                     >
//                       Role <SortArrow column="role" />
//                     </button>
//                   </th>

//                   <th className="p-3 text-left">
//                     <button
//                       className="flex items-center"
//                       onClick={() => handleSort("description")}
//                       aria-label="Sort by Description"
//                     >
//                       Description <SortArrow column="description" />
//                     </button>
//                   </th>

//                   {/* Status - no sorting UI for status */}
//                   <th className="p-3 text-left">Status</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>

//                 {/* Search inputs row */}
//                 <tr className="border-t bg-gray-100">
//                   <th className="p-2">
//                     <input
//                       type="text"
//                       placeholder="Search ID"
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.id}
//                       onChange={(e) =>
//                         setSearchValues({
//                           id: e.target.value.replace(/\D/g, ""),
//                           role: "",
//                           description: "",
//                           status: "",
//                         })
//                       }
//                     />
//                   </th>

//                   <th className="p-2">
//                     <input
//                       type="text"
//                       placeholder="Search Role"
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.role}
//                       onChange={(e) =>
//                         setSearchValues((prev) => ({ ...prev, id: "", role: e.target.value.replace(/^\s+/, "") }))
//                       }
//                     />
//                   </th>

//                   <th className="p-2">
//                     <input
//                       type="text"
//                       placeholder="Search Description"
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.description}
//                       onChange={(e) =>
//                         setSearchValues((prev) => ({ ...prev, id: "", description: e.target.value.replace(/^\s+/, "") }))
//                       }
//                     />
//                   </th>

//                   <th className="p-2">
//                     <select
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.status}
//                       onChange={(e) =>
//                         setSearchValues((prev) => ({ ...prev, id: "", status: e.target.value as "" | "active" | "inactive" }))
//                       }
//                     >
//                       <option value="">All</option>
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </th>
//                   <th></th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {roles.length === 0 ? (
//                   <tr>
//                     <td colSpan={5} className="text-center p-4 text-gray-500 italic">
//                       No roles found.
//                     </td>
//                   </tr>
//                 ) : (
//                   roles.map((r) => (
//                     <tr key={r.id} className="border-t hover:bg-gray-50">
//                       <td className="p-3">{r.id}</td>
//                       <td className="p-3">{r.role}</td>
//                       <td className="p-3">{r.description ?? "-"}</td>

//                       <td className="p-3">
//                         <label className="relative inline-flex items-center cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={r.status === "active"}
//                             onChange={() => handleToggle(r.id, r.status)}
//                             className="sr-only peer"
//                           />
//                           <div
//                             className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer
//                             peer-checked:bg-green-500
//                             after:content-[''] after:absolute after:top-[2px] after:left-[2px]
//                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
//                             peer-checked:after:translate-x-full"
//                           />
//                         </label>
//                       </td>

//                       <td className="p-3 text-center space-x-3">
//                         <button
//                           onClick={() => nav(`/roles/edit/${r.id}`)}
//                           className="text-yellow-600 hover:text-yellow-800"
//                           title="Edit Role"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(r.id)}
//                           className="text-red-600 hover:text-red-800"
//                           title="Delete Role"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>

//             <div className="flex justify-end items-center py-4 pr-4">
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={(page) => loadRoles(undefined, undefined, page, limit, sortBy, sortOrder)}
//                 limit={limit}
//                 onLimitChange={(newLimit) => {
//                   setLimit(newLimit);
//                   loadRoles(undefined, undefined, 1, newLimit, sortBy, sortOrder);
//                 }}
//               />
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RoleList;

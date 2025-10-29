// src/pages/Users/UserList.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  getUsers,
  deleteUser,
  toggleUserStatus,
} from "../../services/userService";
import type { User } from "../../types/User";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import { Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Pagination from "../../components/common/Pagination";
import { RingLoader } from "react-spinners";
import { confirmAlert } from "react-confirm-alert";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const nav = useNavigate();

  const [searchValues, setSearchValues] = useState({
    id: "",
    firstName: "",
    email: "",
    phone: "",
    role: "",
    status: "",
  });

  // sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Flags to prevent duplicate calls
  const didInit = React.useRef(false);
  const didMountSearch = React.useRef(false);
  const skipNextSearch = React.useRef(false); // <-- new: skip search effect after pagination/limit change

  // Load users (pagination + optional filters + sorting)
  const loadUsers = useCallback(
    async (
      filterColumn?: string,
      filterValue?: string,
      page: number = 1,
      newLimit: number = limit,
      sb?: string,
      so?: "asc" | "desc"
    ) => {
      try {
        setLoading(true);
        const data = await getUsers(
          filterValue,
          filterColumn,
          page,
          newLimit,
          sb ?? sortBy,
          so ?? sortOrder
        );
        setUsers(data.users);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [limit, sortBy, sortOrder]
  );

  // Debounced search filter (skip first render and optionally skip next if pagination triggered)
  useEffect(() => {
    if (!didMountSearch.current) {
      didMountSearch.current = true;
      return; // skip on first render so initial load (didInit) happens alone
    }

    if (skipNextSearch.current) {
      // pagination/limit change explicitly requested loadUsers — skip the debounced follow-up
      skipNextSearch.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      const column = Object.keys(searchValues).find(
        (key) => searchValues[key as keyof typeof searchValues]
      );

      if (column) {
        const value = searchValues[column as keyof typeof searchValues];
        loadUsers(column, value, 1);
      } else {
        loadUsers(undefined, undefined, 1);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchValues, loadUsers]);

  // sorting handler
  const handleSort = (columnKey: string) => {
    // toggle order if same column clicked again; otherwise set asc by default
    let newOrder: "asc" | "desc" = "asc";
    if (sortBy === columnKey) {
      newOrder = sortOrder === "asc" ? "desc" : "asc";
    }
    setSortBy(columnKey);
    setSortOrder(newOrder);

    // re-fetch first page with new sort (we decided not to suppress search after sort)
    loadUsers(undefined, undefined, 1, limit, columnKey, newOrder);
  };

  // actual deletion logic (keeps same messaging)
  const handleDeleteConfirmed = async (id: number, onClose?: () => void) => {
    try {
      await deleteUser(id);
      setUsers((prev: User[]) => prev.filter((user: User) => user.id !== id));
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete user");
    } finally {
      // close modal if provided
      if (onClose) onClose();
    }
  };

  const confirmDelete = (id: number) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Are you sure you want to delete this user?</h3>
            <p className="text-gray-600 mb-6 text-center">This action cannot be undone.</p>
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

  // Toggle user active/inactive
  const handleToggle = async (
    id: number,
    currentStatus: "active" | "inactive"
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await toggleUserStatus(id, newStatus);
      setUsers((prev: User[]) =>
        prev.map((u: User) => (u.id === id ? { ...u, status: newStatus } : u))
      );

      toast.success(
        newStatus === "active" ? "User marked as active" : "User marked as inactive"
      );
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status");
    }
  };

  // initial load (strict-mode safe)
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    loadUsers(undefined, undefined, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI helper to render arrow
  const SortArrow = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      // show neutral small arrows (you can style further)
      return (
        <span className="inline-block ml-2 opacity-50 select-none" aria-hidden>
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
        title="Users"
        right={
          <div className="flex gap-2">
            {/* Export CSV */}
            <button
              onClick={() => {
                if (!users.length) {
                  toast.error("No users to export");
                  return;
                }

                const headers = [
                  "ID",
                  "First Name",
                  "Last Name",
                  "Email",
                  "Phone",
                  "Role",
                  "Status",
                ];
                const csvRows = [
                  headers.join(","),
                  ...users.map((u) =>
                    [
                      u.id,
                      `"${u.firstName}"`,
                      `"${u.lastName}"`,
                      `"${u.email}"`,
                      `"${u.phone || "-"}"`,
                      `"${u.role}"`,
                      `"${u.status}"`,
                    ].join(",")
                  ),
                ];

                const blob = new Blob([csvRows.join("\n")], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "users_export.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success("CSV exported successfully");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
            >
              Export CSV
            </button>

            {/* Add User */}
            <button
              onClick={() => nav("/users/add")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
            >
              Add User
            </button>
          </div>
        }
      />

      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="min-h-[500px] flex justify-center items-center">
            <RingLoader size={80} />
          </div>
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
                      onClick={() => handleSort("firstName")}
                      aria-label="Sort by Name"
                    >
                      Name <SortArrow column="firstName" />
                    </button>
                  </th>

                  <th className="p-3 text-left">
                    <button
                      className="flex items-center"
                      onClick={() => handleSort("email")}
                      aria-label="Sort by Email"
                    >
                      Email <SortArrow column="email" />
                    </button>
                  </th>

                  <th className="p-3 text-left">
                    <button
                      className="flex items-center"
                      onClick={() => handleSort("phone")}
                      aria-label="Sort by Phone"
                    >
                      Phone <SortArrow column="phone" />
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

                  {/* Status - NO sorting UI here (you asked it remain without sorting) */}
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>

                {/* Search inputs row (unchanged) */}
                <tr className="border-t">
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search ID"
                      className="border p-1 text-sm rounded w-full"
                      value={searchValues.id}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // digits only
                        setSearchValues({
                          id: value,
                          firstName: "",
                          email: "",
                          phone: "",
                          role: "",
                          status: "",
                        });
                      }}
                    />
                  </th>

                  {["firstName", "email", "phone", "role"].map((key) => (
                    <th key={key} className="p-2">
                      <input
                        type="text"
                        placeholder={`Search ${key}`}
                        className="border p-1 text-sm rounded w-full"
                        value={searchValues[key as keyof typeof searchValues]}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue.trimStart() === "" && inputValue !== "")
                            return;
                          setSearchValues((prev) => ({
                            ...prev,
                            id: "",
                            firstName:
                              key === "firstName" ? inputValue.trimStart() : "",
                            email:
                              key === "email" ? inputValue.trimStart() : "",
                            phone:
                              key === "phone" ? inputValue.trimStart() : "",
                            role: key === "role" ? inputValue.trimStart() : "",
                            status: "",
                          }));
                        }}
                      />
                    </th>
                  ))}

                  <th className="p-2">
                    <select
                      className="border p-1 text-sm rounded w-full"
                      value={searchValues.status}
                      onChange={(e) =>
                        setSearchValues({
                          id: "",
                          firstName: "",
                          email: "",
                          phone: "",
                          role: "",
                          status: e.target.value.trim().toLowerCase(),
                        })
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
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center p-4 text-gray-500 italic"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u: User) => (
                    <tr key={u.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{u.id}</td>
                      <td className="p-3">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.phone || "-"}</td>
                      <td className="p-3 capitalize">{u.role}</td>

                      <td className="p-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={u.status === "active"}
                            onChange={() => handleToggle(u.id, u.status)}
                            className="sr-only peer"
                          />
                          <div
                            className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer
                            peer-checked:bg-green-500
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                            after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                            peer-checked:after:translate-x-full"
                          ></div>
                        </label>
                      </td>

                      <td className="p-3 text-center space-x-3">
                        <button
                          onClick={() => nav(`/users/edit/${u.id}`)}
                          className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                          title="Edit User"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(u.id)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          title="Delete User"
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
                onPageChange={(page) => {
                  // mark skip so search effect won't fire again after pagination-triggered load
                  skipNextSearch.current = true;
                  loadUsers(undefined, undefined, page, limit, sortBy, sortOrder);
                }}
                limit={limit}
                onLimitChange={(newLimit) => {
                  skipNextSearch.current = true;
                  setLimit(newLimit);
                  loadUsers(undefined, undefined, 1, newLimit, sortBy, sortOrder);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;








// src/pages/Users/UserList.tsx
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   getUsers,
//   deleteUser,
//   toggleUserStatus,
// } from "../../services/userService";
// import type { User } from "../../types/User";
// import { useNavigate } from "react-router-dom";
// import PageHeader from "../../components/layout/PageHeader";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Pagination from "../../components/common/Pagination";
// import { RingLoader } from "react-spinners";
// import { confirmAlert } from "react-confirm-alert";

// const UserList: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [limit, setLimit] = useState(10);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const nav = useNavigate();

//   const [searchValues, setSearchValues] = useState({
//     id: "",
//     firstName: "",
//     email: "",
//     phone: "",
//     role: "",
//     status: "",
//   });

//   // sorting state
//   const [sortBy, setSortBy] = useState<string | undefined>(undefined);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

//   // Load users (pagination + optional filters + sorting)
//   const loadUsers = useCallback(
//     async (
//       filterColumn?: string,
//       filterValue?: string,
//       page: number = 1,
//       newLimit: number = limit,
//       sb?: string,
//       so?: "asc" | "desc"
//     ) => {
//       try {
//         setLoading(true);
//         const data = await getUsers(
//           filterValue,
//           filterColumn,
//           page,
//           newLimit,
//           sb ?? sortBy,
//           so ?? sortOrder
//         );
//         setUsers(data.users);
//         setCurrentPage(data.currentPage);
//         setTotalPages(data.totalPages);
//       } catch (err) {
//         console.error("Failed to fetch users:", err);
//         toast.error("Failed to load users");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [limit, sortBy, sortOrder]
//   );

//   const didMountSearch = React.useRef(false);
// useEffect(() => {
//   if (!didMountSearch.current) {
//     didMountSearch.current = true;
//     return; // ← skip first render so only initial load runs
//   }

//   const timeout = setTimeout(() => {
//     const column = Object.keys(searchValues).find(
//       (key) => searchValues[key as keyof typeof searchValues]
//     );

//     if (column) {
//       const value = searchValues[column as keyof typeof searchValues];
//       loadUsers(column, value, 1);
//     } else {
//       loadUsers(undefined, undefined, 1);
//     }
//   }, 500);

//   return () => clearTimeout(timeout);
// }, [searchValues, loadUsers]);



//   // sorting handler
//   const handleSort = (columnKey: string) => {
//     // toggle order if same column clicked again; otherwise set asc by default
//     let newOrder: "asc" | "desc" = "asc";
//     if (sortBy === columnKey) {
//       newOrder = sortOrder === "asc" ? "desc" : "asc";
//     }
//     setSortBy(columnKey);
//     setSortOrder(newOrder);

//     // re-fetch first page with new sort
//     loadUsers(undefined, undefined, 1, limit, columnKey, newOrder);
//   };

//   // actual deletion logic (keeps same messaging)
//   const handleDeleteConfirmed = async (id: number, onClose?: () => void) => {
//     try {
//       await deleteUser(id);
//       setUsers((prev: User[]) => prev.filter((user: User) => user.id !== id));
//       toast.success("User deleted successfully");
//     } catch (err) {
//       console.error("Delete failed:", err);
//       toast.error("Failed to delete user");
//     } finally {
//       // close modal if provided
//       if (onClose) onClose();
//     }
//   };


//   const confirmDelete = (id: number) => {
// confirmAlert({
// customUI: ({ onClose }) => (
// <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
// <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn">
// <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Are you sure you want to delete this user?</h3>
// <p className="text-gray-600 mb-6 text-center">This action cannot be undone.</p>
// <div className="flex justify-center gap-4">
// <button
// onClick={onClose}
// className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
// >
// Cancel
// </button>
// <button
// onClick={() => handleDeleteConfirmed(id, onClose)}
// className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
// >
// Delete
// </button>
// </div>
// </div>
// </div>
// ),
// });
// };


//   // Toggle user active/inactive
//   const handleToggle = async (
//     id: number,
//     currentStatus: "active" | "inactive"
//   ) => {
//     const newStatus = currentStatus === "active" ? "inactive" : "active";
//     try {
//       await toggleUserStatus(id, newStatus);
//       setUsers((prev: User[]) =>
//         prev.map((u: User) => (u.id === id ? { ...u, status: newStatus } : u))
//       );

//       toast.success(
//         newStatus === "active" ? "User marked as active" : "User marked as inactive"
//       );
//     } catch (err) {
//       console.error("Status update failed:", err);
//       toast.error("Failed to update status");
//     }
//   };

//   // initial load (strict-mode safe)
//   const didInit = React.useRef(false);
//   useEffect(() => {
//     if (didInit.current) return;
//     didInit.current = true;
//     loadUsers(undefined, undefined, 1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // UI helper to render arrow
//   const SortArrow = ({ column }: { column: string }) => {
//     if (sortBy !== column) {
//       // show neutral small arrows (you can style further)
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
//         title="Users"
//         right={
//           <div className="flex gap-2">
//             {/* Export CSV */}
//             <button
//               onClick={() => {
//                 if (!users.length) {
//                   toast.error("No users to export");
//                   return;
//                 }

//                 const headers = [
//                   "ID",
//                   "First Name",
//                   "Last Name",
//                   "Email",
//                   "Phone",
//                   "Role",
//                   "Status",
//                 ];
//                 const csvRows = [
//                   headers.join(","),
//                   ...users.map((u) =>
//                     [
//                       u.id,
//                       `"${u.firstName}"`,
//                       `"${u.lastName}"`,
//                       `"${u.email}"`,
//                       `"${u.phone || "-"}"`,
//                       `"${u.role}"`,
//                       `"${u.status}"`,
//                     ].join(",")
//                   ),
//                 ];

//                 const blob = new Blob([csvRows.join("\n")], {
//                   type: "text/csv;charset=utf-8;",
//                 });
//                 const url = window.URL.createObjectURL(blob);

//                 const link = document.createElement("a");
//                 link.href = url;
//                 link.setAttribute("download", "users_export.csv");
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);

//                 toast.success("CSV exported successfully");
//               }}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
//             >
//               Export CSV
//             </button>

//             {/* Add User */}
//             <button
//               onClick={() => nav("/users/add")}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
//             >
//               Add User
//             </button>
//           </div>
//         }
//       />

//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="min-h-[500px] flex justify-center items-center">
//             <RingLoader size={80} />
//           </div>
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
//                       onClick={() => handleSort("firstName")}
//                       aria-label="Sort by Name"
//                     >
//                       Name <SortArrow column="firstName" />
//                     </button>
//                   </th>

//                   <th className="p-3 text-left">
//                     <button
//                       className="flex items-center"
//                       onClick={() => handleSort("email")}
//                       aria-label="Sort by Email"
//                     >
//                       Email <SortArrow column="email" />
//                     </button>
//                   </th>

//                   <th className="p-3 text-left">
//                     <button
//                       className="flex items-center"
//                       onClick={() => handleSort("phone")}
//                       aria-label="Sort by Phone"
//                     >
//                       Phone <SortArrow column="phone" />
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

//                   {/* Status - NO sorting UI here (you asked it remain without sorting) */}
//                   <th className="p-3 text-left">Status</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>

//                 {/* Search inputs row (unchanged) */}
//                 <tr className="border-t">
//                   <th className="p-2">
//                     <input
//                       type="text"
//                       placeholder="Search ID"
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.id}
//                       onChange={(e) => {
//                         const value = e.target.value.replace(/\D/g, ""); // digits only
//                         setSearchValues({
//                           id: value,
//                           firstName: "",
//                           email: "",
//                           phone: "",
//                           role: "",
//                           status: "",
//                         });
//                       }}
//                     />
//                   </th>

//                   {["firstName", "email", "phone", "role"].map((key) => (
//                     <th key={key} className="p-2">
//                       <input
//                         type="text"
//                         placeholder={`Search ${key}`}
//                         className="border p-1 text-sm rounded w-full"
//                         value={searchValues[key as keyof typeof searchValues]}
//                         onChange={(e) => {
//                           const inputValue = e.target.value;
//                           if (inputValue.trimStart() === "" && inputValue !== "")
//                             return;
//                           setSearchValues((prev) => ({
//                             ...prev,
//                             id: "",
//                             firstName:
//                               key === "firstName" ? inputValue.trimStart() : "",
//                             email:
//                               key === "email" ? inputValue.trimStart() : "",
//                             phone:
//                               key === "phone" ? inputValue.trimStart() : "",
//                             role: key === "role" ? inputValue.trimStart() : "",
//                             status: "",
//                           }));
//                         }}
//                       />
//                     </th>
//                   ))}

//                   <th className="p-2">
//                     <select
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.status}
//                       onChange={(e) =>
//                         setSearchValues({
//                           id: "",
//                           firstName: "",
//                           email: "",
//                           phone: "",
//                           role: "",
//                           status: e.target.value.trim().toLowerCase(),
//                         })
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
//                 {users.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={7}
//                       className="text-center p-4 text-gray-500 italic"
//                     >
//                       No users found.
//                     </td>
//                   </tr>
//                 ) : (
//                   users.map((u: User) => (
//                     <tr key={u.id} className="border-t hover:bg-gray-50">
//                       <td className="p-3">{u.id}</td>
//                       <td className="p-3">
//                         {u.firstName} {u.lastName}
//                       </td>
//                       <td className="p-3">{u.email}</td>
//                       <td className="p-3">{u.phone || "-"}</td>
//                       <td className="p-3 capitalize">{u.role}</td>

//                       <td className="p-3">
//                         <label className="relative inline-flex items-center cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={u.status === "active"}
//                             onChange={() => handleToggle(u.id, u.status)}
//                             className="sr-only peer"
//                           />
//                           <div
//                             className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer
//                             peer-checked:bg-green-500
//                             after:content-[''] after:absolute after:top-[2px] after:left-[2px]
//                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
//                             peer-checked:after:translate-x-full"
//                           ></div>
//                         </label>
//                       </td>

//                       <td className="p-3 text-center space-x-3">
//                         <button
//                           onClick={() => nav(`/users/edit/${u.id}`)}
//                           className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
//                           title="Edit User"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => confirmDelete(u.id)}
//                           className="text-red-600 hover:text-red-800 cursor-pointer"
//                           title="Delete User"
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
//                 onPageChange={(page) =>
//                   loadUsers(undefined, undefined, page, limit, sortBy, sortOrder)
//                 }
//                 limit={limit}
//                 onLimitChange={(newLimit) => {
//                   setLimit(newLimit);
//                   loadUsers(undefined, undefined, 1, newLimit, sortBy, sortOrder);
//                 }}
//               />
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserList;









// src/pages/Users/UserList.tsx
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   getUsers,
//   deleteUser,
//   toggleUserStatus,
// } from "../../services/userService";
// import type { User } from "../../types/User";
// import { useNavigate } from "react-router-dom";
// import PageHeader from "../../components/layout/PageHeader";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Pagination from "../../components/common/Pagination";
// import { RingLoader } from "react-spinners";

// const UserList: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [limit, setLimit] = useState(10);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const nav = useNavigate();

//   const [searchValues, setSearchValues] = useState({
//     id: "",
//     firstName: "",
//     email: "",
//     phone: "",
//     role: "",
//     status: "",
//   });

//   // sorting state
//   const [sortBy, setSortBy] = useState<string | undefined>(undefined);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

//   // Load users (pagination + optional filters + sorting)
//   const loadUsers = useCallback(
//     async (
//       filterColumn?: string,
//       filterValue?: string,
//       page: number = 1,
//       newLimit: number = limit,
//       sb?: string,
//       so?: "asc" | "desc"
//     ) => {
//       try {
//         setLoading(true);
//         const data = await getUsers(
//           filterValue,
//           filterColumn,
//           page,
//           newLimit,
//           sb ?? sortBy,
//           so ?? sortOrder
//         );
//         setUsers(data.users);
//         setCurrentPage(data.currentPage);
//         setTotalPages(data.totalPages);
//       } catch (err) {
//         console.error("Failed to fetch users:", err);
//         toast.error("Failed to load users");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [limit, sortBy, sortOrder]
//   );

//   // Debounced search filter (unchanged)
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       const column = Object.keys(searchValues).find(
//         (key) => searchValues[key as keyof typeof searchValues]
//       );

//       if (column) {
//         const value = searchValues[column as keyof typeof searchValues];
//         // when applying a search filter, reset to first page
//         loadUsers(column, value, 1);
//       } else {
//         loadUsers(undefined, undefined, 1);
//       }
//     }, 500);

//     return () => clearTimeout(timeout);
//   }, [searchValues, loadUsers]);

//   // sorting handler
//   const handleSort = (columnKey: string) => {
//     // toggle order if same column clicked again; otherwise set asc by default
//     let newOrder: "asc" | "desc" = "asc";
//     if (sortBy === columnKey) {
//       newOrder = sortOrder === "asc" ? "desc" : "asc";
//     }
//     setSortBy(columnKey);
//     setSortOrder(newOrder);

//     // re-fetch first page with new sort
//     loadUsers(undefined, undefined, 1, limit, columnKey, newOrder);
//   };

//   // Delete user
//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this user?")) return;
//     try {
//       await deleteUser(id);
//       setUsers((prev: User[]) => prev.filter((user: User) => user.id !== id));
//       toast.success("User deleted successfully");
//     } catch (err) {
//       console.error("Delete failed:", err);
//       toast.error("Failed to delete user");
//     }
//   };

//   // Toggle user active/inactive
//   const handleToggle = async (
//     id: number,
//     currentStatus: "active" | "inactive"
//   ) => {
//     const newStatus = currentStatus === "active" ? "inactive" : "active";
//     try {
//       await toggleUserStatus(id, newStatus);
//       setUsers((prev: User[]) =>
//         prev.map((u: User) => (u.id === id ? { ...u, status: newStatus } : u))
//       );

//       toast.success(
//         newStatus === "active" ? "User marked as active" : "User marked as inactive"
//       );
//     } catch (err) {
//       console.error("Status update failed:", err);
//       toast.error("Failed to update status");
//     }
//   };

//   // // initial load (preserve existing behavior)
//   // useEffect(() => {
//   //   loadUsers(undefined, undefined, 1);
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, []);

// // initial load (strict-mode safe)
// const didInit = React.useRef(false);
// useEffect(() => {
//   if (didInit.current) return;
//   didInit.current = true;
//   loadUsers(undefined, undefined, 1);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, []);
  

//   // UI helper to render arrow
//   const SortArrow = ({ column }: { column: string }) => {
//     if (sortBy !== column) {
//       // show neutral small arrows (you can style further)
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
//         title="Users"
//         right={
//           <div className="flex gap-2">
//             {/* Export CSV */}
//             <button
//               onClick={() => {
//                 if (!users.length) {
//                   toast.error("No users to export");
//                   return;
//                 }

//                 const headers = [
//                   "ID",
//                   "First Name",
//                   "Last Name",
//                   "Email",
//                   "Phone",
//                   "Role",
//                   "Status",
//                 ];
//                 const csvRows = [
//                   headers.join(","),
//                   ...users.map((u) =>
//                     [
//                       u.id,
//                       `"${u.firstName}"`,
//                       `"${u.lastName}"`,
//                       `"${u.email}"`,
//                       `"${u.phone || "-"}"`,
//                       `"${u.role}"`,
//                       `"${u.status}"`,
//                     ].join(",")
//                   ),
//                 ];

//                 const blob = new Blob([csvRows.join("\n")], {
//                   type: "text/csv;charset=utf-8;",
//                 });
//                 const url = window.URL.createObjectURL(blob);

//                 const link = document.createElement("a");
//                 link.href = url;
//                 link.setAttribute("download", "users_export.csv");
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);

//                 toast.success("CSV exported successfully");
//               }}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
//             >
//               Export CSV
//             </button>

//             {/* Add User */}
//             <button
//               onClick={() => nav("/users/add")}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
//             >
//               Add User
//             </button>
//           </div>
//         }
//       />

//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="min-h-[500px] flex justify-center items-center">
//             <RingLoader size={80} />
//           </div>
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
//                       onClick={() => handleSort("firstName")}
//                       aria-label="Sort by Name"
//                     >
//                       Name <SortArrow column="firstName" />
//                     </button>
//                   </th>

//                   <th className="p-3 text-left">
//                     <button
//                       className="flex items-center"
//                       onClick={() => handleSort("email")}
//                       aria-label="Sort by Email"
//                     >
//                       Email <SortArrow column="email" />
//                     </button>
//                   </th>

//                   <th className="p-3 text-left">
//                     <button
//                       className="flex items-center"
//                       onClick={() => handleSort("phone")}
//                       aria-label="Sort by Phone"
//                     >
//                       Phone <SortArrow column="phone" />
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

//                   {/* Status - NO sorting UI here (you asked it remain without sorting) */}
//                   <th className="p-3 text-left">Status</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>

//                 {/* Search inputs row (unchanged) */}
//                 <tr className="border-t">
//                   <th className="p-2">
//                     <input
//                       type="text"
//                       placeholder="Search ID"
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.id}
//                       onChange={(e) => {
//                         const value = e.target.value.replace(/\D/g, ""); // digits only
//                         setSearchValues({
//                           id: value,
//                           firstName: "",
//                           email: "",
//                           phone: "",
//                           role: "",
//                           status: "",
//                         });
//                       }}
//                     />
//                   </th>

//                   {["firstName", "email", "phone", "role"].map((key) => (
//                     <th key={key} className="p-2">
//                       <input
//                         type="text"
//                         placeholder={`Search ${key}`}
//                         className="border p-1 text-sm rounded w-full"
//                         value={searchValues[key as keyof typeof searchValues]}
//                         onChange={(e) => {
//                           const inputValue = e.target.value;
//                           if (inputValue.trimStart() === "" && inputValue !== "")
//                             return;
//                           setSearchValues((prev) => ({
//                             ...prev,
//                             id: "",
//                             firstName:
//                               key === "firstName" ? inputValue.trimStart() : "",
//                             email:
//                               key === "email" ? inputValue.trimStart() : "",
//                             phone:
//                               key === "phone" ? inputValue.trimStart() : "",
//                             role: key === "role" ? inputValue.trimStart() : "",
//                             status: "",
//                           }));
//                         }}
//                       />
//                     </th>
//                   ))}

//                   <th className="p-2">
//                     <select
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.status}
//                       onChange={(e) =>
//                         setSearchValues({
//                           id: "",
//                           firstName: "",
//                           email: "",
//                           phone: "",
//                           role: "",
//                           status: e.target.value.trim().toLowerCase(),
//                         })
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
//                 {users.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={7}
//                       className="text-center p-4 text-gray-500 italic"
//                     >
//                       No users found.
//                     </td>
//                   </tr>
//                 ) : (
//                   users.map((u: User) => (
//                     <tr key={u.id} className="border-t hover:bg-gray-50">
//                       <td className="p-3">{u.id}</td>
//                       <td className="p-3">
//                         {u.firstName} {u.lastName}
//                       </td>
//                       <td className="p-3">{u.email}</td>
//                       <td className="p-3">{u.phone || "-"}</td>
//                       <td className="p-3 capitalize">{u.role}</td>

//                       <td className="p-3">
//                         <label className="relative inline-flex items-center cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={u.status === "active"}
//                             onChange={() => handleToggle(u.id, u.status)}
//                             className="sr-only peer"
//                           />
//                           <div
//                             className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer
//                             peer-checked:bg-green-500
//                             after:content-[''] after:absolute after:top-[2px] after:left-[2px]
//                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
//                             peer-checked:after:translate-x-full"
//                           ></div>
//                         </label>
//                       </td>

//                       <td className="p-3 text-center space-x-3">
//                         <button
//                           onClick={() => nav(`/users/edit/${u.id}`)}
//                           className="text-yellow-600 hover:text-yellow-800"
//                           title="Edit User"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(u.id)}
//                           className="text-red-600 hover:text-red-800"
//                           title="Delete User"
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
//                 onPageChange={(page) =>
//                   loadUsers(undefined, undefined, page, limit, sortBy, sortOrder)
//                 }
//                 limit={limit}
//                 onLimitChange={(newLimit) => {
//                   setLimit(newLimit);
//                   loadUsers(undefined, undefined, 1, newLimit, sortBy, sortOrder);
//                 }}
//               />
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserList;









// src/pages/Users/UserList.tsx
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   getUsers,
//   deleteUser,
//   toggleUserStatus,
// } from "../../services/userService";
// import type { User } from "../../types/User";
// import { useNavigate } from "react-router-dom";
// import PageHeader from "../../components/layout/PageHeader";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Pagination from "../../components/common/Pagination";

// const UserList: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [limit, setLimit] = useState(10);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const nav = useNavigate();

//   const [searchValues, setSearchValues] = useState({
//     id: "",
//     firstName: "",
//     email: "",
//     phone: "",
//     role: "",
//     status: "",
//   });

//   // sorting state
//   const [sortBy, setSortBy] = useState<string | undefined>(undefined);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

//   // Load users (pagination + optional filters + sorting)
//   const loadUsers = useCallback(
//     async (
//       filterColumn?: string,
//       filterValue?: string,
//       page: number = 1,
//       newLimit: number = limit,
//       sb?: string,
//       so?: "asc" | "desc"
//     ) => {
//       try {
//         setLoading(true);
//         const data = await getUsers(
//           filterValue,
//           filterColumn,
//           page,
//           newLimit,
//           sb ?? sortBy,
//           so ?? sortOrder
//         );
//         setUsers(data.users);
//         setCurrentPage(data.currentPage);
//         setTotalPages(data.totalPages);
//       } catch (err) {
//         console.error("Failed to fetch users:", err);
//         toast.error("Failed to load users");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [limit, sortBy, sortOrder]
//   );

//   // Debounced search filter (unchanged)
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       const column = Object.keys(searchValues).find(
//         (key) => searchValues[key as keyof typeof searchValues]
//       );

//       if (column) {
//         const value = searchValues[column as keyof typeof searchValues];
//         // when applying a search filter, reset to first page
//         loadUsers(column, value, 1);
//       } else {
//         loadUsers(undefined, undefined, 1);
//       }
//     }, 500);

//     return () => clearTimeout(timeout);
//   }, [searchValues, loadUsers]);

//   // sorting handler
//   const handleSort = (columnKey: string) => {
//     // toggle order if same column clicked again; otherwise set asc by default
//     let newOrder: "asc" | "desc" = "asc";
//     if (sortBy === columnKey) {
//       newOrder = sortOrder === "asc" ? "desc" : "asc";
//     }
//     setSortBy(columnKey);
//     setSortOrder(newOrder);

//     // re-fetch first page with new sort
//     loadUsers(undefined, undefined, 1, limit, columnKey, newOrder);
//   };

//   // Delete user
//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this user?")) return;
//     try {
//       await deleteUser(id);
//       setUsers((prev: User[]) => prev.filter((user: User) => user.id !== id));
//       toast.success("User deleted successfully");
//     } catch (err) {
//       console.error("Delete failed:", err);
//       toast.error("Failed to delete user");
//     }
//   };

//   // Toggle user active/inactive
//   const handleToggle = async (
//     id: number,
//     currentStatus: "active" | "inactive"
//   ) => {
//     const newStatus = currentStatus === "active" ? "inactive" : "active";
//     try {
//       await toggleUserStatus(id, newStatus);
//       setUsers((prev: User[]) =>
//         prev.map((u: User) => (u.id === id ? { ...u, status: newStatus } : u))
//       );

//       toast.success(
//         newStatus === "active" ? "User marked as active" : "User marked as inactive"
//       );
//     } catch (err) {
//       console.error("Status update failed:", err);
//       toast.error("Failed to update status");
//     }
//   };

//   // initial load (preserve existing behavior)
//   useEffect(() => {
//     loadUsers(undefined, undefined, 1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // UI helper to render arrow
//   const SortArrow = ({ column }: { column: string }) => {
//     if (sortBy !== column) {
//       // show neutral small arrows (you can style further)
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
//         title="Users"
//         right={
//           <div className="flex gap-2">
//             {/* Export CSV */}
//             <button
//               onClick={() => {
//                 if (!users.length) {
//                   toast.error("No users to export");
//                   return;
//                 }

//                 const headers = [
//                   "ID",
//                   "First Name",
//                   "Last Name",
//                   "Email",
//                   "Phone",
//                   "Role",
//                   "Status",
//                 ];
//                 const csvRows = [
//                   headers.join(","),
//                   ...users.map((u) =>
//                     [
//                       u.id,
//                       `"${u.firstName}"`,
//                       `"${u.lastName}"`,
//                       `"${u.email}"`,
//                       `"${u.phone || "-"}"`,
//                       `"${u.role}"`,
//                       `"${u.status}"`,
//                     ].join(",")
//                   ),
//                 ];

//                 const blob = new Blob([csvRows.join("\n")], {
//                   type: "text/csv;charset=utf-8;",
//                 });
//                 const url = window.URL.createObjectURL(blob);

//                 const link = document.createElement("a");
//                 link.href = url;
//                 link.setAttribute("download", "users_export.csv");
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);

//                 toast.success("CSV exported successfully");
//               }}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
//             >
//               Export CSV
//             </button>

//             {/* Add User */}
//             <button
//               onClick={() => nav("/users/add")}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
//             >
//               Add User
//             </button>
//           </div>
//         }
//       />

//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="text-center py-6 text-gray-500">Loading users...</div>
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
//                       onClick={() => handleSort("firstName")}
//                       aria-label="Sort by Name"
//                     >
//                       Name <SortArrow column="firstName" />
//                     </button>
//                   </th>

//                   <th className="p-3 text-left">
//                     <button
//                       className="flex items-center"
//                       onClick={() => handleSort("email")}
//                       aria-label="Sort by Email"
//                     >
//                       Email <SortArrow column="email" />
//                     </button>
//                   </th>

//                   <th className="p-3 text-left">
//                     <button
//                       className="flex items-center"
//                       onClick={() => handleSort("phone")}
//                       aria-label="Sort by Phone"
//                     >
//                       Phone <SortArrow column="phone" />
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

//                   {/* Status - NO sorting UI here (you asked it remain without sorting) */}
//                   <th className="p-3 text-left">Status</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>

//                 {/* Search inputs row (unchanged) */}
//                 <tr className="border-t">
//                   <th className="p-2">
//                     <input
//                       type="text"
//                       placeholder="Search ID"
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.id}
//                       onChange={(e) => {
//                         const value = e.target.value.replace(/\D/g, ""); // digits only
//                         setSearchValues({
//                           id: value,
//                           firstName: "",
//                           email: "",
//                           phone: "",
//                           role: "",
//                           status: "",
//                         });
//                       }}
//                     />
//                   </th>

//                   {["firstName", "email", "phone", "role"].map((key) => (
//                     <th key={key} className="p-2">
//                       <input
//                         type="text"
//                         placeholder={`Search ${key}`}
//                         className="border p-1 text-sm rounded w-full"
//                         value={searchValues[key as keyof typeof searchValues]}
//                         onChange={(e) => {
//                           const inputValue = e.target.value;
//                           if (inputValue.trimStart() === "" && inputValue !== "")
//                             return;
//                           setSearchValues((prev) => ({
//                             ...prev,
//                             id: "",
//                             firstName:
//                               key === "firstName" ? inputValue.trimStart() : "",
//                             email:
//                               key === "email" ? inputValue.trimStart() : "",
//                             phone:
//                               key === "phone" ? inputValue.trimStart() : "",
//                             role: key === "role" ? inputValue.trimStart() : "",
//                             status: "",
//                           }));
//                         }}
//                       />
//                     </th>
//                   ))}

//                   <th className="p-2">
//                     <select
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.status}
//                       onChange={(e) =>
//                         setSearchValues({
//                           id: "",
//                           firstName: "",
//                           email: "",
//                           phone: "",
//                           role: "",
//                           status: e.target.value.trim().toLowerCase(),
//                         })
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
//                 {users.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={7}
//                       className="text-center p-4 text-gray-500 italic"
//                     >
//                       No users found.
//                     </td>
//                   </tr>
//                 ) : (
//                   users.map((u: User) => (
//                     <tr key={u.id} className="border-t hover:bg-gray-50">
//                       <td className="p-3">{u.id}</td>
//                       <td className="p-3">
//                         {u.firstName} {u.lastName}
//                       </td>
//                       <td className="p-3">{u.email}</td>
//                       <td className="p-3">{u.phone || "-"}</td>
//                       <td className="p-3 capitalize">{u.role}</td>

//                       <td className="p-3">
//                         <label className="relative inline-flex items-center cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={u.status === "active"}
//                             onChange={() => handleToggle(u.id, u.status)}
//                             className="sr-only peer"
//                           />
//                           <div
//                             className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer
//                             peer-checked:bg-green-500
//                             after:content-[''] after:absolute after:top-[2px] after:left-[2px]
//                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
//                             peer-checked:after:translate-x-full"
//                           ></div>
//                         </label>
//                       </td>

//                       <td className="p-3 text-center space-x-3">
//                         <button
//                           onClick={() => nav(`/users/edit/${u.id}`)}
//                           className="text-yellow-600 hover:text-yellow-800"
//                           title="Edit User"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(u.id)}
//                           className="text-red-600 hover:text-red-800"
//                           title="Delete User"
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
//                 onPageChange={(page) =>
//                   loadUsers(undefined, undefined, page, limit, sortBy, sortOrder)
//                 }
//                 limit={limit}
//                 onLimitChange={(newLimit) => {
//                   setLimit(newLimit);
//                   loadUsers(undefined, undefined, 1, newLimit, sortBy, sortOrder);
//                 }}
//               />
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserList;





// import React, { useEffect, useState, useCallback } from "react";
// import {
//   getUsers,
//   deleteUser,
//   toggleUserStatus,
// } from "../../services/userService";
// import type { User } from "../../types/User";
// import { useNavigate } from "react-router-dom";
// import PageHeader from "../../components/layout/PageHeader";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Pagination from "../../components/common/Pagination";

// const UserList: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [limit, setLimit] = useState(10);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const nav = useNavigate();

//   const [searchValues, setSearchValues] = useState({
//     id: "",
//     firstName: "",
//     email: "",
//     phone: "",
//     role: "",
//     status: "",
//   });

//   // ✅ Load users (pagination + optional filters)
//   const loadUsers = useCallback(
//     async (
//       column?: string,
//       value?: string,
//       page: number = 1,
//       newLimit: number = limit
//     ) => {
//       try {
//         setLoading(true);
//         const data = await getUsers(value, column, page, newLimit);
//         setUsers(data.users);
//         setCurrentPage(data.currentPage);
//         setTotalPages(data.totalPages);
//       } catch (err) {
//         console.error("Failed to fetch users:", err);
//         toast.error("Failed to load users");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [limit]
//   );

//   // Initial load
//   // useEffect(() => {
//   //   loadUsers(undefined, undefined, 1);
//   // }, [loadUsers]);

//   // ✅ Debounced search filter
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       const column = Object.keys(searchValues).find(
//         (key) => searchValues[key as keyof typeof searchValues]
//       );

//       if (column) {
//         const value = searchValues[column as keyof typeof searchValues];
//         loadUsers(column, value, 1);
//       } else {
//         loadUsers(undefined, undefined, 1);
//       }
//     }, 500);

//     return () => clearTimeout(timeout);
//   }, [searchValues, loadUsers]);

//   // ✅ Delete user
//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this user?")) return;
//     try {
//       await deleteUser(id);
//       setUsers((prev: User[]) => prev.filter((user: User) => user.id !== id));
//       toast.success("User deleted successfully");
//     } catch (err) {
//       console.error("Delete failed:", err);
//       toast.error("Failed to delete user");
//     }
//   };

//   // ✅ Toggle user active/inactive
//   const handleToggle = async (
//     id: number,
//     currentStatus: "active" | "inactive"
//   ) => {
//     const newStatus = currentStatus === "active" ? "inactive" : "active";
//     try {
//       await toggleUserStatus(id, newStatus);
//       setUsers((prev: User[]) =>
//         prev.map((u: User) => (u.id === id ? { ...u, status: newStatus } : u))
//       );

//       if (newStatus === "active") {
//         toast.success("User marked as active ");
//       } else {
//         toast.success("User marked as inactive ");
//       }
//     } catch (err) {
//       console.error("Status update failed:", err);
//       toast.error("Failed to update status");
//     }
//   };

//   return (
//     <div>
//       <PageHeader
//         title="Users"
//         right={
//           <div className="flex gap-2">
//             {/* ✅ Export CSV Button */}
//             <button
//               onClick={() => {
//                 if (!users.length) {
//                   toast.error("No users to export");
//                   return;
//                 }

//                 // Convert user data to CSV
//                 const headers = [
//                   "ID",
//                   "First Name",
//                   "Last Name",
//                   "Email",
//                   "Phone",
//                   "Role",
//                   "Status",
//                 ];
//                 const csvRows = [
//                   headers.join(","),
//                   ...users.map((u) =>
//                     [
//                       u.id,
//                       `"${u.firstName}"`,
//                       `"${u.lastName}"`,
//                       `"${u.email}"`,
//                       `"${u.phone || "-"}"`,
//                       `"${u.role}"`,
//                       `"${u.status}"`,
//                     ].join(",")
//                   ),
//                 ];

//                 const blob = new Blob([csvRows.join("\n")], {
//                   type: "text/csv;charset=utf-8;",
//                 });
//                 const url = window.URL.createObjectURL(blob);

//                 const link = document.createElement("a");
//                 link.href = url;
//                 link.setAttribute("download", "users_export.csv");
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);

//                 toast.success("CSV exported successfully");
//               }}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
//             >
//               Export CSV
//             </button>

//             {/* ✅ Add User Button */}
//             <button
//               onClick={() => nav("/users/add")}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
//             >
//               Add User
//             </button>
//           </div>
//         }
//       />

//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="text-center py-6 text-gray-500">Loading users...</div>
//         ) : (
//           <>
//             <table className="min-w-full border text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="p-3 text-left">ID</th>
//                   <th className="p-3 text-left">Name</th>
//                   <th className="p-3 text-left">Email</th>
//                   <th className="p-3 text-left">Phone</th>
//                   <th className="p-3 text-left">Role</th>
//                   <th className="p-3 text-left">Status</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>

//                 {/* ✅ Search inputs row (added ID input) */}
//                 <tr className="border-t">
//                   {/* ✅ Search by ID */}
//                   <th className="p-2">
//                     <input
//                       type="text"
//                       placeholder="Search ID"
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.id}
//                       onChange={(e) => {
//                         const value = e.target.value.replace(/\D/g, ""); // digits only
//                         setSearchValues({
//                           id: value,
//                           firstName: "",
//                           email: "",
//                           phone: "",
//                           role: "",
//                           status: "",
//                         });
//                       }}
//                     />
//                   </th>

//                   {["firstName", "email", "phone", "role"].map((key) => (
//                     <th key={key} className="p-2">
//                       <input
//                         type="text"
//                         placeholder={`Search ${key}`}
//                         className="border p-1 text-sm rounded w-full"
//                         value={searchValues[key as keyof typeof searchValues]}
//                         onChange={(e) => {
//                           const inputValue = e.target.value;
//                           if (
//                             inputValue.trimStart() === "" &&
//                             inputValue !== ""
//                           )
//                             return;
//                           setSearchValues((prev) => ({
//                             ...prev,
//                             id: "",
//                             firstName:
//                               key === "firstName" ? inputValue.trimStart() : "",
//                             email:
//                               key === "email" ? inputValue.trimStart() : "",
//                             phone:
//                               key === "phone" ? inputValue.trimStart() : "",
//                             role: key === "role" ? inputValue.trimStart() : "",
//                             status: "",
//                           }));
//                         }}
//                       />
//                     </th>
//                   ))}

//                   <th className="p-2">
//                     <select
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues.status}
//                       onChange={(e) =>
//                         setSearchValues({
//                           id: "",
//                           firstName: "",
//                           email: "",
//                           phone: "",
//                           role: "",
//                           status: e.target.value.trim().toLowerCase(),
//                         })
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
//                 {users.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={7}
//                       className="text-center p-4 text-gray-500 italic"
//                     >
//                       No users found.
//                     </td>
//                   </tr>
//                 ) : (
//                   users.map((u: User) => (
//                     <tr key={u.id} className="border-t hover:bg-gray-50">
//                       <td className="p-3">{u.id}</td>
//                       <td className="p-3">
//                         {u.firstName} {u.lastName}
//                       </td>
//                       <td className="p-3">{u.email}</td>
//                       <td className="p-3">{u.phone || "-"}</td>
//                       <td className="p-3 capitalize">{u.role}</td>

//                       {/* ✅ Toggle status */}
//                       <td className="p-3">
//                         <label className="relative inline-flex items-center cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={u.status === "active"}
//                             onChange={() => handleToggle(u.id, u.status)}
//                             className="sr-only peer"
//                           />
//                           <div
//                             className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer
//                             peer-checked:bg-green-500
//                             after:content-[''] after:absolute after:top-[2px] after:left-[2px]
//                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
//                             peer-checked:after:translate-x-full"
//                           ></div>
//                         </label>
//                       </td>

//                       {/* ✅ Action Icons */}
//                       <td className="p-3 text-center space-x-3">
//                         <button
//                           onClick={() => nav(`/users/edit/${u.id}`)}
//                           className="text-yellow-600 hover:text-yellow-800"
//                           title="Edit User"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(u.id)}
//                           className="text-red-600 hover:text-red-800"
//                           title="Delete User"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>

//             {/* ✅ Pagination Component */}
//             <div className="flex justify-end items-center py-4 pr-4">
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={(page) => loadUsers(undefined, undefined, page)}
//                 limit={limit}
//                 onLimitChange={(newLimit) => {
//                   setLimit(newLimit);
//                   loadUsers(undefined, undefined, 1, newLimit);
//                 }}
//               />
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserList;

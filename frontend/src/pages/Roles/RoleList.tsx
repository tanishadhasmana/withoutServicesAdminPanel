import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import {
  getRoles,
  deleteRole,
  toggleRoleStatus,
} from "../../services/roleService";
import { useNavigate } from "react-router-dom";
import type { Role } from "../../types/Role";
import { Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

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
  const nav = useNavigate();

  // Load roles
  const loadRoles = async (column?: RoleSearchKey, value?: string) => {
    try {
      setLoading(true);
      const data = await getRoles(column, value);
      setRoles(data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      toast.error("Failed to load roles ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Debounce search & filter
  useEffect(() => {
    const timeout = setTimeout(() => {
      const key =
        (Object.keys(searchValues).find(
          (k) => searchValues[k as RoleSearchKey]
        ) as RoleSearchKey | undefined) ?? undefined;

      if (key && searchValues[key]) {
        loadRoles(key, searchValues[key]);
      } else {
        loadRoles();
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchValues]);

  // Toggle role status
  const handleToggle = async (id: number, currentStatus: "active" | "inactive") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await toggleRoleStatus(id, newStatus);
      setRoles((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast.success(
        newStatus === "active"
          ? "Role marked active ✅"
          : "Role marked inactive ⚪"
      );
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status ❌");
    }
  };

  // Delete role
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      await deleteRole(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      toast.success("Role deleted successfully ✅");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete role ❌");
    }
  };

  return (
    <div>
      <PageHeader
        title="Roles"
        right={
          <button
            onClick={() => nav("/roles/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Role
          </button>
        }
      />
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading roles...</div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>

              {/* Search & Filter row */}
              <tr className="border-t">
                <th className="p-2">
                  <input
                    type="text"
                    placeholder="Search ID"
                    className="border p-1 text-sm rounded w-full"
                    value={searchValues.id}
                    onChange={(e) =>
                      setSearchValues({ ...searchValues, id: e.target.value })
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
                      setSearchValues({ ...searchValues, role: e.target.value })
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
                      setSearchValues({
                        ...searchValues,
                        description: e.target.value,
                      })
                    }
                  />
                </th>
                <th className="p-2">
                  <select
                    className="border p-1 text-sm rounded w-full"
                    value={searchValues.status}
                    onChange={(e) =>
                      setSearchValues({
                        ...searchValues,
                        status: e.target.value as "active" | "inactive" | "",
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
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500 italic">
                    No roles found.
                  </td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{r.id}</td>
                    <td className="p-3">{r.role}</td>
                    <td className="p-3">{r.description || "-"}</td>
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
                        ></div>
                      </label>
                    </td>
                    <td className="p-3 text-center space-x-3">
                      <button
                        onClick={() => nav(`/roles/edit/${r.id}`)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit Role"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-600 hover:text-red-800"
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
        )}
      </div>
    </div>
  );
};

export default RoleList;





// src/pages/Roles/RoleList.tsx
// import React, { useEffect, useState } from "react";
// import PageHeader from "../../components/layout/PageHeader";
// import {
//   getRoles,
//   deleteRole,
//   toggleRoleStatus,
// } from "../../services/roleService";
// import { useNavigate } from "react-router-dom";
// import type { Role } from "../../types/Role";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// type RoleSearchKey = "id" | "role" | "description";

// const RoleList: React.FC = () => {
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [searchValues, setSearchValues] = useState<{
//     id: string;
//     role: string;
//     description: string;
//   }>({
//     id: "",
//     role: "",
//     description: "",
//   });
//   const [loading, setLoading] = useState(true);
//   const nav = useNavigate();

//   // Load roles
//   const loadRoles = async (column?: RoleSearchKey, value?: string) => {
//     try {
//       setLoading(true);
//       const data = await getRoles(column, value);
//       setRoles(data);
//     } catch (err) {
//       console.error("Failed to fetch roles:", err);
//       toast.error("Failed to load roles ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadRoles();
//   }, []);

//   // Debounce search
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       const key =
//         (Object.keys(searchValues).find(
//           (k) => searchValues[k as RoleSearchKey]
//         ) as RoleSearchKey | undefined) ?? undefined;

//       if (key) {
//         loadRoles(key, searchValues[key]);
//       } else {
//         loadRoles();
//       }
//     }, 500);

//     return () => clearTimeout(timeout);
//   }, [searchValues]);

//   // Toggle role status
//   const handleToggle = async (
//     id: number,
//     currentStatus: "active" | "inactive"
//   ) => {
//     const newStatus = currentStatus === "active" ? "inactive" : "active";
//     try {
//       await toggleRoleStatus(id, newStatus);
//       setRoles((prev) =>
//         prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
//       );
//       toast.success(
//         newStatus === "active"
//           ? "Role marked active ✅"
//           : "Role marked inactive ⚪"
//       );
//     } catch (err) {
//       console.error("Status update failed:", err);
//       toast.error("Failed to update status ❌");
//     }
//   };

//   // Delete role with confirmation
//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this role?")) return;

//     try {
//       await deleteRole(id);
//       setRoles((prev) => prev.filter((r) => r.id !== id));
//       toast.success("Role deleted successfully ✅");
//     } catch (err) {
//       console.error("Delete failed:", err);
//       toast.error("Failed to delete role ❌");
//     }
//   };

//   return (
//     <div>
//       <PageHeader
//         title="Roles"
//         right={
//           <button
//             onClick={() => nav("/roles/add")}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Add Role
//           </button>
//         }
//       />
//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="text-center py-6 text-gray-500">Loading roles...</div>
//         ) : (
//           <table className="min-w-full border text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-3 text-left">ID</th>
//                 <th className="p-3 text-left">Role</th>
//                 <th className="p-3 text-left">Description</th>
//                 <th className="p-3 text-left">Status</th>
//                 <th className="p-3 text-center">Actions</th>
//               </tr>

//               {/* ✅ Fixed search row alignment */}
//               <tr className="border-t">
//                 <th className="p-2">
//                   <input
//                     type="text"
//                     placeholder="Search ID"
//                     className="border p-1 text-sm rounded w-full"
//                     value={searchValues.id}
//                     onChange={(e) =>
//                       setSearchValues({ ...searchValues, id: e.target.value })
//                     }
//                   />
//                 </th>
//                 <th className="p-2">
//                   <input
//                     type="text"
//                     placeholder="Search Role"
//                     className="border p-1 text-sm rounded w-full"
//                     value={searchValues.role}
//                     onChange={(e) =>
//                       setSearchValues({ ...searchValues, role: e.target.value })
//                     }
//                   />
//                 </th>
//                 <th className="p-2">
//                   <input
//                     type="text"
//                     placeholder="Search Description"
//                     className="border p-1 text-sm rounded w-full"
//                     value={searchValues.description}
//                     onChange={(e) =>
//                       setSearchValues({
//                         ...searchValues,
//                         description: e.target.value,
//                       })
//                     }
//                   />
//                 </th>
//                 <th></th>
//                 <th></th>
//               </tr>
//             </thead>

//             <tbody>
//               {roles.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={5}
//                     className="text-center p-4 text-gray-500 italic"
//                   >
//                     No roles found.
//                   </td>
//                 </tr>
//               ) : (
//                 roles.map((r) => (
//                   <tr key={r.id} className="border-t hover:bg-gray-50">
//                     <td className="p-3">{r.id}</td>
//                     <td className="p-3">{r.role}</td>
//                     <td className="p-3">{r.description || "-"}</td>

//                     {/* Toggle Status */}
//                     <td className="p-3">
//                       <label className="relative inline-flex items-center cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={r.status === "active"}
//                           onChange={() => handleToggle(r.id, r.status)}
//                           className="sr-only peer"
//                         />
//                         <div
//                           className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer
//                           peer-checked:bg-green-500
//                           after:content-[''] after:absolute after:top-[2px] after:left-[2px]
//                           after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
//                           peer-checked:after:translate-x-full"
//                         ></div>
//                       </label>
//                     </td>

//                     {/* Actions */}
//                     <td className="p-3 text-center space-x-3">
//                       <button
//                         onClick={() => nav(`/roles/edit/${r.id}`)}
//                         className="text-yellow-600 hover:text-yellow-800"
//                         title="Edit Role"
//                       >
//                         <Edit size={18} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(r.id)}
//                         className="text-red-600 hover:text-red-800"
//                         title="Delete Role"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RoleList;



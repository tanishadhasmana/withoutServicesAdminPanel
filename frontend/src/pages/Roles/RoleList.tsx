import React, { useEffect, useState, useCallback } from "react";
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

  // ✅ Fetch roles
  const loadRoles = useCallback(
    async (
      column?: RoleSearchKey,
      value?: string,
      page = 1,
      limitNum = limit
    ) => {
      try {
        setLoading(true);
        const data = await getRoles(column, value, page, limitNum);
        setRoles(data.roles);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
        toast.error("Failed to load roles ❌");
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // ✅ Initial load
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // ✅ Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const key =
        (Object.keys(searchValues).find(
          (k) => searchValues[k as RoleSearchKey]
        ) as RoleSearchKey | undefined) ?? undefined;

      if (key && searchValues[key]) {
        loadRoles(key, searchValues[key], 1, limit);
      } else {
        loadRoles(undefined, undefined, 1, limit);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchValues, limit, loadRoles]);

  // ✅ Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadRoles(undefined, undefined, page, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
    loadRoles(undefined, undefined, 1, newLimit);
  };

  // ✅ Toggle role status
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
          ? "Role marked as active ✅"
          : "Role marked as inactive ⚪"
      );
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status ❌");
    }
  };

  // ✅ Delete role
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

  // ✅ Utility to prevent leading spaces
  const handleInputChange = (
    field: keyof typeof searchValues,
    value: string
  ) => {
    const sanitized = value.replace(/^\s+/, ""); // remove leading spaces
    setSearchValues((prev) => ({ ...prev, [field]: sanitized }));
  };

  return (
    <div>
      {/* <PageHeader
        title="Roles"
        right={
          <button
            onClick={() => nav("/roles/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Role
          </button>
        }
      /> */}
      .{/* replacing this to have csv btn also */}
      <PageHeader
        title="Roles"
        right={
          <div className="flex gap-2">
            {/* ✅ Export CSV Button */}
            <button
              onClick={() => {
                if (!roles.length) {
                  toast.error("No roles to export ❌");
                  return;
                }

                // Convert roles to CSV
                const headers = ["ID", "Role", "Description", "Status"];
                const csvRows = [
                  headers.join(","), // header row
                  ...roles.map((r) =>
                    [
                      r.id,
                      `"${r.role}"`,
                      `"${r.description || "-"}"`,
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

                toast.success("CSV exported successfully ✅");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export CSV
            </button>

            {/* ✅ Add Role Button */}
            <button
              onClick={() => nav("/roles/add")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>

                {/* ✅ Search Inputs with space-blocking */}
                <tr className="border-t bg-gray-100">
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search ID"
                      className="border p-1 text-sm rounded w-full"
                      value={searchValues.id}
                      onChange={(e) => handleInputChange("id", e.target.value)}
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Role"
                      className="border p-1 text-sm rounded w-full"
                      value={searchValues.role}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
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
                        handleInputChange("description", e.target.value)
                      }
                    />
                  </th>
                  <th className="p-2">
                    <select
                      className="border p-1 text-sm rounded w-full"
                      value={searchValues.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
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

            {/* ✅ Pagination */}
            <div className="flex justify-end mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                limit={limit}
                onLimitChange={handleLimitChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleList;

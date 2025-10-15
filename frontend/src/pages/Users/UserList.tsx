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

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const nav = useNavigate();

  const [searchValues, setSearchValues] = useState({
    firstName: "",
    email: "",
    phone: "",
    role: "",
    status: "",
  });

  // ✅ Load users (pagination + optional filters)
  const loadUsers = useCallback(
    async (
      column?: string,
      value?: string,
      page: number = 1,
      newLimit: number = limit
    ) => {
      try {
        setLoading(true);
        const data = await getUsers(value, column, page, newLimit);
        setUsers(data.users);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        toast.error("Failed to load users ❌");
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // ✅ Initial load
  useEffect(() => {
    loadUsers(undefined, undefined, 1);
  }, [loadUsers]);

  // ✅ Debounced search filter
  useEffect(() => {
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

  // ✅ Delete user
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers((prev: User[]) => prev.filter((user: User) => user.id !== id));
      toast.success("User deleted successfully ✅");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete user ❌");
    }
  };

  // ✅ Toggle user active/inactive
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

      if (newStatus === "active") {
        toast.success("User marked as active ✅");
      } else {
        toast.error("User marked as inactive ⚪");
      }
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status ❌");
    }
  };

  return (
    <div>
      {/* <PageHeader
        title="Users"
        right={
          <button
            onClick={() => nav("/users/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add User
          </button>
        }
      /> */}
      {/* changed as needed export xsv also */}
      <PageHeader
        title="Users"
        right={
          <div className="flex gap-2">
            {/* ✅ Export CSV Button */}
            <button
              onClick={() => {
                if (!users.length) {
                  toast.error("No users to export ❌");
                  return;
                }

                // Convert user data to CSV
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
                  headers.join(","), // header row
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

                toast.success("CSV exported successfully ✅");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export CSV
            </button>

            {/* ✅ Add User Button */}
            <button
              onClick={() => nav("/users/add")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add User
            </button>
          </div>
        }
      />

      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading users...</div>
        ) : (
          <>
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>

                {/* ✅ Search inputs with space prevention */}
                <tr className="border-t">
                  <th></th>
                  {["firstName", "email", "phone", "role"].map((key) => (
                    <th key={key} className="p-2">
                      <input
                        type="text"
                        placeholder={`Search ${key}`}
                        className="border p-1 text-sm rounded w-full"
                        value={searchValues[key as keyof typeof searchValues]}
                        onChange={(e) => {
                          const inputValue = e.target.value;

                          // 🚫 Prevent leading or only-space input
                          if (
                            inputValue.trimStart() === "" &&
                            inputValue !== ""
                          )
                            return;

                          setSearchValues({
                            ...searchValues,
                            [key]: inputValue.trimStart(), // trim leading spaces
                          });
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
                          ...searchValues,
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

                      {/* ✅ Toggle status */}
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

                      {/* ✅ Action Icons */}
                      <td className="p-3 text-center space-x-3">
                        <button
                          onClick={() => nav(`/users/edit/${u.id}`)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit User"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-600 hover:text-red-800"
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

            {/* ✅ Pagination Component */}
            <div className="flex justify-end items-center py-4 pr-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => loadUsers(undefined, undefined, page)}
                limit={limit}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  loadUsers(undefined, undefined, 1, newLimit);
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

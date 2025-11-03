// src/pages/Dashboard/DashboardHome.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { RingLoader } from "react-spinners";

const DashboardHome: React.FC = () => {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [roleCount, setRoleCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // fast count endpoints
        const [usersRes, rolesRes] = await Promise.all([
          api.get("/users/count", { withCredentials: true }),
          api.get("/roles/count", { withCredentials: true }),
        ]);

        setUserCount(usersRes.data?.total ?? 0);
        setRoleCount(rolesRes.data?.total ?? 0);
      } catch (err) {
        console.error("⚠️ Failed to load dashboard stats:", err);
        setUserCount(0);
        setRoleCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RingLoader size={80} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Users Card */}
        <div
          onClick={() => navigate("/users")}
          className="cursor-pointer bg-white border rounded-lg p-6 shadow hover:shadow-lg transition"
        >
          <h2 className="text-lg font-medium text-gray-600 mb-2">
            Total Users
          </h2>
          <p className="text-4xl font-bold text-blue-600">
            {userCount !== null ? userCount : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-2">View and manage users</p>
        </div>

        {/* Total Roles Card */}
        <div
          onClick={() => navigate("/roles")}
          className="cursor-pointer bg-white border rounded-lg p-6 shadow hover:shadow-lg transition"
        >
          <h2 className="text-lg font-medium text-gray-600 mb-2">
            Total Roles
          </h2>
          <p className="text-4xl font-bold text-green-600">
            {roleCount !== null ? roleCount : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-2">View and manage roles</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;


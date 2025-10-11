import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

const DashboardHome: React.FC = () => {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [roleCount, setRoleCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ✅ Fetch total users (with cookie)
        const usersRes = await api.get("/users", { withCredentials: true });
        setUserCount(usersRes.data?.length || 0);

        // ✅ Fetch total roles (with cookie)
        const rolesRes = await api.get("/roles", { withCredentials: true });
        setRoleCount(rolesRes.data?.length || 0);
      } catch (err) {
  if (err instanceof Error) {
    console.error("⚠️ Failed to load dashboard stats:", err.message);
  } else {
    console.error("⚠️ Unknown error:", err);
  }
  setUserCount(0);
  setRoleCount(0);
}
 finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading dashboard data...
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
          <h2 className="text-lg font-medium text-gray-600 mb-2">Total Users</h2>
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
          <h2 className="text-lg font-medium text-gray-600 mb-2">Total Roles</h2>
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





// // src/pages/Dashboard/DashboardHome.tsx
// import React, { useEffect, useState } from "react";
// import Card from "../../components/common/Card";
// import api from "../../lib/api";

// const DashboardHome: React.FC = () => {
//   const [totals, setTotals] = useState({ users: "—", cms: "—", faq: "—", audit: "—" });

//   useEffect(() => {
//     (async () => {
//       try {
//         const users = await api.get("/users");
//         setTotals((t) => ({ ...t, users: `${users.data.length}` }));
//       } catch (err) {
//         console.log(err);
        
//       } 
//     })();
//   }, []);

//   return (
//       <div className="space-y-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <Card title="Total Users" value={totals.users} />
//           <Card title="CMS Pages" value={totals.cms} />
//           <Card title="FAQs" value={totals.faq} />
//           <Card title="Audit Logs" value={totals.audit} />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//           <div className="bg-white rounded shadow p-4 h-64 flex items-center justify-center text-gray-400">Bar Chart Area</div>
//           <div className="bg-white rounded shadow p-4 h-64 flex items-center justify-center text-gray-400">Line Chart Area</div>
//         </div>
//       </div>
   
//   );
// };

// export default DashboardHome;

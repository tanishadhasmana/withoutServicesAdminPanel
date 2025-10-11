// src/components/layout/Topbar.tsx
import React from "react";
import { useAuth } from "../../hooks/useAuth";

const Topbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      await logout();
      alert("You have been logged out successfully.");
    }
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white border-b shadow-sm">
      <h1 className="text-xl font-semibold text-gray-700">Admin Dashboard</h1>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-gray-600 font-medium">
              {user.firstName} {user.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Topbar;



// // src/components/layout/TopBar.tsx
// import React from "react";

// const TopBar: React.FC = () => {
//   return (
//     <div className="w-full bg-white border-b shadow-sm p-4 flex items-center justify-between">
//       <h2 className="text-xl font-semibold text-gray-700">Dashboard</h2>
//     </div>
//   );
// };

// export default TopBar;

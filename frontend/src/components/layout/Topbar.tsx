// src/components/layout/Topbar.tsx
import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { confirmAlert } from "react-confirm-alert";
import toast from "react-hot-toast";



const Topbar: React.FC = () => {
  const { user, logout } = useAuth();

  // const handleLogout = async () => {
  //   const confirmLogout = window.confirm("Are you sure you want to log out?");
  //   if (confirmLogout) {
  //     await logout();
  //     alert("You have been logged out successfully.");
  //   }
  // };
  const handleLogoutConfirmed = async (onClose: () => void) => {
  await logout();
  onClose();
 toast.success("You have been logged out successfully");
};

const confirmLogout = () => {
  confirmAlert({
    customUI: ({ onClose }) => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
            Are you sure you want to log out?
          </h3>
          <p className="text-gray-600 mb-6 text-center">You can again login later.</p>

          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleLogoutConfirmed(onClose)}
              className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    ),
  });
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
              onClick={confirmLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition cursor-pointer"
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


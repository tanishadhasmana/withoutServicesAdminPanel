// src/components/layout/Sidebar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTachometerAlt,
  FaUsers,
  FaUserShield,
  FaFileAlt,
  FaQuestionCircle,
  FaEnvelopeOpenText,
  FaCogs,
  FaClipboardList,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  const menu = [
    { label: "Dashboard", to: "/dashboard", icon: <FaTachometerAlt /> },
    { label: "Users", to: "/users", icon: <FaUsers /> },
    { label: "Roles", to: "/roles", icon: <FaUserShield /> },
    { label: "CMS", to: "/cms", icon: <FaFileAlt /> },
    { label: "FAQ", to: "/faq", icon: <FaQuestionCircle /> },
    {
      label: "Email Templates",
      to: "/email-templates",
      icon: <FaEnvelopeOpenText />,
    },
    {
      label: "Application Config",
      to: "/application-config",
      icon: <FaCogs />,
    },
    { label: "Audit Logs", to: "/audit", icon: <FaClipboardList /> },
  ];

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-blue-800 text-white flex flex-col h-full min-h-screen overflow-y-auto transition-all duration-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-700">
        {isOpen && <h1 className="text-lg font-semibold">Admin Panel</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-gray-200"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-4 py-4 px-4 border-b border-blue-700">
        <img
          src={
            user?.profileImage
              ? `http://localhost:3000${user.profileImage}`
              : "/default-avatar.png"
          }
          alt="User"
          className="w-12 h-12 rounded-full border object-cover"
        />
        {isOpen && (
          <div className="flex flex-col">
            <p className="text-sm font-medium text-white">
              {user?.firstName || "User"}
            </p>
            <p className="text-xs text-gray-300">{user?.role}</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="p-2 flex-1 overflow-y-auto">
        {menu.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 p-3 rounded hover:bg-blue-700 ${
              location.pathname.startsWith(item.to) ? "bg-blue-700" : ""
            }`}
          >
            <div className="text-lg">{item.icon}</div>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>

  );
};

export default Sidebar;

import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AdminLayout from "../components/layout/AdminLayout";

// pages
import Login from "../pages/Auth/Login";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import DashboardHome from "../pages/DashboardHome.tsx/DashboardHome";
import UserList from "../pages/Users/UserList";
import AddUser from "../pages/Users/AddUser";
import RoleList from "../pages/Roles/RoleList";
import AddRole from "../pages/Roles/AddRole";
import CMSList from "../pages/CMS/CMSList";
import AddCMS from "../pages/CMS/AddCMS";
import FAQList from "../pages/FAQ/FAQList";
import AddFAQ from "../pages/FAQ/AddFAQ";
import EmailTemplateList from "../pages/EmailTemplates/EmailTemplateList";
import AddEmailTemplate from "../pages/EmailTemplates/AddEmailTemplate";
import ApplicationConfigList from "../pages/ApplicationConfig/ApplicationConfigList";
import AddApplicationConfig from "../pages/ApplicationConfig/AddApplicationConfig";
import AuditLogsPage from "../pages/AuditLogs/AuditLogsPage";

const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-20">Loading session...</div>;

  return (
    <Routes>
      {/* 🔓 Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* 🔐 Protected routes */}
      {user ? (
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/dashboard" element={<DashboardHome />} />

          {/* Users */}
          <Route path="/users" element={<UserList />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/users/edit/:id" element={<AddUser />} />

          {/* Roles */}
          <Route path="/roles" element={<RoleList />} />
          <Route path="/roles/add" element={<AddRole />} />
          <Route path="/roles/edit/:id" element={<AddRole />} />

          {/* CMS */}
          <Route path="/cms" element={<CMSList />} />
          <Route path="/cms/add" element={<AddCMS />} />
          <Route path="/cms/edit/:id" element={<AddCMS />} /> {/* ✅ Edit route */}

          {/* FAQ */}
          <Route path="/faq" element={<FAQList />} />
          <Route path="/faq/add" element={<AddFAQ />} />
          <Route path="/faq/edit/:id" element={<AddFAQ />} /> {/* optional */}

          {/* Email Templates */}
          <Route path="/email-templates" element={<EmailTemplateList />} />
          <Route path="/email-templates/add" element={<AddEmailTemplate />} />
          <Route path="/email-templates/edit/:id" element={<AddEmailTemplate />} /> {/* optional */}

          {/* Application Config */}
          <Route path="/application-config" element={<ApplicationConfigList />} />
          <Route path="/application-config/add" element={<AddApplicationConfig />} />
          <Route path="/application-config/edit/:id" element={<AddApplicationConfig />} /> {/* optional */}

          {/* Audit Logs */}
          <Route path="/audit" element={<AuditLogsPage />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default AppRouter;




import { Navigate, Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

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
          {/* Dashboard */}
          <Route path="/" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />

          {/* Users */}
          <Route path="/users" element={<ProtectedRoute requiredPermission="user_list"><UserList /></ProtectedRoute>} />
          <Route path="/users/add" element={<ProtectedRoute requiredPermission="user_add"><AddUser /></ProtectedRoute>} />
          <Route path="/users/edit/:id" element={<ProtectedRoute requiredPermission="user_edit"><AddUser /></ProtectedRoute>} />

          {/* Roles */}
          <Route path="/roles" element={<ProtectedRoute requiredPermission="role_list"><RoleList /></ProtectedRoute>} />
          <Route path="/roles/add" element={<ProtectedRoute requiredPermission="role_add"><AddRole /></ProtectedRoute>} />
          <Route path="/roles/edit/:id" element={<ProtectedRoute requiredPermission="role_edit"><AddRole /></ProtectedRoute>} />

          {/* CMS */}
          <Route path="/cms" element={<ProtectedRoute requiredPermission="cms_list"><CMSList /></ProtectedRoute>} />
          <Route path="/cms/add" element={<ProtectedRoute requiredPermission="cms_add"><AddCMS /></ProtectedRoute>} />
          <Route path="/cms/edit/:id" element={<ProtectedRoute requiredPermission="cms_edit"><AddCMS /></ProtectedRoute>} />

          {/* FAQ */}
          <Route path="/faq" element={<ProtectedRoute requiredPermission="faq_list"><FAQList /></ProtectedRoute>} />
          <Route path="/faq/add" element={<ProtectedRoute requiredPermission="faq_add"><AddFAQ /></ProtectedRoute>} />
          <Route path="/faq/edit/:id" element={<ProtectedRoute requiredPermission="faq_edit"><AddFAQ /></ProtectedRoute>} />

          {/* Email Templates */}
          <Route path="/email-templates" element={<ProtectedRoute requiredPermission="email_list"><EmailTemplateList /></ProtectedRoute>} />
          <Route path="/email-templates/add" element={<ProtectedRoute requiredPermission="email_add"><AddEmailTemplate /></ProtectedRoute>} />
          <Route path="/email-templates/edit/:id" element={<ProtectedRoute requiredPermission="email_edit"><AddEmailTemplate /></ProtectedRoute>} />

          {/* Application Config */}
          <Route path="/application-config" element={<ProtectedRoute requiredPermission="config_list"><ApplicationConfigList /></ProtectedRoute>} />
          <Route path="/application-config/add" element={<ProtectedRoute requiredPermission="config_add"><AddApplicationConfig /></ProtectedRoute>} />
          <Route path="/application-config/edit/:id" element={<ProtectedRoute requiredPermission="config_edit"><AddApplicationConfig /></ProtectedRoute>} />

          {/* Audit Logs */}
          <Route path="/audit" element={<ProtectedRoute requiredPermission="logs_list"><AuditLogsPage /></ProtectedRoute>} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default AppRouter;





// import { Navigate, Routes, Route } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";
// import AdminLayout from "../components/layout/AdminLayout";

// // pages
// import Login from "../pages/Auth/Login";
// import ForgotPassword from "../pages/Auth/ForgotPassword";
// import ResetPassword from "../pages/Auth/ResetPassword";
// import DashboardHome from "../pages/DashboardHome.tsx/DashboardHome";
// import UserList from "../pages/Users/UserList";
// import AddUser from "../pages/Users/AddUser";
// import RoleList from "../pages/Roles/RoleList";
// import AddRole from "../pages/Roles/AddRole";
// import CMSList from "../pages/CMS/CMSList";
// import AddCMS from "../pages/CMS/AddCMS";
// import FAQList from "../pages/FAQ/FAQList";
// import AddFAQ from "../pages/FAQ/AddFAQ";
// import EmailTemplateList from "../pages/EmailTemplates/EmailTemplateList";
// import AddEmailTemplate from "../pages/EmailTemplates/AddEmailTemplate";
// import ApplicationConfigList from "../pages/ApplicationConfig/ApplicationConfigList";
// import AddApplicationConfig from "../pages/ApplicationConfig/AddApplicationConfig";
// import AuditLogsPage from "../pages/AuditLogs/AuditLogsPage";

// const AppRouter = () => {
//   const { user, loading } = useAuth();

//   if (loading) return <div className="text-center mt-20">Loading session...</div>;

//   return (
//     <Routes>
//       {/* 🔓 Public routes */}
//       <Route
//         path="/login"
//         element={user ? <Navigate to="/dashboard" replace /> : <Login />}
//       />
//       <Route path="/forgot-password" element={<ForgotPassword />} />
//       <Route path="/reset-password" element={<ResetPassword />} />

//       {/* 🔐 Protected routes */}
//       {user ? (
//         <Route element={<AdminLayout />}>
//           <Route path="/" element={<DashboardHome />} />
//           <Route path="/dashboard" element={<DashboardHome />} />

//           {/* Users */}
//           <Route path="/users" element={<UserList />} />
//           <Route path="/users/add" element={<AddUser />} />
//           <Route path="/users/edit/:id" element={<AddUser />} />

//           {/* Roles */}
//           <Route path="/roles" element={<RoleList />} />
//           <Route path="/roles/add" element={<AddRole />} />
//           <Route path="/roles/edit/:id" element={<AddRole />} />

//           {/* CMS */}
//           <Route path="/cms" element={<CMSList />} />
//           <Route path="/cms/add" element={<AddCMS />} />
//           <Route path="/cms/edit/:id" element={<AddCMS />} /> {/* ✅ Edit route */}

//           {/* FAQ */}
//           <Route path="/faq" element={<FAQList />} />
//           <Route path="/faq/add" element={<AddFAQ />} />
//           <Route path="/faq/edit/:id" element={<AddFAQ />} /> {/* optional */}

//           {/* Email Templates */}
//           <Route path="/email-templates" element={<EmailTemplateList />} />
//           <Route path="/email-templates/add" element={<AddEmailTemplate />} />
//           <Route path="/email-templates/edit/:id" element={<AddEmailTemplate />} /> {/* optional */}

//           {/* Application Config */}
//           <Route path="/application-config" element={<ApplicationConfigList />} />
//           <Route path="/application-config/add" element={<AddApplicationConfig />} />
//           <Route path="/application-config/edit/:id" element={<AddApplicationConfig />} /> {/* optional */}

//           {/* Audit Logs */}
//           <Route path="/audit" element={<AuditLogsPage />} />
//         </Route>
//       ) : (
//         <Route path="*" element={<Navigate to="/login" replace />} />
//       )}
//     </Routes>
//   );
// };

// export default AppRouter;




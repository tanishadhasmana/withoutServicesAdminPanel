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
  // as the router always need to know that the user is logged in or not, so it can define which pages to show the user, as use auth return something like, user id,name, role, loading:false or true, login, logout etc.
  const { user, loading } = useAuth();
// prevent to render route before it knows if user is authenticated.
  if (loading)
    return <div className="text-center mt-20">Loading session...</div>;

  return (
    <Routes>
      {/* 🔓 Public routes */}
      <Route
      // like if user login, show dashboard else login
        path="/login"
        // navigate is a react router component, used to redirect usr to diff. route, and replace ensure that, user cant click to back, to go to /login again.
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />


      {/* 🔐 Protected routes */}
      {user ? (
        // every user which is logged in, see admin layout with every page, as it is the combination of both side bar and top bar.
        <Route element={<AdminLayout />}>
          

          {/* Dashboard */}
          <Route
          // through http://localhost:5173/ we can go to dashboard 
            path="/"
            // as we maked a seprate protected route.ts in common folder to check the user authentication, session, permissions etc, which ensures that, if someone try to access /Dashboard only if they logged in else re direct to the login page.
            element={
              <ProtectedRoute>
                <DashboardHome />
              </ProtectedRoute>
            }
          />
          <Route
          // and through http://localhost:5173/dashboard we also go to the dashboard
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardHome />
              </ProtectedRoute>
            }
          />

{/* now for all we check for list, add and edit route permissions */}

          {/* Users */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredPermission="user_list">
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/add"
            element={
              <ProtectedRoute requiredPermission="user_add">
                <AddUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/edit/:id"
            element={
              <ProtectedRoute requiredPermission="user_edit">
                <AddUser />
              </ProtectedRoute>
            }
          />

          {/* Roles */}
          <Route
            path="/roles"
            element={
              <ProtectedRoute requiredPermission="role_list">
                <RoleList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles/add"
            element={
              <ProtectedRoute requiredPermission="role_add">
                <AddRole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles/edit/:id"
            element={
              <ProtectedRoute requiredPermission="role_edit">
                <AddRole />
              </ProtectedRoute>
            }
          />

          {/* CMS */}
          <Route
            path="/cms"
            element={
              <ProtectedRoute requiredPermission="cms_list">
                <CMSList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cms/add"
            element={
              <ProtectedRoute requiredPermission="cms_add">
                <AddCMS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cms/edit/:id"
            element={
              <ProtectedRoute requiredPermission="cms_edit">
                <AddCMS />
              </ProtectedRoute>
            }
          />

          {/* FAQ */}
          <Route
            path="/faq"
            element={
              <ProtectedRoute requiredPermission="faq_list">
                <FAQList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faq/add"
            element={
              <ProtectedRoute requiredPermission="faq_add">
                <AddFAQ />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faq/edit/:id"
            element={
              <ProtectedRoute requiredPermission="faq_edit">
                <AddFAQ />
              </ProtectedRoute>
            }
          />

          {/* Email Templates */}
          <Route
            path="/email-templates"
            element={
              <ProtectedRoute requiredPermission="email_list">
                <EmailTemplateList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-templates/add"
            element={
              <ProtectedRoute requiredPermission="email_add">
                <AddEmailTemplate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-templates/edit/:id"
            element={
              <ProtectedRoute requiredPermission="email_edit">
                <AddEmailTemplate />
              </ProtectedRoute>
            }
          />

          {/* Application Config */}
          <Route
            path="/application-config"
            element={
              <ProtectedRoute requiredPermission="config_list">
                <ApplicationConfigList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/application-config/add"
            element={
              <ProtectedRoute requiredPermission="config_add">
                <AddApplicationConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/application-config/edit/:id"
            element={
              <ProtectedRoute requiredPermission="config_edit">
                <AddApplicationConfig />
              </ProtectedRoute>
            }
          />

          {/* Audit Logs */}
          <Route
            path="/audit"
            element={
              <ProtectedRoute requiredPermission="logs_list">
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default AppRouter;

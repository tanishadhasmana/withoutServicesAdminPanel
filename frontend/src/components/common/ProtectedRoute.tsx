import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { ReactElement } from "react";

interface ProtectedRouteProps {
  children: ReactElement;
  requiredPermission?: string;
}

export const ProtectedRoute = ({ children, requiredPermission }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // ✅ Wait for session loading before checking anything
  if (loading) return null; // or show a spinner instead

  // ✅ If still no user after loading → not logged in
  if (!user) return <Navigate to="/login" replace />;

  // ✅ Permission check only after session is available
  if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
    return <div className="p-4 text-red-600">Access Denied</div>;
  }

  return children;
};




// import type { ReactElement } from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth";

// interface ProtectedRouteProps {
//   children: ReactElement;
//   requiredPermission?: string;
// }

// export const ProtectedRoute = ({ children, requiredPermission }: ProtectedRouteProps) => {
//   const { user } = useAuth();
//   console.log("ProtectedRoute Rendered", user);
//   if (!user) return <Navigate to="/login" replace />;
//   console.log("User Permissions:", user.permissions);
//   console.log("Required Permission:", requiredPermission);  
//   if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
//     return <div className="p-4 text-red-600">Access Denied</div>;
//   }

//   return children;
// };




import { useContext } from "react";
import type { AuthContextType } from "../context/AuthContext";
import { AuthContext } from "../context/AuthContext";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};


// import React, { createContext, useContext, useState, useEffect } from "react";
// import type { ReactNode } from "react";
// import type { User } from "../types/User";
// import api from "../lib/api";
// import { useNavigate } from "react-router-dom";
 
// export interface AuthContextType {
//   user: User | null;
//   setUser: (user: User | null) => void;
//   login: (user: User) => void;
//   logout: () => Promise<void>;
//   loading: boolean;
// }
 
// const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
// interface AuthProviderProps {
//   children: ReactNode;
// }
 
// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
 
//   // ✅ Check session on page load using cookie
//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         const res = await api.get("/users/me", { withCredentials: true });
//         if (res.data && res.data.user) {
//           setUser(res.data.user);
//           localStorage.setItem("user", JSON.stringify(res.data.user));
//         } else {
//           setUser(null);
//           localStorage.removeItem("user");
//         }
//       } catch (err) {
//         console.log(err);
        
//         setUser(null);
//         localStorage.removeItem("user");
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkSession();
//   }, []);
 
//   // ✅ Login - backend sets cookie, just store user
//   const login = (userData: User) => {
//     setUser(userData);
//     localStorage.setItem("user", JSON.stringify(userData));
//   };
 
//   // ✅ Logout - backend clears cookie, frontend resets state
//   const logout = async () => {
//     try {
//       await api.post("/users/logout", {}, { withCredentials: true });
//     } catch {
//       console.warn("Logout API failed, clearing local data anyway");
//     }
//     setUser(null);
//     localStorage.removeItem("user");
//     navigate("/login");
//   };
 
//   // ✅ No JSX (for .ts files)
//   if (loading) {
//     return React.createElement(
//       "div",
//       { className: "flex justify-center items-center h-screen text-gray-500" },
//       "Loading session..."
//     );
//   }
 
//   return React.createElement(
//     AuthContext.Provider,
//     { value: { user, setUser, login, logout, loading } },
//     children
//   );
// };
 
// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };

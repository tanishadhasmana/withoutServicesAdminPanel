import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/User";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get("/users/me", { withCredentials: true });
        setUser(res.data?.user || null); // just set state
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (userData: User) => {
    setUser(userData); // backend already set the cookie
  };

  const logout = async () => {
    try {
      await api.post("/users/logout", {}, { withCredentials: true }); // clears cookie
    } catch {
      console.warn("Logout failed");
    }
    setUser(null);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading session...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};





// import React, { useState, useEffect } from "react";
// import { AuthContext } from "./AuthContext";
// import type { User } from "../types/User";
// import api from "../lib/api";
// import { useNavigate } from "react-router-dom";

// const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // ✅ Auto-check session via cookie on load
//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         const res = await api.get("/users/me", { withCredentials: true });
//         if (res.data?.user) {
//           setUser(res.data.user);
//           localStorage.setItem("user", JSON.stringify(res.data.user));
//         }
//       } catch (err) {
//         console.log(err);
        
//         console.log("No active session found");
//         setUser(null);
//         localStorage.removeItem("user");
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkSession();
//   }, []);

//   // ✅ Login handler (cookie set by backend)
//   const login = (userData: User) => {
//     setUser(userData);
//     localStorage.setItem("user", JSON.stringify(userData));
//   };

//   // ✅ Logout handler (cookie cleared by backend)
//   const logout = async () => {
//     try {
//       await api.post("/users/logout", {}, { withCredentials: true });
//     } catch (err) {
//       console.log(err);
      
//       console.warn("Logout request failed, clearing local data anyway");
//     }
//     setUser(null);
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen text-gray-500">
//         Loading session...
//       </div>
//     );
//   }

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;

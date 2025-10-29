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
        const fetchedUser: User | null = res.data?.user || null;
        console.log("Fetched user:", fetchedUser);
        // ✅ Ensure permissions array exists even if empty
        if (fetchedUser && !fetchedUser.permissions) {
          fetchedUser.permissions = [];
        }

        setUser(fetchedUser);
      } catch (err) {
        console.warn("Session check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (userData: User) => {
    // ✅ Ensure permissions array exists
    if (!userData.permissions) userData.permissions = [];
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





// import { useState, useEffect } from "react";
// import type { ReactNode } from "react";
// import type { User } from "../types/User";
// import api from "../lib/api";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "./AuthContext";

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         const res = await api.get("/users/me", { withCredentials: true });
//         setUser(res.data?.user || null); // just set state
//       } catch {
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkSession();
//   }, []);

//   const login = (userData: User) => {
//     setUser(userData); // backend already set the cookie
//   };

//   const logout = async () => {
//     try {
//       await api.post("/users/logout", {}, { withCredentials: true }); // clears cookie
//     } catch {
//       console.warn("Logout failed");
//     }
//     setUser(null);
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
//     <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

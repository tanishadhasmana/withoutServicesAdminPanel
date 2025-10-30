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
  // hold current user state, or if not logged in, null
  const [user, setUser] = useState<User | null>(null);
  // loading state while checking session, true until it checks if a user session exists
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // this is checkiing the session cookie when the app loads
        const res = await api.get("/users/me", { withCredentials: true });
        // here |(union type) says this could be User or null, and of either any of type of user or null, and || is or means if we are not getting any user from response, then it treate as null, never crash.
        const fetchedUser: User | null = res.data?.user || null;
        console.log("Fetched user:", fetchedUser);
        // this check 2 conditions like, there must be a user, and no matter if backeend passing the permissions field or not, we ensure that permissions field is always an empty array, if there is no permissions passses.
        if (fetchedUser && !fetchedUser.permissions) {
          fetchedUser.permissions = [];
        }
// setting user with fetched user
        setUser(fetchedUser);
      } catch (err) {
        // if any error occurs during the session check, we log the warning and set user to null, as this means no valid session exists
        console.warn("Session check failed:", err);
        setUser(null);
      } finally {
        // this always run, so after check we make this loading stop false to stop
        setLoading(false);
      }
    };

    checkSession();
    // the deoendency array is empty, so this effect runs only once when the component mounts/renders for the first time
  }, []);

  // here component login, wants the parameter named userData of type User
  const login = (userData: User) => {
    // Ensure permissions array exists, means if backend did not provide permissions, we set it to empty array
    if (!userData.permissions) userData.permissions = [];
    setUser(userData); 
  };

  const logout = async () => {
    try {
      // when user loggedin we set the cookie, which is stored in the breowser, so for log out, we have to pass that cookie to logout that user so that backend can identify which user to log out
      await api.post("/users/logout", {}, { withCredentials: true }); 
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

import { createContext } from "react";
import type { User } from "../types/User";

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

// only export context here
export const AuthContext = createContext<AuthContextType | undefined>(undefined);



// import { createContext, useContext } from "react";
// import type { User } from "../types/User";

// export interface AuthContextType {
//   user: User | null;
//   login: (user: User) => void;
//   logout: () => void;
// }

// // ✅ Default empty context
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };

// export { AuthContext };

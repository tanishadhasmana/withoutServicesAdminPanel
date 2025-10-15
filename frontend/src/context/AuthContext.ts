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

export type UserRole = "developer" | "manager" | "admin" | "onlyFAQ" | string;
export type UserStatus = "active" | "inactive";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  roleId: number;      // ✅ Added for backend consistency
  role: UserRole;      // for display
  status: UserStatus;
  profileImage?: string;
  createdAt: string;
  updatedAt?: string | null;
}




// export type UserRole = "developer" | "manager" | "admin" | "onlyFAQ"| string;
// export type UserStatus = "active" | "inactive";

// export interface User {
//   id: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone?: string | null;
//   role: UserRole;
//   status: UserStatus;
//   profileImage?: string;
//   createdAt: string;
//   updatedAt?: string | null;
// }

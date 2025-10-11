// src/services/userService.ts
import api from "../lib/api";
import type { User } from "../types/User";

// ✅ Get all users (supports search + column)
export const getUsers = async (search?: string, column?: string): Promise<User[]> => {
  // if search & column are passed, call backend with them
  let url = "/users";
  if (search && column) {
    url += `?search=${encodeURIComponent(search)}&column=${column}`;
  }

  const res = await api.get(url, { withCredentials: true });
  return res.data;
};

// ✅ Get user by ID
export const getUserById = async (id: number): Promise<User> => {
  const res = await api.get(`/users/${id}`, { withCredentials: true });
  return res.data;
};

// ✅ Create new user
export const createUser = async (user: Partial<User>) => {
  const res = await api.post("/users", user, { withCredentials: true });
  return res.data;
};

// ✅ Update existing user
export const updateUser = async (id: number, user: Partial<User>) => {
  const res = await api.put(`/users/${id}`, user, { withCredentials: true });
  return res.data;
};

// ✅ Delete user
export const deleteUser = async (id: number) => {
  const res = await api.delete(`/users/${id}`, { withCredentials: true });
  return res.data;
};

// ✅ Toggle active / inactive
export const toggleUserStatus = async (id: number, status: "active" | "inactive") => {
  const res = await api.put(`/users/${id}/status`, { status }, { withCredentials: true });
  return res.data;
};

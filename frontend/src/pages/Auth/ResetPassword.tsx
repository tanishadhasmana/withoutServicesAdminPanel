// src/pages/Auth/ResetPassword.tsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

const ResetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      alert("Passwords do not match");
      return;
    }
    try {
      await api.post("/password/reset-password", { token, newPassword });
      alert("Password reset successful. Please login with the new password.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to reset password. The link may have expired.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form onSubmit={submit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Reset Password</h2>
        <input
          required
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />
        <input
          required
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;

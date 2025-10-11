// src/pages/Auth/ForgotPassword.tsx
import { useState } from "react";
import api from "../../lib/api";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/password/forgot-password", { email });
      alert("If this email exists, a reset link has been sent. Check your Mailtrap inbox in dev.");
      nav("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form onSubmit={onSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Forgot Password</h2>
        <input
          required
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />
        <div className="flex items-center justify-between">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <button type="button" onClick={() => nav("/login")} className="text-sm text-blue-600 underline">
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import type { AxiosError } from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // ✅ If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(
        "/users/login",
        { email, password },
        { withCredentials: true }
      );
      login(res.data.user); // ✅ only pass user
      navigate("/dashboard", { replace: true }); // ✅ replace history so back arrow won’t work
    } catch (err) {
      const e2 = err as AxiosError<{ message: string }>;
      alert(e2.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">
          Admin Login
        </h2>
        <input
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>
        <p className="text-right mt-2">
          <a
            className="text-sm text-blue-600 hover:underline"
            href="/forgot-password"
          >
            Forgot password?
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;

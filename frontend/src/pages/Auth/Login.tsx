import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    mode: "onChange",         // ✅ validate while typing
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await api.post("/users/login", data, {
        withCredentials: true,
      });
      login(res.data.user);
      navigate("/dashboard", { replace: true });
    // } catch (err) {

    //   const e2 = err as AxiosError<{ message?: string }>;
    //   setError("email", {
    //     type: "server",
    //     message: "Please enter valid email or password.",
        
    //   });
    // }
    } catch {
  setError("email", {
    
    type: "server",
    message: "Please enter valid email or password.",
  
  });
}

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">
          Admin Panel Login
        </h2>

        {/* Email */}
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i,
              message: "Enter a valid email address",
            },
          })}
          className={`w-full border p-2 rounded mb-1 ${
            errors.email ? "border-red-500" : ""
          }`}
          placeholder="Email"
          autoFocus
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>
        )}

        {/* Password */}
        <input
          type="password"
          {...register("password", {
            required: "Password is required",
          })}
          className={`w-full border p-2 rounded mb-1 ${
            errors.password ? "border-red-500" : ""
          }`}
          placeholder="Password"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-2">
            {errors.password.message}
          </p>
        )}

        <button
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded mt-2 disabled:opacity-50 cursor-pointer"
        >
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






// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../lib/api";
// import { useAuth } from "../../hooks/useAuth";
// import type { AxiosError } from "axios";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { login, user } = useAuth();
//   const navigate = useNavigate();

//   // ✅ If already logged in, redirect to dashboard
//   useEffect(() => {
//     if (user) navigate("/dashboard", { replace: true });
//   }, [user, navigate]);

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const res = await api.post(
//         "/users/login",
//         { email, password },
//         { withCredentials: true }
//       );
//       login(res.data.user); // ✅ only pass user
//       navigate("/dashboard", { replace: true }); // ✅ replace history so back arrow won’t work
//     } catch (err) {
//       const e2 = err as AxiosError<{ message: string }>;
//       alert(e2.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
//       <form
//         onSubmit={submit}
//         className="bg-white p-8 rounded shadow-md w-full max-w-md"
//       >
//         <h2 className="text-2xl font-semibold mb-4 text-blue-600">
//           Admin Login
//         </h2>
//         <input
//           required
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full border p-2 rounded mb-3"
//         />
//         <input
//           required
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full border p-2 rounded mb-4"
//         />
//         <button className="w-full bg-blue-600 text-white py-2 rounded">
//           Login
//         </button>
//         <p className="text-right mt-2">
//           <a
//             className="text-sm text-blue-600 hover:underline"
//             href="/forgot-password"
//           >
//             Forgot password?
//           </a>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default Login;

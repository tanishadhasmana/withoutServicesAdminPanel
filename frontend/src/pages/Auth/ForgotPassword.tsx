// src/pages/Auth/ForgotPassword.tsx
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../lib/api";

interface FormType {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormType>({
    mode: "onChange",          // ✅ validate while typing
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: FormType) => {
    try {
      await api.post("/password/forgot-password", data);
      alert("If this email exists, a reset link has been sent. Check Mailtrap inbox in dev.");
      nav("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Forgot Password</h2>

        {/* Email */}
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i,
              message: "Enter a valid email address",
            },
          })}
          placeholder="Enter your email"
          className={`w-full border p-2 rounded mb-1 ${
            errors.email ? "border-red-500" : ""
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-3">{errors.email.message}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>

          <button
            type="button"
            onClick={() => nav("/login")}
            className="text-sm text-blue-600 underline cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;




// src/pages/Auth/ForgotPassword.tsx
// import { useState } from "react";
// import api from "../../lib/api";
// import { useNavigate } from "react-router-dom";

// const ForgotPassword: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const nav = useNavigate();

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       await api.post("/password/forgot-password", { email });
//       alert("If this email exists, a reset link has been sent. Check your Mailtrap inbox in dev.");
//       nav("/login");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to send reset link");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
//       <form onSubmit={onSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
//         <h2 className="text-2xl font-semibold mb-4 text-blue-600">Forgot Password</h2>
//         <input
//           required
//           type="email"
//           placeholder="Enter your email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full border p-2 rounded mb-4"
//         />
//         <div className="flex items-center justify-between">
//           <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
//             {loading ? "Sending..." : "Send Reset Link"}
//           </button>
//           <button type="button" onClick={() => nav("/login")} className="text-sm text-blue-600 underline">
//             Back to Login
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ForgotPassword;

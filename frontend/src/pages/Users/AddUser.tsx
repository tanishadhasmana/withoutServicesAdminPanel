// src/pages/Users/AddUser.tsx
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import InputMask from "@mona-health/react-input-mask";
import PageHeader from "../../components/layout/PageHeader";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById } from "../../services/userService";
import type { User, UserStatus } from "../../types/User";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: number;
  status: UserStatus;
  image?: FileList;
}

const AddUser: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const editing = Boolean(id);
  const nav = useNavigate();

  const [roles, setRoles] = useState<{ id: number; role: string }[]>([]);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    defaultValues: { status: "active" },
    mode: "onTouched",
  });

  // ✅ Prevent any space from being typed
  const handleNoSpaces = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof UserFormData
  ) => {
    let value = e.target.value;
    // Remove all spaces, leading/trailing, and multiple
    value = value.replace(/\s+/g, "");
    setValue(fieldName, value);
  };

  // Fetch roles
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/roles", {
          params: { limit: 1000 },
          withCredentials: true,
        });

        interface ApiRole {
          id: number;
          role?: string;
          name?: string;
        }

        const data = Array.isArray(res.data) ? res.data : res.data.roles || [];

        const normalized = data.map((r: ApiRole) => ({
          id: r.id,
          role: r.role || r.name || "",
        }));

        setRoles(normalized);
      } catch (err) {
        console.error("Failed to load roles:", err);
        toast.error("Failed to fetch roles ❌");
      }
    })();
  }, []);

  // Prefill form on edit
  useEffect(() => {
    if (!editing || !id || roles.length === 0) return;

    const fetchUser = async () => {
      try {
        const data: User = await getUserById(Number(id));
        setValue("firstName", data.firstName || "");
        setValue("lastName", data.lastName || "");
        setValue("email", data.email || "");
        setValue("phone", data.phone || "");
        setValue("status", data.status);

        const matchedRole = roles.find((r) => r.role === data.role);
        setValue("roleId", matchedRole ? matchedRole.id : 0);

        if (data.profileImage) {
          setProfilePreview(`http://localhost:3000${data.profileImage}`);
        } else {
          setProfilePreview(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        toast.error("Failed to load user data ❌");
      }
    };

    fetchUser();
  }, [editing, id, roles, setValue]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, or WEBP image files are allowed ❌");
        e.target.value = "";
        setProfilePreview(null);
        return;
      }
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  // Submit form
  const onSubmit = async (data: UserFormData) => {
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("status", data.status);
      formData.append("roleId", data.roleId.toString());

      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      if (editing && id) {
        await api.put(`/users/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        toast.success("User updated successfully ✅");
      } else {
        await api.post("/users", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        toast.success("User created successfully ✅");
      }

      nav("/users");
    } catch (err: unknown) {
      console.error("Save failed:", err);
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message || "Failed to save user ❌"
        );
      } else {
        toast.error("Something went wrong ❌");
      }
    }
  };

  return (
    <div>
      <PageHeader title={editing ? "Edit User" : "Add User"} right={<div />} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md max-w-4xl mx-auto mt-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("firstName", {
                required: "First name is required",
                minLength: { value: 3, message: "Minimum 3 characters" },
                maxLength: { value: 20, message: "Maximum 20 characters" },
                pattern: {
                  value: /^[A-Za-z]+$/,
                  message: "Only alphabets allowed",
                },
              })}
              onChange={(e) => handleNoSpaces(e, "firstName")}
              className={`border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400 ${
                errors.firstName ? "border-red-500" : ""
              }`}
              placeholder="First Name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("lastName", {
                required: "Last name is required",
                minLength: { value: 2, message: "Minimum 2 characters" },
                maxLength: { value: 20, message: "Maximum 20 characters" },
                pattern: {
                  value: /^[A-Za-z]+$/,
                  message: "Only alphabets allowed",
                },
              })}
              onChange={(e) => handleNoSpaces(e, "lastName")}
              className={`border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400 ${
                errors.lastName ? "border-red-500" : ""
              }`}
              placeholder="Last Name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                maxLength: {
                  value: 100,
                  message: "Email cannot exceed 100 characters",
                },
                pattern: {
                  value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                  message: "Enter a valid email address",
                },
              })}
              onKeyDown={(e) => {
                if (e.key === " ") e.preventDefault(); // 🚫 Block space key completely
              }}
              onChange={(e) => {
                const noSpaces = e.target.value.replace(/\s+/g, "");
                setValue("email", noSpaces);
              }}
              className={`border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400 ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <Controller
              name="phone"
              control={control}
              rules={{
                required: "Phone number is required",
                validate: (value) =>
                  value && value.replace(/\D/g, "").length === 12
                    ? true
                    : "Enter valid number (+91 XXXXX XXXXX)",
              }}
              render={({ field }) => (
                <InputMask
                  {...field}
                  mask="+91 99999 99999"
                  replacement={{ 9: /\d/ }}
                  value={field.value || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(e.target.value)
                  }
                  onBlur={field.onBlur}
                >
                  <input
                    className={`border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400 ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                    placeholder="+91 99999 99999"
                  />
                </InputMask>
              )}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              {...register("roleId", { required: "Role is required" })}
              className={`border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400 ${
                errors.roleId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.roleId.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register("status", { required: "Status is required" })}
              className={`border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400 ${
                errors.status ? "border-red-500" : ""
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              {...register("image")}
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-700 border rounded-md cursor-pointer"
            />
            <img
              src={profilePreview || "/default-avatar.png"}
              alt="Preview"
              className="w-20 h-20 mt-2 rounded-full border object-cover"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {editing ? "Update User" : "Add User"}
          </button>
          <button
            type="button"
            onClick={() => nav(-1)}
            className="border px-6 py-2 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;

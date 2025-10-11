import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import toast, { Toaster } from "react-hot-toast";
import { addRole, getRoleById, updateRole } from "../../services/roleService";
import type { RoleFormData } from "../../types/Role";

const AddRole: React.FC = () => {
  const nav = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const editing = Boolean(id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RoleFormData>({
    mode: "onTouched", // triggers validation on blur
    defaultValues: { status: "active" },
  });

  // Prefill form if editing
  useEffect(() => {
    if (!editing || !id) return;

    const fetchRole = async () => {
      try {
        const data = await getRoleById(Number(id));
        setValue("role", data.role);
        setValue("description", data.description || "");
        setValue("status", data.status);
      } catch (err) {
        console.error("Failed to fetch role:", err);
        toast.error("Failed to load role data ❌");
      }
    };

    fetchRole();
  }, [editing, id, setValue]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (editing && id) {
        await updateRole(Number(id), data);
        toast.success("Role updated successfully ✅");
      } else {
        await addRole(data);
        toast.success("Role added successfully ✅");
      }
      nav("/roles");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save role ❌");
    }
  };

  return (
    <div>
      <PageHeader title={editing ? "Edit Role" : "Add Role"} />
      <Toaster position="top-right" reverseOrder={false} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md max-w-2xl mx-auto mt-6"
      >
        {/* Role Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Role Name *
          </label>
          <input
            type="text"
            {...register("role", { required: "Role name is required" })}
            className="border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400"
            placeholder="Enter role name"
          />
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <input
            type="text"
            {...register("description", { required: "Description is required" })}
            className="border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400"
            placeholder="Enter description"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <select
            {...register("status")}
            className="border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {editing ? "Update Role" : "Add Role"}
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

export default AddRole;



// import React from "react";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import PageHeader from "../../components/layout/PageHeader";
// import toast, { Toaster } from "react-hot-toast";
// import { addRole } from "../../services/roleService";

// interface RoleFormData {
//   role: string;
//   description: string;
//   status: "active" | "inactive";
// }

// const AddRole: React.FC = () => {
//   const nav = useNavigate();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<RoleFormData>({
//     mode: "onTouched", // ✅ triggers validation on blur
//     defaultValues: { status: "active" },
//   });

//   const onSubmit = async (data: RoleFormData) => {
//     try {
//       await addRole(data);
//       toast.success("Role added successfully ✅");
//       nav("/roles");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add role ❌");
//     }
//   };

//   return (
//     <div>
//       <PageHeader title="Add Role" />
//       <Toaster position="top-right" reverseOrder={false} />

//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="bg-white p-8 rounded shadow-md max-w-2xl mx-auto mt-6"
//       >
//         {/* Role Name */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Role Name *</label>
//           <input
//             type="text"
//             {...register("role", { required: "Role name is required" })}
//             className="border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400"
//             placeholder="Enter role name"
//           />
//           {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
//         </div>

//         {/* Description */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Description *</label>
//           <input
//             type="text"
//             {...register("description", { required: "Description is required" })}
//             className="border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400"
//             placeholder="Enter description"
//           />
//           {errors.description && (
//             <p className="text-red-500 text-sm">{errors.description.message}</p>
//           )}
//         </div>

//         {/* Status */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Status *</label>
//           <select
//             {...register("status")}
//             className="border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-blue-400"
//           >
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//           </select>
//         </div>

//         <div className="flex gap-3">
//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
//           >
//             Add Role
//           </button>
//           <button
//             type="button"
//             onClick={() => nav(-1)}
//             className="border px-6 py-2 rounded hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddRole;




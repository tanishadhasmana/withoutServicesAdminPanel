import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import toast, { Toaster } from "react-hot-toast";
import {
  createApplicationConfig,
  updateApplicationConfigById,
  getApplicationConfigById,
} from "../../services/applicationConfigService";
import type { ConfigStatus } from "../../types/ApplicationConfig";

interface FormData {
  key: string;
  value: string;
  displayOrder: number;
  status: ConfigStatus;
}

const AddApplicationConfig: React.FC = () => {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: "onTouched",
    defaultValues: { key: "", value: "", displayOrder: 1, status: "active" },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editing || !id) return;

    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await getApplicationConfigById(Number(id));

        // ✅ Fix TypeScript error by coercing null/undefined to empty string
        setValue("key", data.key ?? "");
        setValue("value", data.value ?? "");
        setValue("displayOrder", data.displayOrder);
        setValue("status", data.status);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load config ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [editing, id, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      if (editing && id) {
        await updateApplicationConfigById(Number(id), data);
        toast.success("Configuration updated ✅");
      } else {
        await createApplicationConfig(data);
        toast.success("Configuration added ✅");
      }
      nav("/application-config");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save configuration ❌");
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title={editing ? "Edit Application Configuration" : "Add Application Configuration"}
      />
      <Toaster position="top-right" />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md max-w-xl mx-auto mt-4 space-y-4"
      >
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Key *</label>
              <input
                type="text"
                {...register("key", { required: "Key is required" })}
                className="w-full border rounded px-3 py-2"
                disabled={editing}
              />
              {errors.key && <p className="text-red-500 text-sm">{errors.key.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Value *</label>
              <input
                type="text"
                {...register("value", { required: "Value is required" })}
                className="w-full border rounded px-3 py-2"
              />
              {errors.value && <p className="text-red-500 text-sm">{errors.value.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Display Order *</label>
              <input
                type="number"
                {...register("displayOrder", { required: "Display order is required", min: 1 })}
                className="w-full border rounded px-3 py-2"
                min={1}
              />
              {errors.displayOrder && (
                <p className="text-red-500 text-sm">{errors.displayOrder.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status *</label>
              <select
                {...register("status", { required: "Status is required" })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {editing ? "Update Config" : "Save Config"}
              </button>
              <button
                type="button"
                onClick={() => nav(-1)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default AddApplicationConfig;






// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useNavigate, useParams } from "react-router-dom";
// import PageHeader from "../../components/layout/PageHeader";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   createApplicationConfig,
//   updateApplicationConfigById,
//   getApplicationConfigById,
// } from "../../services/applicationConfigService";
// import type {ConfigStatus } from "../../types/ApplicationConfig";

// interface FormData {
//   key: string;
//   value: string;
//   displayOrder: number;
//   status: ConfigStatus;
// }

// const AddApplicationConfig: React.FC = () => {
//   const nav = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const editing = Boolean(id);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors, isSubmitting },
//   } = useForm<FormData>({
//     mode: "onTouched",
//     defaultValues: { key: "", value: "", displayOrder: 1, status: "active" },
//   });

//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!editing || !id) return;

//     const fetchConfig = async () => {
//       try {
//         setLoading(true);
//         const data = await getApplicationConfigById(Number(id));
//         setValue("key", data.key);
//         setValue("value", data.value);
//         setValue("displayOrder", data.displayOrder);
//         setValue("status", data.status);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load config ❌");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConfig();
//   }, [editing, id, setValue]);

//   const onSubmit = async (data: FormData) => {
//     try {
//       if (editing && id) {
//         await updateApplicationConfigById(Number(id), data);
//         toast.success("Configuration updated ✅");
//       } else {
//         await createApplicationConfig(data);
//         toast.success("Configuration added ✅");
//       }
//       nav("/application-config");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save configuration ❌");
//     }
//   };

//   return (
//     <div className="p-6">
//       <PageHeader title={editing ? "Edit Application Configuration" : "Add Application Configuration"} />
//       <Toaster position="top-right" />
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="bg-white p-6 rounded shadow-md max-w-xl mx-auto mt-4 space-y-4"
//       >
//         {loading ? (
//           <p className="text-center text-gray-500">Loading...</p>
//         ) : (
//           <>
//             <div>
//               <label className="block text-sm font-medium mb-1">Key *</label>
//               <input
//                 type="text"
//                 {...register("key", { required: "Key is required" })}
//                 className="w-full border rounded px-3 py-2"
//                 disabled={editing}
//               />
//               {errors.key && <p className="text-red-500 text-sm">{errors.key.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">Value *</label>
//               <input
//                 type="text"
//                 {...register("value", { required: "Value is required" })}
//                 className="w-full border rounded px-3 py-2"
//               />
//               {errors.value && <p className="text-red-500 text-sm">{errors.value.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">Display Order *</label>
//               <input
//                 type="number"
//                 {...register("displayOrder", { required: "Display order is required", min: 1 })}
//                 className="w-full border rounded px-3 py-2"
//                 min={1}
//               />
//               {errors.displayOrder && <p className="text-red-500 text-sm">{errors.displayOrder.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">Status *</label>
//               <select {...register("status", { required: "Status is required" })} className="w-full border rounded px-3 py-2">
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//               </select>
//               {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
//             </div>

//             <div className="flex gap-3">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {editing ? "Update Config" : "Save Config"}
//               </button>
//               <button type="button" onClick={() => nav(-1)} className="px-4 py-2 border rounded hover:bg-gray-100">
//                 Cancel
//               </button>
//             </div>
//           </>
//         )}
//       </form>
//     </div>
//   );
// };

// export default AddApplicationConfig;



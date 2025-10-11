import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  createEmailTemplate,
  updateEmailTemplate,
  getEmailTemplateById,
} from "../../services/emailTemplateService";
import type { EmailTemplate, TemplateStatus } from "../../types/EmailTemplate";
import PageHeader from "../../components/layout/PageHeader";
import toast, { Toaster } from "react-hot-toast";
import { Editor } from "@tinymce/tinymce-react";

interface FormData {
  key: string;
  title: string;
  subject: string;
  body: string;
  status: TemplateStatus;
}

const AddEmailTemplate: React.FC = () => {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [existingTemplate, setExistingTemplate] = useState<EmailTemplate | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: "onTouched",
    defaultValues: {
      key: "",
      title: "",
      subject: "",
      body: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (editing && id) {
      setLoading(true);
      const fetchTemplate = async () => {
        try {
          const data: EmailTemplate = await getEmailTemplateById(Number(id));
          setExistingTemplate(data); // save for update
          setValue("key", data.key || "");
          setValue("title", data.title || "");
          setValue("subject", data.subject || "");
          setValue("body", data.body || "");
          setValue("status", data.status);
        } catch (err) {
          console.error(err);
          toast.error("Failed to load template ❌");
        } finally {
          setLoading(false);
        }
      };
      fetchTemplate();
    } else {
      // Reset values if adding new
      setValue("key", "");
      setValue("title", "");
      setValue("subject", "");
      setValue("body", "");
      setValue("status", "active");
    }
  }, [editing, id, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      if (editing && existingTemplate) {
        // For update, include createdAt
        await updateEmailTemplate(existingTemplate.id, {
          ...data,
          createdAt: existingTemplate.createdAt,
        });
        toast.success("Template updated ✅");
      } else {
        // For create, add createdAt
        await createEmailTemplate({
          ...data,
          createdAt: new Date().toISOString(),
        });
        toast.success("Template added ✅");
      }
      nav("/email-templates");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save template ❌");
    }
  };

  return (
    <div className="p-6">
      <PageHeader title={editing ? "Edit Email Template" : "Add Email Template"} />
      <Toaster position="top-right" />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md max-w-2xl mx-auto space-y-4 mt-4"
      >
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <>
            {/* Key */}
            <div>
              <label className="block text-sm font-medium mb-1">Key *</label>
              <input
                type="text"
                {...register("key", {
                  required: "Key is required",
                  maxLength: { value: 50, message: "Max 50 chars" },
                })}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter key"
                disabled={editing} // prevent key change when editing
              />
              {errors.key && <p className="text-red-500 text-sm">{errors.key.message}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                {...register("title", {
                  required: "Title is required",
                  maxLength: { value: 100, message: "Max 100 chars" },
                })}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter title"
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-1">Subject *</label>
              <input
                type="text"
                {...register("subject", {
                  required: "Subject is required",
                  maxLength: { value: 150, message: "Max 150 chars" },
                })}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter subject"
              />
              {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
            </div>

            {/* Body using TinyMCE */}
            <div>
              <label className="block text-sm font-medium mb-1">Body *</label>
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    "advlist autolink lists link charmap preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table code help wordcount",
                  ],
                  toolbar:
                    "undo redo | formatselect | bold italic backcolor | " +
                    "alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | removeformat | help",
                  placeholder: "Add or paste your content",
                }}
                value={""}
                onEditorChange={(content) => setValue("body", content)}
              />
              {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}
            </div>

            {/* Status */}
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

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {editing ? "Update" : "Save"}
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

export default AddEmailTemplate;




// src/pages/EmailTemplates/AddEmailTemplate.tsx
// import React, { useEffect } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { useNavigate, useParams } from "react-router-dom";
// import { Editor } from "@tinymce/tinymce-react";
// import {
//   createEmailTemplate,
//   updateEmailTemplate,
//   getEmailTemplateById,
// } from "../../services/emailTemplateService";
// import type { EmailTemplate, EmailTemplateStatus } from "../../types/EmailTemplate";
// import PageHeader from "../../components/layout/PageHeader";
// import toast, { Toaster } from "react-hot-toast";

// interface FormData {
//   key: string;
//   title: string;
//   subject: string;
//   body: string;
//   status: EmailTemplateStatus;
// }

// const AddEmailTemplate: React.FC = () => {
//   const nav = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const editing = Boolean(id);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     control,
//     formState: { errors, isSubmitting },
//   } = useForm<FormData>({
//     mode: "onTouched",
//     defaultValues: { key: "", title: "", subject: "", body: "", status: "active" },
//   });

//   // Fetch template if editing
//   useEffect(() => {
//     if (editing && id) {
//       (async () => {
//         try {
//           const data: EmailTemplate = await getEmailTemplateById(Number(id));
//           setValue("key", data.key);
//           setValue("title", data.title);
//           setValue("subject", data.subject);
//           setValue("body", data.body);
//           setValue("status", data.status);
//         } catch (err) {
//           console.error(err);
//           toast.error("Failed to load template ❌");
//         }
//       })();
//     }
//   }, [editing, id, setValue]);

//   const onSubmit = async (data: FormData) => {
//     try {
//       if (editing && id) {
//         await updateEmailTemplate(Number(id), data);
//         toast.success("Template updated ✅");
//       } else {
//         await createEmailTemplate(data);
//         toast.success("Template added ✅");
//       }
//       nav("/email-templates");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save template ❌");
//     }
//   };

//   return (
//     <div className="p-6">
//       <PageHeader title={editing ? "Edit Email Template" : "Add Email Template"} />
//       <Toaster position="top-right" />
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="bg-white p-6 rounded shadow-md max-w-3xl mx-auto space-y-4 mt-4"
//       >
//         {/* Key */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Key *</label>
//           <input
//             type="text"
//             {...register("key", {
//               required: "Key is required",
//               maxLength: { value: 50, message: "Max 50 chars" },
//             })}
//             className="w-full border rounded px-3 py-2"
//             placeholder="Enter key"
//           />
//           {errors.key && <p className="text-red-500 text-sm">{errors.key.message}</p>}
//         </div>

//         {/* Title */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Title *</label>
//           <input
//             type="text"
//             {...register("title", {
//               required: "Title is required",
//               maxLength: { value: 100, message: "Max 100 chars" },
//             })}
//             className="w-full border rounded px-3 py-2"
//             placeholder="Enter title"
//           />
//           {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
//         </div>

//         {/* Subject */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Subject *</label>
//           <input
//             type="text"
//             {...register("subject", {
//               required: "Subject is required",
//               maxLength: { value: 150, message: "Max 150 chars" },
//             })}
//             className="w-full border rounded px-3 py-2"
//             placeholder="Enter subject"
//           />
//           {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
//         </div>

//         {/* Body (TinyMCE Editor) */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Body *</label>
//           <Controller
//             name="body"
//             control={control}
//             rules={{ required: "Body is required" }}
//             render={({ field }) => (
//               <Editor
//                 apiKey="no-api-key" // Replace with your TinyMCE API key if needed
//                 init={{
//                   height: 300,
//                   menubar: false,
//                   plugins: [
//                     "advlist autolink lists link image charmap preview anchor",
//                     "searchreplace visualblocks code fullscreen",
//                     "insertdatetime media table code help wordcount",
//                   ],
//                   toolbar:
//                     "undo redo | formatselect | bold italic backcolor | " +
//                     "alignleft aligncenter alignright alignjustify | " +
//                     "bullist numlist outdent indent | removeformat | help",
//                 }}
//                 onEditorChange={(content) => field.onChange(content)}
//                 value={field.value}
//               />
//             )}
//           />
//           {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}
//         </div>

//         {/* Status */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Status *</label>
//           <select
//             {...register("status", { required: "Status is required" })}
//             className="w-full border rounded px-3 py-2"
//           >
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//           </select>
//           {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
//         </div>

//         {/* Buttons */}
//         <div className="flex gap-3">
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//           >
//             {editing ? "Update" : "Save"}
//           </button>
//           <button
//             type="button"
//             onClick={() => nav(-1)}
//             className="px-4 py-2 border rounded hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddEmailTemplate;






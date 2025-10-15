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

  // 🚫 Prevent space input or paste
  const preventSpaceInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") e.preventDefault();
  };

  const preventSpacePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted.includes(" ")) e.preventDefault();
  };

  useEffect(() => {
    if (editing && id) {
      setLoading(true);
      const fetchTemplate = async () => {
        try {
          const data: EmailTemplate = await getEmailTemplateById(Number(id));
          setExistingTemplate(data);
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
        await updateEmailTemplate(existingTemplate.id, data);
        toast.success("Template updated ✅");
      } else {
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
              <label className="block text-sm font-medium mb-1">
                Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("key", {
                  required: "Key is required",
                  maxLength: { value: 50, message: "Max 50 chars" },
                })}
                onKeyDown={preventSpaceInput}
                onPaste={preventSpacePaste}
                className={`w-full border rounded px-3 py-2 ${
                  errors.key ? "border-red-500" : ""
                }`}
                placeholder="Enter key"
                disabled={editing}
              />
              {errors.key && <p className="text-red-500 text-sm">{errors.key.message}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("title", {
                  required: "Title is required",
                  maxLength: { value: 100, message: "Max 100 chars" },
                })}
                onKeyDown={preventSpaceInput}
                onPaste={preventSpacePaste}
                className={`w-full border rounded px-3 py-2 ${
                  errors.title ? "border-red-500" : ""
                }`}
                placeholder="Enter title"
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("subject", {
                  required: "Subject is required",
                  maxLength: { value: 150, message: "Max 150 chars" },
                })}
                onKeyDown={preventSpaceInput}
                onPaste={preventSpacePaste}
                className={`w-full border rounded px-3 py-2 ${
                  errors.subject ? "border-red-500" : ""
                }`}
                placeholder="Enter subject"
              />
              {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
            </div>

            {/* Body using TinyMCE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Body <span className="text-red-500">*</span>
              </label>
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
                value={existingTemplate?.body || ""}
                onEditorChange={(content) => setValue("body", content)}
              />
              {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                {...register("status", { required: "Status is required" })}
                className={`w-full border rounded px-3 py-2 ${
                  errors.status ? "border-red-500" : ""
                }`}
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


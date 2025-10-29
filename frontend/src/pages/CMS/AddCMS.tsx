// src/pages/CMS/AddCMS.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import toast, { Toaster } from "react-hot-toast";
import { Editor } from "@tinymce/tinymce-react";
import { getCmsById, createCms, updateCms } from "../../services/cmsService";
import type { CMSFormData } from "../../types/CMS";

const AddCMS: React.FC = () => {
  const nav = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const editing = Boolean(id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CMSFormData>({
    mode: "onTouched",
    defaultValues: {
      key: "",
      title: "",
      metaKeyword: "",
      metaTitle: "",
      metaDescription: "",
      content: "",
      status: "active",
    },
  });

  // Prevent spaces in all inputs/textareas
  const preventSpaceInput = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === " ") e.preventDefault();
  };

  const preventSpacePaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted.includes(" ")) e.preventDefault();
  };

  // Prefill form on edit
  useEffect(() => {
    if (!editing || !id) return;

    const fetchCMS = async () => {
      try {
        const data = await getCmsById(Number(id));
        setValue("key", data.key || "");
        setValue("title", data.title || "");
        setValue("metaKeyword", data.metaKeyword || "");
        setValue("metaTitle", data.metaTitle || "");
        setValue("metaDescription", data.metaDescription || "");
        setValue("content", data.content || "");
        setValue("status", data.status);
      } catch (err) {
        console.error("Failed to fetch CMS:", err);
        toast.error("Failed to load CMS data ");
      }
    };

    fetchCMS();
  }, [editing, id, setValue]);

  const onSubmit = async (data: CMSFormData) => {
    try {
      if (editing && id) {
        await updateCms(Number(id), data);
        toast.success("CMS updated successfully ");
      } else {
        await createCms(data);
        toast.success("CMS created successfully ");
      }
      nav("/cms");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save CMS ");
    }
  };

  return (
    <div>
      <PageHeader title={editing ? "Edit CMS" : "Add CMS"} />
      <Toaster position="top-right" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md max-w-3xl mx-auto mt-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Key <span className="text-red-500">*</span>
            </label>
            <input
            autoFocus
              {...register("key", { required: "Key is required" })}
              onKeyDown={preventSpaceInput}
              onPaste={preventSpacePaste}
              className={`border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 ${
                errors.key
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
              placeholder="Enter unique key"
            />
            {errors.key && <p className="text-red-500 text-sm">{errors.key.message}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              onKeyDown={preventSpaceInput}
              onPaste={preventSpacePaste}
              className={`border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 ${
                errors.title
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
              placeholder="Enter title"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meta Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register("metaTitle", { required: "Meta title is required" })}
              onKeyDown={preventSpaceInput}
              onPaste={preventSpacePaste}
              className={`border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 ${
                errors.metaTitle
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
              placeholder="Meta title"
            />
            {errors.metaTitle && (
              <p className="text-red-500 text-sm">{errors.metaTitle.message}</p>
            )}
          </div>

          {/* Meta Keyword */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meta Keyword
            </label>
            <input
              {...register("metaKeyword")}
              onKeyDown={preventSpaceInput}
              onPaste={preventSpacePaste}
              className="border rounded-md px-3 py-2 mt-1 w-full border-gray-300 focus:ring-2 focus:ring-blue-400"
              placeholder="Meta keywords"
            />
          </div>

          {/* Meta Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Meta Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("metaDescription", {
                required: "Meta description is required",
              })}
              onKeyDown={preventSpaceInput}
              onPaste={preventSpacePaste}
              className={`border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 ${
                errors.metaDescription
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
              placeholder="Meta description"
              rows={3}
            />
            {errors.metaDescription && (
              <p className="text-red-500 text-sm">{errors.metaDescription.message}</p>
            )}
          </div>

          {/* Content (TinyMCE) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Content <span className="text-red-500">*</span>
            </label>
            <Editor
              apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "help",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic backcolor | " +
                  "alignleft aligncenter alignright alignjustify | " +
                  "bullist numlist outdent indent | removeformat | help",
                placeholder: "Add or paste your content",
              }}
              onEditorChange={(content) => setValue("content", content)}
            />
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register("status", { required: "Status is required" })}
              className={`border rounded-md px-3 py-2 mt-1 w-full focus:ring-2 ${
                errors.status
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            {editing ? "Update CMS" : "Add CMS"}
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

export default AddCMS;


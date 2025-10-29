// src/pages/FAQ/AddFAQ.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import toast, { Toaster } from "react-hot-toast";
import { createFaq, updateFaq, getFaqById } from "../../services/faqService";
import type { FAQStatus, FAQ } from "../../types/FAQ";

interface FAQFormData {
  question: string;
  answer: string;
  displayOrder: number;
  status: FAQStatus;
}

const AddFAQ: React.FC = () => {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FAQFormData>({
    mode: "onTouched",
    defaultValues: {
      question: "",
      answer: "",
      displayOrder: 1,
      status: "active",
    },
  });

  // Prevent space typing or pasting
  const preventSpaceInput = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === " ") e.preventDefault();
  };

  const preventSpacePaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted.includes(" ")) e.preventDefault();
  };

  useEffect(() => {
    if (editing && id) {
      const fetchFAQ = async () => {
        try {
          const data: FAQ = await getFaqById(Number(id));
          setValue("question", data.question);
          setValue("answer", data.answer || "");
          setValue("displayOrder", data.displayOrder);
          setValue("status", data.status);
        } catch (err) {
          console.error("Failed to fetch FAQ:", err);
          toast.error("Failed to load FAQ data");
        }
      };
      fetchFAQ();
    }
  }, [editing, id, setValue]);

  const onSubmit = async (data: FAQFormData) => {
    try {
      if (editing && id) {
        await updateFaq(Number(id), data);
        toast.success("FAQ updated successfully");
      } else {
        await createFaq(data);
        toast.success("FAQ added successfully");
      }
      nav("/faq");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save FAQ");
    }
  };

  return (
    <div>
      <PageHeader title={editing ? "Edit FAQ" : "Add FAQ"} />
      <Toaster position="top-right" reverseOrder={false} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md max-w-xl mx-auto space-y-4 mt-4"
      >
        {/* Question */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            autoFocus
            {...register("question", {
              required: "Question is required",
              maxLength: {
                value: 200,
                message: "Max 200 characters allowed",
              },
            })}
            onKeyDown={preventSpaceInput}
            onPaste={preventSpacePaste}
            className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 ${
              errors.question ? "border-red-500" : ""
            }`}
            placeholder="Enter question"
          />
          {errors.question && (
            <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
          )}
        </div>

        {/* Answer */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Answer <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("answer", {
              required: "Answer is required",
              maxLength: {
                value: 500,
                message: "Max 500 characters allowed",
              },
            })}
            onKeyDown={preventSpaceInput}
            onPaste={preventSpacePaste}
            className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 ${
              errors.answer ? "border-red-500" : ""
            }`}
            rows={4}
            placeholder="Enter answer"
          />
          {errors.answer && (
            <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>
          )}
        </div>

        {/* Display Order & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Display Order <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("displayOrder", {
                required: "Display Order is required",
                min: { value: 1, message: "Minimum order is 1" },
              })}
              onKeyDown={preventSpaceInput}
              onPaste={preventSpacePaste}
              className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 ${
                errors.displayOrder ? "border-red-500" : ""
              }`}
            />
            {errors.displayOrder && (
              <p className="text-red-500 text-sm mt-1">
                {errors.displayOrder.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register("status", { required: "Status is required" })}
              className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 ${
                errors.status ? "border-red-500" : ""
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {editing ? "Update FAQ" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => nav(-1)}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFAQ;


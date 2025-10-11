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
  const editing = Boolean(id); // Flag to check if editing

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<FAQFormData>({
      mode: "onTouched",
      defaultValues: {
        question: "",
        answer: "",
        displayOrder: 1,
        status: "active",
      },
    });

  // Prefill form if editing
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
          toast.error("Failed to load FAQ data ❌");
        }
      };
      fetchFAQ();
    }
  }, [editing, id, setValue]);

  const onSubmit = async (data: FAQFormData) => {
    try {
      if (editing && id) {
        await updateFaq(Number(id), data);
        toast.success("FAQ updated successfully ✅");
      } else {
        await createFaq(data);
        toast.success("FAQ added successfully ✅");
      }
      nav("/faq"); // redirect to list
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save FAQ ❌");
    }
  };

  return (
    <div>
      <PageHeader title={editing ? "Edit FAQ" : "Add FAQ"} />
      <Toaster position="top-right" reverseOrder={false} />

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md max-w-xl mx-auto space-y-4 mt-4">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium mb-1">Question *</label>
          <input
            type="text"
            {...register("question", { required: "Question is required", maxLength: { value: 200, message: "Max 200 characters allowed" } })}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Enter question"
          />
          {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>}
        </div>

        {/* Answer */}
        <div>
          <label className="block text-sm font-medium mb-1">Answer *</label>
          <textarea
            {...register("answer", { required: "Answer is required", maxLength: { value: 500, message: "Max 500 characters allowed" } })}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            rows={4}
            placeholder="Enter answer"
          />
          {errors.answer && <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>}
        </div>

        {/* Display Order & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display Order *</label>
            <input
              type="number"
              {...register("displayOrder", { required: "Display Order is required", min: { value: 1, message: "Minimum order is 1" } })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
            {errors.displayOrder && <p className="text-red-500 text-sm mt-1">{errors.displayOrder.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select {...register("status", { required: "Status is required" })} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {editing ? "Update FAQ" : "Save"}
          </button>
          <button type="button" onClick={() => nav(-1)} className="px-4 py-2 border rounded hover:bg-gray-100">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFAQ;






// src/pages/FAQ/AddFAQ.tsx
// import React from "react";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import PageHeader from "../../components/layout/PageHeader";
// import toast, { Toaster } from "react-hot-toast";
// import { createFaq } from "../../services/faqService";
// import type { FAQStatus } from "../../types/FAQ";

// interface FAQFormData {
//   question: string;
//   answer: string;
//   displayOrder: number;
//   status: FAQStatus;
// }

// const AddFAQ: React.FC = () => {
//   const nav = useNavigate();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<FAQFormData>({
//     mode: "onTouched",
//     defaultValues: {
//       question: "",
//       answer: "",
//       displayOrder: 1,
//       status: "active",
//     },
//   });

//   const onSubmit = async (data: FAQFormData) => {
//     try {
//       await createFaq(data);
//       toast.success("FAQ added successfully ✅");
//       nav("/faq"); // redirect to list page
//     } catch (err) {
//       console.error("Failed to add FAQ:", err);
//       toast.error("Failed to add FAQ ❌");
//     }
//   };

//   return (
//     <div>
//       <PageHeader title="Add FAQ" />
//       <Toaster position="top-right" reverseOrder={false} />

//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="bg-white p-6 rounded shadow-md max-w-xl mx-auto space-y-4 mt-4"
//       >
//         {/* Question */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Question *</label>
//           <input
//             type="text"
//             {...register("question", {
//               required: "Question is required",
//               maxLength: { value: 200, message: "Max 200 characters allowed" },
//             })}
//             className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
//             placeholder="Enter question"
//           />
//           {errors.question && (
//             <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
//           )}
//         </div>

//         {/* Answer */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Answer *</label>
//           <textarea
//             {...register("answer", {
//               required: "Answer is required",
//               maxLength: { value: 500, message: "Max 500 characters allowed" },
//             })}
//             className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
//             rows={4}
//             placeholder="Enter answer"
//           />
//           {errors.answer && (
//             <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>
//           )}
//         </div>

//         {/* Display Order & Status */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Display Order *</label>
//             <input
//               type="number"
//               {...register("displayOrder", {
//                 required: "Display Order is required",
//                 min: { value: 1, message: "Minimum order is 1" },
//               })}
//               className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
//             />
//             {errors.displayOrder && (
//               <p className="text-red-500 text-sm mt-1">{errors.displayOrder.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Status *</label>
//             <select
//               {...register("status", { required: "Status is required" })}
//               className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
//             >
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//             {errors.status && (
//               <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
//             )}
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="flex gap-3">
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//           >
//             Save
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

// export default AddFAQ;




// src/pages/FAQ/FAQList.tsx
import { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { getFaqList, deleteFaq, updateFaq } from "../../services/faqService";
import { useNavigate } from "react-router-dom";
import type { FAQ, FAQStatus } from "../../types/FAQ";
import { Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type FAQSearchKey = "id" | "question" | "answer" | "displayOrder";

const FAQList: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchValues, setSearchValues] = useState<Record<FAQSearchKey, string>>({
    id: "",
    question: "",
    answer: "",
    displayOrder: "",
  });

  // ✅ Status filter state
  const [searchStatus, setSearchStatus] = useState<FAQStatus | "all">("all");

  const nav = useNavigate();

  // Load FAQ list
  const loadFaqs = async () => {
    try {
      setLoading(true);
      const data = await getFaqList();
      setFaqs(data);
      setFilteredFaqs(data);
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
      toast.error("Failed to load FAQs ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  // ✅ Filtering logic
  useEffect(() => {
    const filtered = faqs.filter((f) => {
      const matchesId = f.id.toString().includes(searchValues.id);
      const matchesQuestion = f.question.toLowerCase().includes(searchValues.question.toLowerCase());
      const matchesAnswer = (f.answer || "").toLowerCase().includes(searchValues.answer.toLowerCase());
      const matchesOrder = f.displayOrder.toString().includes(searchValues.displayOrder);
      const matchesStatus = searchStatus === "all" ? true : f.status === searchStatus;

      return matchesId && matchesQuestion && matchesAnswer && matchesOrder && matchesStatus;
    });

    setFilteredFaqs(filtered);
  }, [searchValues, searchStatus, faqs]);

  // Toggle FAQ status
  const handleToggle = async (faq: FAQ) => {
    const newStatus: FAQStatus = faq.status === "active" ? "inactive" : "active";
    try {
      await updateFaq(faq.id, { status: newStatus });
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, status: newStatus } : f))
      );
      toast.success(`FAQ marked ${newStatus} ✅`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status ❌");
    }
  };

  // Delete FAQ
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await deleteFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      toast.success("FAQ deleted successfully ✅");
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
      toast.error("Failed to delete FAQ ❌");
    }
  };

  return (
    <div>
      <PageHeader
        title="FAQs"
        right={
          <button
            onClick={() => nav("/faq/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add FAQ
          </button>
        }
      />
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading FAQs...</div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Question</th>
                <th className="p-3 text-left">Answer</th>
                <th className="p-3 text-left">Display Order</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>

              {/* ✅ Search Row */}
              <tr className="bg-gray-100">
                {(Object.keys(searchValues) as FAQSearchKey[]).map((key) => (
                  <th key={key} className="p-2">
                    <input
                      type="text"
                      placeholder={`Search ${key}`}
                      className="border p-1 text-sm rounded w-full"
                      value={searchValues[key]}
                      onChange={(e) =>
                        setSearchValues({ ...searchValues, [key]: e.target.value })
                      }
                    />
                  </th>
                ))}

                {/* ✅ Status dropdown */}
                <th className="p-2">
                  <select
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value as FAQStatus | "all")}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </th>

                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500 italic">
                    No FAQs found.
                  </td>
                </tr>
              ) : (
                filteredFaqs.map((f) => (
                  <tr key={f.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{f.id}</td>
                    <td className="p-3">{f.question}</td>
                    <td className="p-3">{f.answer || "-"}</td>
                    <td className="p-3">{f.displayOrder}</td>

                    {/* Toggle Status */}
                    <td className="p-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={f.status === "active"}
                          onChange={() => handleToggle(f)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer
                          peer-checked:bg-green-500
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                          after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                          peer-checked:after:translate-x-full"></div>
                      </label>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center space-x-3">
                      <button
                        onClick={() => nav(`/faq/edit/${f.id}`)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit FAQ"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete FAQ"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FAQList;







// src/pages/FAQ/FAQList.tsx
// import { useEffect, useState } from "react";
// import PageHeader from "../../components/layout/PageHeader";
// import { getFaqList, deleteFaq, updateFaq } from "../../services/faqService";
// import { useNavigate } from "react-router-dom";
// import type { FAQ, FAQStatus } from "../../types/FAQ";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// type FAQSearchKey = "id" | "question" | "answer" | "displayOrder";

// const FAQList: React.FC = () => {
//   const [faqs, setFaqs] = useState<FAQ[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchValues, setSearchValues] = useState<Record<FAQSearchKey, string>>({
//     id: "",
//     question: "",
//     answer: "",
//     displayOrder: "",
//   });

//   const nav = useNavigate();

//   // Load FAQ list with optional search
//   const loadFaqs = async (column?: FAQSearchKey, value?: string) => {
//     try {
//       setLoading(true);
//       let data = await getFaqList();

//       if (column && value) {
//         data = data.filter((f) =>
//           f[column]
//             ?.toString()
//             .toLowerCase()
//             .includes(value.toLowerCase())
//         );
//       }

//       setFaqs(data);
//     } catch (err) {
//       console.error("Failed to fetch FAQs:", err);
//       toast.error("Failed to load FAQs ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadFaqs();
//   }, []);

//   // Debounce search
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       const key = (Object.keys(searchValues).find(
//         (k) => searchValues[k as FAQSearchKey]
//       ) as FAQSearchKey | undefined) ?? undefined;

//       if (key) {
//         loadFaqs(key, searchValues[key]);
//       } else {
//         loadFaqs();
//       }
//     }, 500);

//     return () => clearTimeout(timeout);
//   }, [searchValues]);

//   // Toggle FAQ status
//   const handleToggle = async (faq: FAQ) => {
//     const newStatus: FAQStatus = faq.status === "active" ? "inactive" : "active";
//     try {
//       await updateFaq(faq.id, { status: newStatus });
//       setFaqs((prev) =>
//         prev.map((f) => (f.id === faq.id ? { ...f, status: newStatus } : f))
//       );
//       toast.success(`FAQ marked ${newStatus} ✅`);
//     } catch (err) {
//       console.error("Failed to update status:", err);
//       toast.error("Failed to update status ❌");
//     }
//   };

//   // Delete FAQ
//   const handleDelete = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this FAQ?")) return;
//     try {
//       await deleteFaq(id);
//       setFaqs((prev) => prev.filter((f) => f.id !== id));
//       toast.success("FAQ deleted successfully ✅");
//     } catch (err) {
//       console.error("Failed to delete FAQ:", err);
//       toast.error("Failed to delete FAQ ❌");
//     }
//   };

//   return (
//     <div>
//       <PageHeader
//         title="FAQs"
//         right={
//           <button
//             onClick={() => nav("/faq/add")}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Add FAQ
//           </button>
//         }
//       />
//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="text-center py-6 text-gray-500">Loading FAQs...</div>
//         ) : (
//           <table className="min-w-full border text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-3 text-left">ID</th>
//                 <th className="p-3 text-left">Question</th>
//                 <th className="p-3 text-left">Answer</th>
//                 <th className="p-3 text-left">Display Order</th>
//                 <th className="p-3 text-left">Status</th>
//                 <th className="p-3 text-center">Actions</th>
//               </tr>
//               <tr className="border-t">
//                 {(Object.keys(searchValues) as FAQSearchKey[]).map((key) => (
//                   <th key={key} className="p-2">
//                     <input
//                       type="text"
//                       placeholder={`Search ${key}`}
//                       className="border p-1 text-sm rounded w-full"
//                       value={searchValues[key]}
//                       onChange={(e) =>
//                         setSearchValues({ ...searchValues, [key]: e.target.value })
//                       }
//                     />
//                   </th>
//                 ))}
//                 <th></th>
//               </tr>
//             </thead>
//             <tbody>
//               {faqs.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="text-center p-4 text-gray-500 italic">
//                     No FAQs found.
//                   </td>
//                 </tr>
//               ) : (
//                 faqs.map((f) => (
//                   <tr key={f.id} className="border-t hover:bg-gray-50">
//                     <td className="p-3">{f.id}</td>
//                     <td className="p-3">{f.question}</td>
//                     <td className="p-3">{f.answer || "-"}</td>
//                     <td className="p-3">{f.displayOrder}</td>

//                     {/* Toggle Status */}
//                     <td className="p-3">
//                       <label className="relative inline-flex items-center cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={f.status === "active"}
//                           onChange={() => handleToggle(f)}
//                           className="sr-only peer"
//                         />
//                         <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer
//                           peer-checked:bg-green-500
//                           after:content-[''] after:absolute after:top-[2px] after:left-[2px]
//                           after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
//                           peer-checked:after:translate-x-full"></div>
//                       </label>
//                     </td>

//                     {/* Actions */}
//                     <td className="p-3 text-center space-x-3">
//                       <button
//                         onClick={() => nav(`/faq/edit/${f.id}`)}
//                         className="text-yellow-600 hover:text-yellow-800"
//                         title="Edit FAQ"
//                       >
//                         <Edit size={18} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(f.id)}
//                         className="text-red-600 hover:text-red-800"
//                         title="Delete FAQ"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FAQList;



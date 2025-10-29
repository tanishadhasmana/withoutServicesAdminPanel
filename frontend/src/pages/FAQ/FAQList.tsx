// frontend/src/pages/FAQ/FAQList.tsx
import React, { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { getFaqList, deleteFaq, updateFaq } from "../../services/faqService";
import { useNavigate } from "react-router-dom";
import type { FAQ, FAQStatus } from "../../types/FAQ";
import { Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert";
import Pagination from "../../components/common/Pagination";

type FAQSearchKey = "id" | "question" | "answer" | "displayOrder";

const FAQList: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters (server-side)
  const [searchValues, setSearchValues] = useState<Record<FAQSearchKey, string>>({
    id: "",
    question: "",
    answer: "",
    displayOrder: "",
  });
  const [searchStatus, setSearchStatus] = useState<FAQStatus | "all">("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const nav = useNavigate();

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Helper to handle space-prevention
  const handleSearchInputChange = (key: FAQSearchKey, value: string) => {
    if (value.trimStart() === "" && value.length > 0) return;
    const cleanedValue = value.replace(/\s{2,}/g, " ");
    setSearchValues((prev) => ({ ...prev, [key]: cleanedValue }));
    setCurrentPage(1);
  };

  // fetch from server
  const loadFaqs = useCallback(
    async (page = 1, lim = limit, sb?: string, so?: "asc" | "desc") => {
      try {
        setLoading(true);
        const params = {
          id: searchValues.id || undefined,
          question: searchValues.question || undefined,
          answer: searchValues.answer || undefined,
          displayOrder: searchValues.displayOrder || undefined,
          status: searchStatus !== "all" ? searchStatus : undefined,
          page,
          limit: lim,
          sortBy: sb ?? sortBy,
          order: so ?? sortOrder,
        };
        const data = await getFaqList(params);
        setFaqs(Array.isArray(data.items) ? data.items : data.items || []);
        setTotalPages(data.totalPages || Math.ceil((data.total || 0) / lim) || 1);
        setCurrentPage(data.currentPage || page);
      } catch (err) {
        console.error("Failed to fetch FAQs:", err);
        toast.error("Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    },
    [searchValues, searchStatus, limit, sortBy, sortOrder]
  );

  // initial + when filters / limit / sort change
  useEffect(() => {
    // whenever filters, status, limit, or sorting changes, fetch page 1
    loadFaqs(1, limit, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValues, searchStatus, limit, sortBy, sortOrder]);

  useEffect(() => {
    // when page changes
    loadFaqs(currentPage, limit, sortBy, sortOrder);
  }, [currentPage, loadFaqs, limit, sortBy, sortOrder]);

  // sorting handler: ASC -> DESC -> NONE (same as users/roles)
  const handleSort = (columnKey: string) => {
    if (sortBy !== columnKey) {
      // new column => ASC
      setSortBy(columnKey);
      setSortOrder("asc");
      loadFaqs(1, limit, columnKey, "asc");
      return;
    }

    if (sortOrder === "asc") {
      setSortOrder("desc");
      loadFaqs(1, limit, columnKey, "desc");
      return;
    }

    if (sortOrder === "desc") {
      // turn off sorting
      setSortBy(undefined);
      setSortOrder("desc");
      loadFaqs(1, limit, undefined, undefined);
      return;
    }
  };

  // UI helper to render arrow
  const SortArrow = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return (
        <span className="inline-block ml-2 opacity-50 select-none" aria-hidden>
          ▲▼
        </span>
      );
    }
    return sortOrder === "asc" ? (
      <span className="inline-block ml-2 select-none">▲</span>
    ) : (
      <span className="inline-block ml-2 select-none">▼</span>
    );
  };

  // Toggle FAQ status
  const handleToggle = async (faq: FAQ) => {
    const newStatus: FAQStatus = faq.status === "active" ? "inactive" : "active";
    try {
      await updateFaq(faq.id, { status: newStatus });
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, status: newStatus } : f)));
      toast.success(`FAQ marked ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status");
    }
  };

  // Delete FAQ
  // const handleDelete = async (id: number) => {
  //   if (!confirm("Are you sure you want to delete this FAQ?")) return;
  //   try {
  //     await deleteFaq(id);
  //     setFaqs((prev) => prev.filter((f) => f.id !== id));
  //     toast.success("FAQ deleted successfully");
  //     // reload current page (keeps sort/pagination)
  //     loadFaqs(currentPage, limit, sortBy, sortOrder);
  //   } catch (err) {
  //     console.error("Failed to delete FAQ:", err);
  //     toast.error("Failed to delete FAQ");
  //   }
  // };

const handleDeleteConfirmed = async (id: number, onClose: () => void) => {
  try {
    await deleteFaq(id);
    setFaqs((prev) => prev.filter((r) => r.id !== id));
    toast.success("Role deleted successfully");
    onClose();
  } catch (err) {
    console.error("Delete failed:", err);
    toast.error("Failed to delete role");
    onClose();
  }
};

const confirmDelete = (id: number) => {
  confirmAlert({
    customUI: ({ onClose }) => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Are you sure you want to delete this faq?</h3>
          <p className="text-gray-600 mb-6 text-center">This action cannot be undone.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteConfirmed(id, onClose)}
              className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ),
  });
};

  return (
    <div>
      <PageHeader
        title="FAQs"
        right={
          <div className="flex gap-2">
            {/* Export CSV */}
            <button /* ... same as before ... */ className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer">
              Export CSV
            </button>
            <button onClick={() => nav("/faq/add")} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer">
              Add FAQ
            </button>
          </div>
        }
      />

      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading FAQs...</div>
        ) : (
          <>
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">
                    <button className="flex items-center" onClick={() => handleSort("id")}>ID <SortArrow column="id" /></button>
                  </th>
                  <th className="p-3 text-left">
                    <button className="flex items-center" onClick={() => handleSort("question")}>Question <SortArrow column="question" /></button>
                  </th>
                  <th className="p-3 text-left">
                    <button className="flex items-center" onClick={() => handleSort("answer")}>Answer <SortArrow column="answer" /></button>
                  </th>
                  <th className="p-3 text-left">
                    <button className="flex items-center" onClick={() => handleSort("displayOrder")}>Display Order <SortArrow column="displayOrder" /></button>
                  </th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>

                {/* Search Row (unchanged) */}
                <tr className="bg-gray-100">
                  {(Object.keys(searchValues) as FAQSearchKey[]).map((key) => (
                    <th key={key} className="p-2">
                      <input type="text" placeholder={`Search ${key}`} className="border p-1 text-sm rounded w-full" value={searchValues[key]} onChange={(e) => handleSearchInputChange(key, e.target.value)} />
                    </th>
                  ))}
                  <th className="p-2">
                    <select value={searchStatus} onChange={(e) => { setSearchStatus(e.target.value as FAQStatus | "all"); setCurrentPage(1); }} className="w-full border rounded px-2 py-1 text-sm">
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {faqs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-500 italic">No FAQs found.</td>
                  </tr>
                ) : (
                  faqs.map((f) => (
                    <tr key={f.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{f.id}</td>
                      <td className="p-3">{f.question}</td>
                      <td className="p-3">{f.answer || "-"}</td>
                      <td className="p-3">{f.displayOrder}</td>
                      <td className="p-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={f.status === "active"} onChange={() => handleToggle(f)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-300 peer-checked:bg-green-500 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                      </td>
                      <td className="p-3 text-center space-x-3">
                        <button onClick={() => nav(`/faq/edit/${f.id}`)} className="text-yellow-600 hover:text-yellow-800 cursor-pointer" title="Edit FAQ"><Edit size={18} /></button>
                        <button onClick={() => confirmDelete(f.id)} className="text-red-600 hover:text-red-800 cursor-pointer" title="Delete FAQ"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex justify-end items-center p-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                limit={limit}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setCurrentPage(1);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FAQList;




// src/pages/FAQ/FAQList.tsx
// import React, { useCallback, useEffect, useState } from "react";
// import PageHeader from "../../components/layout/PageHeader";
// import { getFaqList, deleteFaq, updateFaq } from "../../services/faqService";
// import { useNavigate } from "react-router-dom";
// import type { FAQ, FAQStatus } from "../../types/FAQ";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Pagination from "../../components/common/Pagination";

// type FAQSearchKey = "id" | "question" | "answer" | "displayOrder";

// const FAQList: React.FC = () => {
//   const [faqs, setFaqs] = useState<FAQ[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Filters (server-side)
//   const [searchValues, setSearchValues] = useState<Record<FAQSearchKey, string>>({
//     id: "",
//     question: "",
//     answer: "",
//     displayOrder: "",
//   });
//   const [searchStatus, setSearchStatus] = useState<FAQStatus | "all">("all");

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [limit, setLimit] = useState<number>(10);
//   const [totalPages, setTotalPages] = useState<number>(1);

//   const nav = useNavigate();

//   // Helper to handle space-prevention
//   const handleSearchInputChange = (key: FAQSearchKey, value: string) => {
//     // Prevent inputs that start with a space or contain only spaces
//     if (value.trimStart() === "" && value.length > 0) return;
//     const cleanedValue = value.replace(/\s{2,}/g, " "); // Replace multiple spaces with single
//     setSearchValues((prev) => ({ ...prev, [key]: cleanedValue }));
//     setCurrentPage(1);
//   };

//   // fetch from server
//   const loadFaqs = useCallback(
//     async (page = currentPage, lim = limit) => {
//       try {
//         setLoading(true);
//         const params = {
//           id: searchValues.id || undefined,
//           question: searchValues.question || undefined,
//           answer: searchValues.answer || undefined,
//           displayOrder: searchValues.displayOrder || undefined,
//           status: searchStatus !== "all" ? searchStatus : undefined,
//           page,
//           limit: lim,
//         };
//         const data = await getFaqList(params);
//         // data expected: { items, total, totalPages, currentPage }
//         setFaqs(Array.isArray(data.items) ? data.items : []);
//         setTotalPages(data.totalPages || Math.ceil((data.total || 0) / lim) || 1);
//         setCurrentPage(data.currentPage || page);
//       } catch (err) {
//         console.error("Failed to fetch FAQs:", err);
//         toast.error("Failed to load FAQs");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [searchValues, searchStatus, currentPage, limit]
//   );

//   // initial + when filters / page / limit change
//   useEffect(() => {
//     loadFaqs(1, limit);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [searchValues, searchStatus, limit]);

//   useEffect(() => {
//     loadFaqs(currentPage, limit);
//   }, [currentPage, loadFaqs, limit]);

//   // Toggle FAQ status
//   const handleToggle = async (faq: FAQ) => {
//     const newStatus: FAQStatus = faq.status === "active" ? "inactive" : "active";
//     try {
//       await updateFaq(faq.id, { status: newStatus });
//       setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, status: newStatus } : f)));
//       toast.success(`FAQ marked ${newStatus}`);
//     } catch (err) {
//       console.error("Failed to update status:", err);
//       toast.error("Failed to update status");
//     }
//   };

//   // Delete FAQ
//   const handleDelete = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this FAQ?")) return;
//     try {
//       await deleteFaq(id);
//       setFaqs((prev) => prev.filter((f) => f.id !== id));
//       toast.success("FAQ deleted successfully");
//       loadFaqs(currentPage, limit);
//     } catch (err) {
//       console.error("Failed to delete FAQ:", err);
//       toast.error("Failed to delete FAQ");
//     }
//   };

//   return (
//     <div>
//       {/* <PageHeader
//         title="FAQs"
//         right={
//           <button
//             onClick={() => nav("/faq/add")}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Add FAQ
//           </button>
//         }
//       /> */}
// {/* replaced this for export csv btn  */}
// <PageHeader
//   title="FAQs"
//   right={
//     <div className="flex gap-2">
//       {/* ✅ Export CSV Button */}
//       <button
//         onClick={() => {
//           if (!faqs.length) {
//             toast.error("No FAQs to export");
//             return;
//           }

//           // Convert FAQs to CSV
//           const headers = ["ID", "Question", "Answer", "Display Order", "Status"];
//           const csvRows = [
//             headers.join(","), // header row
//             ...faqs.map((f) =>
//               [
//                 f.id,
//                 `"${f.question.replace(/"/g, '""')}"`,
//                 `"${(f.answer || "-").replace(/"/g, '""')}"`,
//                 f.displayOrder,
//                 f.status,
//               ].join(",")
//             ),
//           ];

//           const blob = new Blob([csvRows.join("\n")], {
//             type: "text/csv;charset=utf-8;",
//           });
//           const url = window.URL.createObjectURL(blob);

//           const link = document.createElement("a");
//           link.href = url;
//           link.setAttribute("download", "faqs_export.csv");
//           document.body.appendChild(link);
//           link.click();
//           document.body.removeChild(link);

//           toast.success("CSV exported successfully");
//         }}
//         className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer"
//       >
//         Export CSV
//       </button>

//       {/* ✅ Add FAQ Button */}
//       <button
//         onClick={() => nav("/faq/add")}
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer"
//       >
//         Add FAQ
//       </button>
//     </div>
//   }
// />


//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="text-center py-6 text-gray-500">Loading FAQs...</div>
//         ) : (
//           <>
//             <table className="min-w-full border text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="p-3 text-left">ID</th>
//                   <th className="p-3 text-left">Question</th>
//                   <th className="p-3 text-left">Answer</th>
//                   <th className="p-3 text-left">Display Order</th>
//                   <th className="p-3 text-left">Status</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>

//                 {/* 🔍 Search Row */}
//                 <tr className="bg-gray-100">
//                   {(Object.keys(searchValues) as FAQSearchKey[]).map((key) => (
//                     <th key={key} className="p-2">
//                       <input
//                         type="text"
//                         placeholder={`Search ${key}`}
//                         className="border p-1 text-sm rounded w-full"
//                         value={searchValues[key]}
//                         onChange={(e) =>
//                           handleSearchInputChange(key, e.target.value)
//                         }
//                       />
//                     </th>
//                   ))}

//                   {/* Status dropdown */}
//                   <th className="p-2">
//                     <select
//                       value={searchStatus}
//                       onChange={(e) => setSearchStatus(e.target.value as FAQStatus | "all")}
//                       className="w-full border rounded px-2 py-1 text-sm"
//                     >
//                       <option value="all">All</option>
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </th>

//                   <th></th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {faqs.length === 0 ? (
//                   <tr>
//                     <td colSpan={6} className="text-center p-4 text-gray-500 italic">
//                       No FAQs found.
//                     </td>
//                   </tr>
//                 ) : (
//                   faqs.map((f) => (
//                     <tr key={f.id} className="border-t hover:bg-gray-50">
//                       <td className="p-3">{f.id}</td>
//                       <td className="p-3">{f.question}</td>
//                       <td className="p-3">{f.answer || "-"}</td>
//                       <td className="p-3">{f.displayOrder}</td>

//                       <td className="p-3">
//                         <label className="relative inline-flex items-center cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={f.status === "active"}
//                             onChange={() => handleToggle(f)}
//                             className="sr-only peer"
//                           />
//                           <div
//                             className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 
//                             peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-green-500
//                             after:content-[''] after:absolute after:top-[2px] after:left-[2px]
//                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
//                             peer-checked:after:translate-x-full"
//                           ></div>
//                         </label>
//                       </td>

//                       <td className="p-3 text-center space-x-3">
//                         <button
//                           onClick={() => nav(`/faq/edit/${f.id}`)}
//                           className="text-yellow-600 hover:text-yellow-800"
//                           title="Edit FAQ"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(f.id)}
//                           className="text-red-600 hover:text-red-800"
//                           title="Delete FAQ"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>

//             {/* Pagination (right) */}
//             <div className="flex justify-end items-center p-3">
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={(p) => setCurrentPage(p)}
//                 limit={limit}
//                 onLimitChange={(newLimit) => {
//                   setLimit(newLimit);
//                   setCurrentPage(1);
//                 }}
//               />
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FAQList;


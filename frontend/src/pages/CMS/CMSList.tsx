// src/pages/CMS/CMSList.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Pagination from "../../components/common/Pagination";
import { getCmsList, updateCms, deleteCms } from "../../services/cmsService";
import type { CMS, CMSStatus, CMSFormData } from "../../types/CMS";
import { Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert";

import { RingLoader } from "react-spinners";

const CMSList: React.FC = () => {
  const [cmsList, setCmsList] = useState<CMS[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchId, setSearchId] = useState<string>("");
  const [searchKey, setSearchKey] = useState<string>("");
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [searchStatus, setSearchStatus] = useState<"" | CMSStatus>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const nav = useNavigate();

  // Sorting state (same pattern as Users/Roles)
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleCleanInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const cleaned = e.target.value.replace(/^\s+|\s+$/g, "");
    setter(cleaned);
    setCurrentPage(1);
  };

  const handlePreventSpace = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === " " &&
      (e.currentTarget.selectionStart === 0 || !e.currentTarget.value.trim())
    ) {
      e.preventDefault();
    }
  };

  // fetchCMS now includes sortBy & sortOrder
  const fetchCMS = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getCmsList({
        id: searchId || undefined,
        key: searchKey || undefined,
        title: searchTitle || undefined,
        status: searchStatus || undefined,
        page: currentPage,
        limit,
        sortBy,
        order: sortOrder,
      });

      if (Array.isArray(data)) {
        setCmsList(data);
        setTotalPages(1);
      } else if (data && typeof data === "object") {
        setCmsList(data.cms || data.items || data.data || []);
        setTotalPages(
          data.totalPages || Math.ceil((data.total || 0) / limit) || 1
        );
      } else {
        setCmsList([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch CMS:", err);
      toast.error("Failed to load CMS pages");
    } finally {
      setLoading(false);
    }
  }, [
    searchId,
    searchKey,
    searchTitle,
    searchStatus,
    currentPage,
    limit,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    // Debounce like others — small delay makes UI consistent with your other pages
    const timeout = setTimeout(() => {
      fetchCMS();
    }, 250);

    return () => clearTimeout(timeout);
  }, [fetchCMS]);

  // Sorting handler (cycle: set ASC -> DESC -> NONE)
  const handleSort = (columnKey: string) => {
    if (sortBy !== columnKey) {
      setSortBy(columnKey);
      setSortOrder("asc");
      setCurrentPage(1);
      return;
    }

    if (sortOrder === "asc") {
      setSortOrder("desc");
      setCurrentPage(1);
      return;
    }

    // asc -> desc already handled; if desc, clear sorting
    if (sortOrder === "desc") {
      setSortBy(undefined);
      setSortOrder("desc"); // keep default for later
      setCurrentPage(1);
      return;
    }
  };

  // Delete & Toggle handlers (unchanged mostly)
  // const handleDelete = async (id: number) => {
  //   if (!window.confirm("Are you sure you want to delete this CMS page?"))
  //     return;
  //   try {
  //     await deleteCms(id);
  //     setCmsList((prev) => prev.filter((c) => c.id !== id));
  //     toast.success("CMS deleted successfully ");
  //   } catch (err) {
  //     console.error("❌ Delete failed:", err);
  //     toast.error("Failed to delete CMS");
  //   }
  // };
  const handleDeleteConfirmed = async (id: number, onClose: () => void) => {
  try {
    await deleteCms(id);
    setCmsList((prev) => prev.filter((r) => r.id !== id));
    toast.success("CMS page deleted successfully");
    onClose();
  } catch (err) {
    console.error("Delete failed:", err);
    toast.error("Failed to delete cms page");
    onClose();
  }
};

const confirmDelete = (id: number) => {
  confirmAlert({
    customUI: ({ onClose }) => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Are you sure you want to delete this cms page?</h3>
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

  const handleToggle = async (cms: CMS) => {
    const newStatus: CMSStatus = cms.status === "active" ? "inactive" : "active";
    const payload: CMSFormData = {
      key: cms.key,
      title: cms.title || "",
      metaKeyword: cms.metaKeyword || "",
      metaTitle: cms.metaTitle || "",
      metaDescription: cms.metaDescription || "",
      content: cms.content || "",
      status: newStatus,
    };

    try {
      await updateCms(cms.id, payload);
      setCmsList((prev) => prev.map((c) => (c.id === cms.id ? { ...c, status: newStatus } : c)));
      toast.success(newStatus === "active" ? "CMS marked as active " : "CMS marked as inactive ");
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status");
    }
  };

  // UI arrow same pattern as Users
  const SortArrow = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return (
        <span className="inline-block ml-2 opacity-50 select-none" aria-hidden>
          ▲▼
        </span>
      );
    }
    return sortOrder === "asc" ? <span className="inline-block ml-2 select-none">▲</span> : <span className="inline-block ml-2 select-none">▼</span>;
  };

  return (
    <div>
      <PageHeader
        title="CMS Pages"
        right={
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!cmsList.length) {
                  toast.error("No CMS pages to export ");
                  return;
                }
                const headers = ["ID", "Key", "Title", "Status"];
                const csvRows = [headers.join(","), ...cmsList.map((c) => [c.id, `"${c.key}"`, `"${c.title || "-"}"`, `"${c.status}"`].join(","))];
                const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "cms_export.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("CSV exported successfully ");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer"
            >
              Export CSV
            </button>

            <button onClick={() => nav("/cms/add")} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer">
              Add CMS
            </button>
          </div>
        }
      />

      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="min-h-[500px] flex justify-center items-center">
            <RingLoader size={80} />
          </div>
        ) : (
          <>
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">
                    <button className="flex items-center" onClick={() => handleSort("id")} aria-label="Sort by ID">
                      ID <SortArrow column="id" />
                    </button>
                  </th>
                  <th className="p-3 text-left">
                    <button className="flex items-center" onClick={() => handleSort("key")} aria-label="Sort by Key">
                      Key <SortArrow column="key" />
                    </button>
                  </th>
                  <th className="p-3 text-left">
                    <button className="flex items-center" onClick={() => handleSort("title")} aria-label="Sort by Title">
                      Title <SortArrow column="title" />
                    </button>
                  </th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>

                <tr className="bg-gray-100">
                  <th className="p-2">
                    <input type="text" placeholder="Search ID" value={searchId} onChange={(e) => handleCleanInput(e, setSearchId)} onKeyDown={handlePreventSpace} className="w-full border rounded px-2 py-1 text-sm" />
                  </th>
                  <th className="p-2">
                    <input type="text" placeholder="Search Key" value={searchKey} onChange={(e) => handleCleanInput(e, setSearchKey)} onKeyDown={handlePreventSpace} className="w-full border rounded px-2 py-1 text-sm" />
                  </th>
                  <th className="p-2">
                    <input type="text" placeholder="Search Title" value={searchTitle} onChange={(e) => handleCleanInput(e, setSearchTitle)} onKeyDown={handlePreventSpace} className="w-full border rounded px-2 py-1 text-sm" />
                  </th>
                  <th className="p-2">
                    <select value={searchStatus} onChange={(e) => { setSearchStatus(e.target.value as "" | CMSStatus); setCurrentPage(1); }} className="w-full border rounded px-2 py-1 text-sm">
                      <option value="">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {cmsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500 italic">No CMS pages found.</td>
                  </tr>
                ) : (
                  cmsList.map((cms) => (
                    <tr key={cms.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{cms.id}</td>
                      <td className="p-3">{cms.key}</td>
                      <td className="p-3">{cms.title || "-"}</td>
                      <td className="p-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={cms.status === "active"} onChange={() => handleToggle(cms)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full "></div>
                        </label>
                      </td>
                      <td className="p-3 text-center space-x-3">
                        <button onClick={() => nav(`/cms/edit/${cms.id}`)} className="text-yellow-600 hover:text-yellow-800 cursor-pointer" title="Edit CMS"><Edit size={18} /></button>
                        <button onClick={() => confirmDelete(cms.id)} className="text-red-600 hover:text-red-800 cursor-pointer" title="Delete CMS"><Trash2 size={18} /></button>
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
                onPageChange={(page) => { setCurrentPage(page); }}
                limit={limit}
                onLimitChange={(newLimit) => { setLimit(newLimit); setCurrentPage(1); }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CMSList;







// src/pages/CMS/CMSList.tsx
// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import PageHeader from "../../components/layout/PageHeader";
// import Pagination from "../../components/common/Pagination";
// import { getCmsList, updateCms, deleteCms } from "../../services/cmsService";
// import type { CMS, CMSStatus, CMSFormData } from "../../types/CMS";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import { RingLoader } from "react-spinners";

// const CMSList: React.FC = () => {
//   const [cmsList, setCmsList] = useState<CMS[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   // Filters
//   const [searchId, setSearchId] = useState<string>("");
//   const [searchKey, setSearchKey] = useState<string>("");
//   const [searchTitle, setSearchTitle] = useState<string>("");
//   const [searchStatus, setSearchStatus] = useState<"" | CMSStatus>("");

//   // Pagination
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [limit, setLimit] = useState<number>(10);
//   const [totalPages, setTotalPages] = useState<number>(1);

//   const nav = useNavigate();

//   // Sorting state (same pattern as Users/Roles)
//   const [sortBy, setSortBy] = useState<string | undefined>(undefined);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

//   const handleCleanInput = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     setter: React.Dispatch<React.SetStateAction<string>>
//   ) => {
//     const cleaned = e.target.value.replace(/^\s+|\s+$/g, "");
//     setter(cleaned);
//     setCurrentPage(1);
//   };

//   const handlePreventSpace = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (
//       e.key === " " &&
//       (e.currentTarget.selectionStart === 0 || !e.currentTarget.value.trim())
//     ) {
//       e.preventDefault();
//     }
//   };

//   // fetchCMS now includes sortBy & sortOrder
//   const fetchCMS = useCallback(async () => {
//     try {
//       setLoading(true);

//       const data = await getCmsList({
//         id: searchId || undefined,
//         key: searchKey || undefined,
//         title: searchTitle || undefined,
//         status: searchStatus || undefined,
//         page: currentPage,
//         limit,
//         sortBy,
//         order: sortOrder,
//       });

//       if (Array.isArray(data)) {
//         setCmsList(data);
//         setTotalPages(1);
//       } else if (data && typeof data === "object") {
//         setCmsList(data.cms || data.items || data.data || []);
//         setTotalPages(
//           data.totalPages || Math.ceil((data.total || 0) / limit) || 1
//         );
//       } else {
//         setCmsList([]);
//         setTotalPages(1);
//       }
//     } catch (err) {
//       console.error("Failed to fetch CMS:", err);
//       toast.error("Failed to load CMS pages");
//     } finally {
//       setLoading(false);
//     }
//   }, [
//     searchId,
//     searchKey,
//     searchTitle,
//     searchStatus,
//     currentPage,
//     limit,
//     sortBy,
//     sortOrder,
//   ]);

//   useEffect(() => {
//     // Debounce like others — small delay makes UI consistent with your other pages
//     const timeout = setTimeout(() => {
//       fetchCMS();
//     }, 250);

//     return () => clearTimeout(timeout);
//   }, [fetchCMS]);

//   // Sorting handler (cycle: set ASC -> DESC -> NONE)
//   const handleSort = (columnKey: string) => {
//     if (sortBy !== columnKey) {
//       setSortBy(columnKey);
//       setSortOrder("asc");
//       setCurrentPage(1);
//       return;
//     }

//     if (sortOrder === "asc") {
//       setSortOrder("desc");
//       setCurrentPage(1);
//       return;
//     }

//     // asc -> desc already handled; if desc, clear sorting
//     if (sortOrder === "desc") {
//       setSortBy(undefined);
//       setSortOrder("desc"); // keep default for later
//       setCurrentPage(1);
//       return;
//     }
//   };

//   // Delete & Toggle handlers (unchanged mostly)
//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this CMS page?"))
//       return;
//     try {
//       await deleteCms(id);
//       setCmsList((prev) => prev.filter((c) => c.id !== id));
//       toast.success("CMS deleted successfully ");
//     } catch (err) {
//       console.error("❌ Delete failed:", err);
//       toast.error("Failed to delete CMS");
//     }
//   };

//   const handleToggle = async (cms: CMS) => {
//     const newStatus: CMSStatus = cms.status === "active" ? "inactive" : "active";
//     const payload: CMSFormData = {
//       key: cms.key,
//       title: cms.title || "",
//       metaKeyword: cms.metaKeyword || "",
//       metaTitle: cms.metaTitle || "",
//       metaDescription: cms.metaDescription || "",
//       content: cms.content || "",
//       status: newStatus,
//     };

//     try {
//       await updateCms(cms.id, payload);
//       setCmsList((prev) => prev.map((c) => (c.id === cms.id ? { ...c, status: newStatus } : c)));
//       toast.success(newStatus === "active" ? "CMS marked as active " : "CMS marked as inactive ");
//     } catch (err) {
//       console.error("Status update failed:", err);
//       toast.error("Failed to update status");
//     }
//   };

//   // UI arrow same pattern as Users
//   const SortArrow = ({ column }: { column: string }) => {
//     if (sortBy !== column) {
//       return (
//         <span className="inline-block ml-2 opacity-50 select-none" aria-hidden>
//           ▲▼
//         </span>
//       );
//     }
//     return sortOrder === "asc" ? <span className="inline-block ml-2 select-none">▲</span> : <span className="inline-block ml-2 select-none">▼</span>;
//   };

//   return (
//     <div>
//       <PageHeader
//         title="CMS Pages"
//         right={
//           <div className="flex gap-2">
//             <button
//               onClick={() => {
//                 if (!cmsList.length) {
//                   toast.error("No CMS pages to export ");
//                   return;
//                 }
//                 const headers = ["ID", "Key", "Title", "Status"];
//                 const csvRows = [headers.join(","), ...cmsList.map((c) => [c.id, `"${c.key}"`, `"${c.title || "-"}"`, `"${c.status}"`].join(","))];
//                 const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
//                 const url = window.URL.createObjectURL(blob);
//                 const link = document.createElement("a");
//                 link.href = url;
//                 link.setAttribute("download", "cms_export.csv");
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);
//                 toast.success("CSV exported successfully ");
//               }}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer"
//             >
//               Export CSV
//             </button>

//             <button onClick={() => nav("/cms/add")} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer">
//               Add CMS
//             </button>
//           </div>
//         }
//       />

//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="min-h-[500px] flex justify-center items-center">
//             <RingLoader size={80} />
//           </div>
//         ) : (
//           <>
//             <table className="min-w-full border text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="p-3 text-left">
//                     <button className="flex items-center" onClick={() => handleSort("id")} aria-label="Sort by ID">
//                       ID <SortArrow column="id" />
//                     </button>
//                   </th>
//                   <th className="p-3 text-left">
//                     <button className="flex items-center" onClick={() => handleSort("key")} aria-label="Sort by Key">
//                       Key <SortArrow column="key" />
//                     </button>
//                   </th>
//                   <th className="p-3 text-left">
//                     <button className="flex items-center" onClick={() => handleSort("title")} aria-label="Sort by Title">
//                       Title <SortArrow column="title" />
//                     </button>
//                   </th>
//                   <th className="p-3 text-left">Status</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>

//                 <tr className="bg-gray-100">
//                   <th className="p-2">
//                     <input type="text" placeholder="Search ID" value={searchId} onChange={(e) => handleCleanInput(e, setSearchId)} onKeyDown={handlePreventSpace} className="w-full border rounded px-2 py-1 text-sm" />
//                   </th>
//                   <th className="p-2">
//                     <input type="text" placeholder="Search Key" value={searchKey} onChange={(e) => handleCleanInput(e, setSearchKey)} onKeyDown={handlePreventSpace} className="w-full border rounded px-2 py-1 text-sm" />
//                   </th>
//                   <th className="p-2">
//                     <input type="text" placeholder="Search Title" value={searchTitle} onChange={(e) => handleCleanInput(e, setSearchTitle)} onKeyDown={handlePreventSpace} className="w-full border rounded px-2 py-1 text-sm" />
//                   </th>
//                   <th className="p-2">
//                     <select value={searchStatus} onChange={(e) => { setSearchStatus(e.target.value as "" | CMSStatus); setCurrentPage(1); }} className="w-full border rounded px-2 py-1 text-sm">
//                       <option value="">All</option>
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </th>
//                   <th></th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {cmsList.length === 0 ? (
//                   <tr>
//                     <td colSpan={5} className="text-center p-4 text-gray-500 italic">No CMS pages found.</td>
//                   </tr>
//                 ) : (
//                   cmsList.map((cms) => (
//                     <tr key={cms.id} className="border-t hover:bg-gray-50">
//                       <td className="p-3">{cms.id}</td>
//                       <td className="p-3">{cms.key}</td>
//                       <td className="p-3">{cms.title || "-"}</td>
//                       <td className="p-3">
//                         <label className="relative inline-flex items-center cursor-pointer">
//                           <input type="checkbox" checked={cms.status === "active"} onChange={() => handleToggle(cms)} className="sr-only peer" />
//                           <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full "></div>
//                         </label>
//                       </td>
//                       <td className="p-3 text-center space-x-3">
//                         <button onClick={() => nav(`/cms/edit/${cms.id}`)} className="text-yellow-600 hover:text-yellow-800" title="Edit CMS"><Edit size={18} /></button>
//                         <button onClick={() => handleDelete(cms.id)} className="text-red-600 hover:text-red-800" title="Delete CMS"><Trash2 size={18} /></button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>

//             <div className="flex justify-end items-center p-3">
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={(page) => { setCurrentPage(page); }}
//                 limit={limit}
//                 onLimitChange={(newLimit) => { setLimit(newLimit); setCurrentPage(1); }}
//               />
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CMSList;









// src/pages/CMS/CMSList.tsx
// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import PageHeader from "../../components/layout/PageHeader";
// import Pagination from "../../components/common/Pagination";
// import { getCmsList, updateCms, deleteCms } from "../../services/cmsService";
// import type { CMS, CMSStatus, CMSFormData } from "../../types/CMS";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// const CMSList: React.FC = () => {
//   const [cmsList, setCmsList] = useState<CMS[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   // Filters
//   const [searchId, setSearchId] = useState<string>("");
//   const [searchKey, setSearchKey] = useState<string>("");
//   const [searchTitle, setSearchTitle] = useState<string>("");
//   const [searchStatus, setSearchStatus] = useState<"" | CMSStatus>("");

//   // Pagination
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [limit, setLimit] = useState<number>(10);
//   const [totalPages, setTotalPages] = useState<number>(1);

//   const nav = useNavigate();

//   // Sorting state (same pattern as Users/Roles)
//   const [sortBy, setSortBy] = useState<string | undefined>(undefined);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

//   const handleCleanInput = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     setter: React.Dispatch<React.SetStateAction<string>>
//   ) => {
//     const cleaned = e.target.value.replace(/^\s+|\s+$/g, "");
//     setter(cleaned);
//     setCurrentPage(1);
//   };

//   const handlePreventSpace = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (
//       e.key === " " &&
//       (e.currentTarget.selectionStart === 0 || !e.currentTarget.value.trim())
//     ) {
//       e.preventDefault();
//     }
//   };

//   // fetchCMS now includes sortBy & sortOrder
//   const fetchCMS = useCallback(async () => {
//     try {
//       setLoading(true);

//       const data = await getCmsList({
//         id: searchId || undefined,
//         key: searchKey || undefined,
//         title: searchTitle || undefined,
//         status: searchStatus || undefined,
//         page: currentPage,
//         limit,
//         sortBy,
//         order: sortOrder,
//       });

//       if (Array.isArray(data)) {
//         setCmsList(data);
//         setTotalPages(1);
//       } else if (data && typeof data === "object") {
//         setCmsList(data.cms || data.items || data.data || []);
//         setTotalPages(data.totalPages || Math.ceil((data.total || 0) / limit) || 1);
//       } else {
//         setCmsList([]);
//         setTotalPages(1);
//       }
//     } catch (err) {
//       console.error("Failed to fetch CMS:", err);
//       toast.error("Failed to load CMS pages");
//     } finally {
//       setLoading(false);
//     }
//   }, [searchId, searchKey, searchTitle, searchStatus, currentPage, limit, sortBy, sortOrder]);

//   useEffect(() => {
//     // Debounce like others — small delay makes UI consistent with your other pages
//     const timeout = setTimeout(() => {
//       fetchCMS();
//     }, 250);

//     return () => clearTimeout(timeout);
//   }, [fetchCMS]);

//   // Sorting handler (cycle: set ASC -> DESC -> NONE)
//   const handleSort = (columnKey: string) => {
//     if (sortBy !== columnKey) {
//       setSortBy(columnKey);
//       setSortOrder("asc");
//       setCurrentPage(1);
//       return;
//     }

//     if (sortOrder === "asc") {
//       setSortOrder("desc");
//       setCurrentPage(1);
//       return;
//     }

//     // asc -> desc already handled; if desc, clear sorting
//     if (sortOrder === "desc") {
//       setSortBy(undefined);
//       setSortOrder("desc"); // keep default for later
//       setCurrentPage(1);
//       return;
//     }
//   };

//   // Delete & Toggle handlers (unchanged mostly)
//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this CMS page?")) return;
//     try {
//       await deleteCms(id);
//       setCmsList((prev) => prev.filter((c) => c.id !== id));
//       toast.success("CMS deleted successfully ");
//     } catch (err) {
//       console.error("❌ Delete failed:", err);
//       toast.error("Failed to delete CMS");
//     }
//   };

//   const handleToggle = async (cms: CMS) => {
//     const newStatus: CMSStatus = cms.status === "active" ? "inactive" : "active";
//     const payload: CMSFormData = {
//       key: cms.key,
//       title: cms.title || "",
//       metaKeyword: cms.metaKeyword || "",
//       metaTitle: cms.metaTitle || "",
//       metaDescription: cms.metaDescription || "",
//       content: cms.content || "",
//       status: newStatus,
//     };

//     try {
//       await updateCms(cms.id, payload);
//       setCmsList((prev) => prev.map((c) => (c.id === cms.id ? { ...c, status: newStatus } : c)));
//       toast.success(newStatus === "active" ? "CMS marked as active " : "CMS marked as inactive ");
//     } catch (err) {
//       console.error("Status update failed:", err);
//       toast.error("Failed to update status");
//     }
//   };

//   // UI arrow same pattern as Users
//   const SortArrow = ({ column }: { column: string }) => {
//     if (sortBy !== column) {
//       return (
//         <span className="inline-block ml-2 opacity-50 select-none" aria-hidden>
//           ▲▼
//         </span>
//       );
//     }
//     return sortOrder === "asc" ? <span className="inline-block ml-2 select-none">▲</span> : <span className="inline-block ml-2 select-none">▼</span>;
//   };

//   return (
//     <div>
//       <PageHeader
//         title="CMS Pages"
//         right={
//           <div className="flex gap-2">
//             <button
//               onClick={() => {
//                 if (!cmsList.length) {
//                   toast.error("No CMS pages to export ");
//                   return;
//                 }
//                 const headers = ["ID", "Key", "Title", "Status"];
//                 const csvRows = [headers.join(","), ...cmsList.map((c) => [c.id, `"${c.key}"`, `"${c.title || "-"}"`, `"${c.status}"`].join(","))];
//                 const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
//                 const url = window.URL.createObjectURL(blob);
//                 const link = document.createElement("a");
//                 link.href = url;
//                 link.setAttribute("download", "cms_export.csv");
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);
//                 toast.success("CSV exported successfully ");
//               }}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer"
//             >
//               Export CSV
//             </button>

//             <button onClick={() => nav("/cms/add")} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer">
//               Add CMS
//             </button>
//           </div>
//         }
//       />

//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="text-center py-6 text-gray-500">Loading CMS pages...</div>
//         ) : (
//           <>
//             <table className="min-w-full border text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="p-3 text-left">
//                     <button className="flex items-center" onClick={() => handleSort("id")} aria-label="Sort by ID">
//                       ID <SortArrow column="id" />
//                     </button>
//                   </th>
//                   <th className="p-3 text-left">
//                     <button className="flex items-center" onClick={() => handleSort("key")} aria-label="Sort by Key">
//                       Key <SortArrow column="key" />
//                     </button>
//                   </th>
//                   <th className="p-3 text-left">
//                     <button className="flex items-center" onClick={() => handleSort("title")} aria-label="Sort by Title">
//                       Title <SortArrow column="title" />
//                     </button>
//                   </th>
//                   <th className="p-3 text-left">Status</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>

//                 <tr className="bg-gray-100">
//                   <th className="p-2">
//                     <input type="text" placeholder="Search ID" value={searchId} onChange={(e) => handleCleanInput(e, setSearchId)} onKeyDown={handlePreventSpace} className="w-full border rounded px-2 py-1 text-sm" />
//                   </th>
//                   <th className="p-2">
//                     <input type="text" placeholder="Search Key" value={searchKey} onChange={(e) => handleCleanInput(e, setSearchKey)} onKeyDown={handlePreventSpace} className="w-full border rounded px-2 py-1 text-sm" />
//                   </th>
//                   <th className="p-2">
//                     <input type="text" placeholder="Search Title" value={searchTitle} onChange={(e) => handleCleanInput(e, setSearchTitle)} onKeyDown={handlePreventSpace} className="w-full border rounded px-2 py-1 text-sm" />
//                   </th>
//                   <th className="p-2">
//                     <select value={searchStatus} onChange={(e) => { setSearchStatus(e.target.value as "" | CMSStatus); setCurrentPage(1); }} className="w-full border rounded px-2 py-1 text-sm">
//                       <option value="">All</option>
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </th>
//                   <th></th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {cmsList.length === 0 ? (
//                   <tr>
//                     <td colSpan={5} className="text-center p-4 text-gray-500 italic">No CMS pages found.</td>
//                   </tr>
//                 ) : (
//                   cmsList.map((cms) => (
//                     <tr key={cms.id} className="border-t hover:bg-gray-50">
//                       <td className="p-3">{cms.id}</td>
//                       <td className="p-3">{cms.key}</td>
//                       <td className="p-3">{cms.title || "-"}</td>
//                       <td className="p-3">
//                         <label className="relative inline-flex items-center cursor-pointer">
//                           <input type="checkbox" checked={cms.status === "active"} onChange={() => handleToggle(cms)} className="sr-only peer" />
//                           <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full "></div>
//                         </label>
//                       </td>
//                       <td className="p-3 text-center space-x-3">
//                         <button onClick={() => nav(`/cms/edit/${cms.id}`)} className="text-yellow-600 hover:text-yellow-800" title="Edit CMS"><Edit size={18} /></button>
//                         <button onClick={() => handleDelete(cms.id)} className="text-red-600 hover:text-red-800" title="Delete CMS"><Trash2 size={18} /></button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>

//             <div className="flex justify-end items-center p-3">
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={(page) => { setCurrentPage(page); }}
//                 limit={limit}
//                 onLimitChange={(newLimit) => { setLimit(newLimit); setCurrentPage(1); }}
//               />
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CMSList;



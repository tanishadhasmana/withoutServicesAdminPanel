import React, { useEffect, useState, useCallback } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { getCmsList, updateCms, deleteCms } from "../../services/cmsService";
import type { CMS, CMSStatus, CMSFormData } from "../../types/CMS";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const CMSList: React.FC = () => {
  const [cmsList, setCmsList] = useState<CMS[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchId, setSearchId] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchStatus, setSearchStatus] = useState<"" | CMSStatus>("");

  const nav = useNavigate();

  // ✅ Wrap in useCallback to satisfy eslint deps
  const fetchCMS = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCmsList({
        id: searchId,
        key: searchKey,
        title: searchTitle,
        status: searchStatus || undefined,
      });
      setCmsList(data);
    } catch (err) {
      console.error("Failed to fetch CMS:", err);
      toast.error("Failed to load CMS pages ❌");
    } finally {
      setLoading(false);
    }
  }, [searchId, searchKey, searchTitle, searchStatus]);

  // ✅ Only depend on fetchCMS
  useEffect(() => {
    fetchCMS();
  }, [fetchCMS]);

  // Delete CMS
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this CMS page?")) return;
    try {
      await deleteCms(id);
      setCmsList((prev) => prev.filter((c) => c.id !== id));
      toast.success("CMS deleted successfully ✅");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete CMS ❌");
    }
  };

  // Toggle status
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
      setCmsList((prev) =>
        prev.map((c) => (c.id === cms.id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Status updated to ${newStatus} ✅`);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status ❌");
    }
  };

  return (
    <div>
      <PageHeader
        title="CMS Pages"
        right={
          <button
            onClick={() => nav("/cms/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add CMS
          </button>
        }
      />
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading CMS pages...</div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Key</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>

              {/* Search & Filter Row */}
              <tr className="bg-gray-100">
                <th className="p-2">
                  <input
                    type="text"
                    placeholder="Search ID"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </th>
                <th className="p-2">
                  <input
                    type="text"
                    placeholder="Search Key"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </th>
                <th className="p-2">
                  <input
                    type="text"
                    placeholder="Search Title"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </th>
                <th className="p-2">
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value as "" | CMSStatus)}
                  >
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
                  <td colSpan={5} className="text-center p-4 text-gray-500 italic">
                    No CMS pages found.
                  </td>
                </tr>
              ) : (
                cmsList.map((cms) => (
                  <tr key={cms.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{cms.id}</td>
                    <td className="p-3">{cms.key}</td>
                    <td className="p-3">{cms.title || "-"}</td>
                    <td className="p-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cms.status === "active"}
                          onChange={() => handleToggle(cms)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </td>
                    <td className="p-3 text-center space-x-3">
                      <button
                        onClick={() => nav(`/cms/edit/${cms.id}`)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit CMS"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cms.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete CMS"
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

export default CMSList;






// src/pages/cms/CMSList.tsx
// import React, { useEffect, useState } from "react";
// import PageHeader from "../../components/layout/PageHeader";
// import { getCmsList, updateCms, deleteCms } from "../../services/cmsService";
// import type { CMS, CMSStatus, CMSFormData } from "../../types/CMS";
// import { useNavigate } from "react-router-dom";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// const CMSList: React.FC = () => {
//   const [cmsList, setCmsList] = useState<CMS[]>([]);
//   const [filteredList, setFilteredList] = useState<CMS[]>([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ Search fields
//   const [searchId, setSearchId] = useState("");
//   const [searchKey, setSearchKey] = useState("");
//   const [searchTitle, setSearchTitle] = useState("");
//   const [searchMetaKeyword, setSearchMetaKeyword] = useState("");

//   const nav = useNavigate();

//   // ✅ Load CMS pages
//   const fetchCMS = async () => {
//     try {
//       setLoading(true);
//       const data = await getCmsList();
//       setCmsList(data);
//       setFilteredList(data);
//     } catch (err) {
//       console.error("Failed to fetch CMS:", err);
//       toast.error("Failed to load CMS pages ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCMS();
//   }, []);

//   // ✅ Filtering logic
//   useEffect(() => {
//     const filtered = cmsList.filter(
//       (cms) =>
//         cms.id.toString().includes(searchId) &&
//         cms.key.toLowerCase().includes(searchKey.toLowerCase()) &&
//         (cms.title || "").toLowerCase().includes(searchTitle.toLowerCase()) &&
//         (cms.metaKeyword || "").toLowerCase().includes(searchMetaKeyword.toLowerCase())
//     );
//     setFilteredList(filtered);
//   }, [searchId, searchKey, searchTitle, searchMetaKeyword, cmsList]);

//   // ✅ Delete CMS
//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this CMS page?")) return;
//     try {
//       await deleteCms(id);
//       setCmsList((prev) => prev.filter((c) => c.id !== id));
//       toast.success("CMS deleted successfully ✅");
//     } catch (err) {
//       console.error("Delete failed:", err);
//       toast.error("Failed to delete CMS ❌");
//     }
//   };

//   // ✅ Toggle status
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
//       setCmsList((prev) =>
//         prev.map((c) => (c.id === cms.id ? { ...c, status: newStatus } : c))
//       );
//       toast.success(`Status updated to ${newStatus} ✅`);
//     } catch (err) {
//       console.error("Status update failed:", err);
//       toast.error("Failed to update status ❌");
//     }
//   };

//   return (
//     <div>
//       <PageHeader
//         title="CMS Pages"
//         right={
//           <button
//             onClick={() => nav("/cms/add")}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Add CMS
//           </button>
//         }
//       />
//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="text-center py-6 text-gray-500">Loading CMS pages...</div>
//         ) : (
//           <table className="min-w-full border text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-3 text-left">ID</th>
//                 <th className="p-3 text-left">Key</th>
//                 <th className="p-3 text-left">Title</th>
//                 <th className="p-3 text-left">Meta Keyword</th>
//                 <th className="p-3 text-left">Status</th>
//                 <th className="p-3 text-center">Actions</th>
//               </tr>

//               {/* ✅ Search Row */}
//               <tr className="bg-gray-100">
//                 <th className="p-2">
//                   <input
//                     type="text"
//                     placeholder="Search ID"
//                     value={searchId}
//                     onChange={(e) => setSearchId(e.target.value)}
//                     className="w-full border rounded px-2 py-1 text-sm"
//                   />
//                 </th>
//                 <th className="p-2">
//                   <input
//                     type="text"
//                     placeholder="Search Key"
//                     value={searchKey}
//                     onChange={(e) => setSearchKey(e.target.value)}
//                     className="w-full border rounded px-2 py-1 text-sm"
//                   />
//                 </th>
//                 <th className="p-2">
//                   <input
//                     type="text"
//                     placeholder="Search Title"
//                     value={searchTitle}
//                     onChange={(e) => setSearchTitle(e.target.value)}
//                     className="w-full border rounded px-2 py-1 text-sm"
//                   />
//                 </th>
//                 <th className="p-2">
//                   <input
//                     type="text"
//                     placeholder="Search Keyword"
//                     value={searchMetaKeyword}
//                     onChange={(e) => setSearchMetaKeyword(e.target.value)}
//                     className="w-full border rounded px-2 py-1 text-sm"
//                   />
//                 </th>
//                 <th></th>
//                 <th></th>
//               </tr>
//             </thead>

//             <tbody>
//               {filteredList.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="text-center p-4 text-gray-500 italic">
//                     No CMS pages found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredList.map((cms) => (
//                   <tr key={cms.id} className="border-t hover:bg-gray-50">
//                     <td className="p-3">{cms.id}</td>
//                     <td className="p-3">{cms.key}</td>
//                     <td className="p-3">{cms.title || "-"}</td>
//                     <td className="p-3">{cms.metaKeyword || "-"}</td>

//                     {/* Toggle Status */}
//                     <td className="p-3">
//                       <label className="relative inline-flex items-center cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={cms.status === "active"}
//                           onChange={() => handleToggle(cms)}
//                           className="sr-only peer"
//                         />
//                         <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
//                       </label>
//                     </td>

//                     {/* Actions */}
//                     <td className="p-3 text-center space-x-3">
//                       <button
//                         onClick={() => nav(`/cms/edit/${cms.id}`)}
//                         className="text-yellow-600 hover:text-yellow-800"
//                         title="Edit CMS"
//                       >
//                         <Edit size={18} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(cms.id)}
//                         className="text-red-600 hover:text-red-800"
//                         title="Delete CMS"
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

// export default CMSList;


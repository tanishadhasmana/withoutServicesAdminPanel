import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import {
  getEmailTemplates,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "../../services/emailTemplateService";
import type { EmailTemplate, TemplateStatus } from "../../types/EmailTemplate";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const EmailTemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Search fields
  const [searchKey, setSearchKey] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchSubject, setSearchSubject] = useState("");
  const [searchStatus, setSearchStatus] = useState<TemplateStatus | "all">("all");

  const nav = useNavigate();

  // ✅ Fetch templates (moved inside useEffect)
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await getEmailTemplates();
        setTemplates(data);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
        toast.error("Failed to fetch templates ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // ✅ Filtering logic
  useEffect(() => {
    const filtered = templates.filter((t) => {
      const matchesKey = t.key.toLowerCase().includes(searchKey.toLowerCase());
      const matchesTitle = (t.title || "").toLowerCase().includes(searchTitle.toLowerCase());
      const matchesSubject = (t.subject || "").toLowerCase().includes(searchSubject.toLowerCase());
      const matchesStatus =
        searchStatus === "all" ? true : t.status === searchStatus;

      return matchesKey && matchesTitle && matchesSubject && matchesStatus;
    });

    setFilteredTemplates(filtered);
  }, [searchKey, searchTitle, searchSubject, searchStatus, templates]);

  // ✅ Toggle status
  const handleToggle = async (template: EmailTemplate) => {
    const newStatus: TemplateStatus = template.status === "active" ? "inactive" : "active";
    try {
      await updateEmailTemplate(template.id, { ...template, status: newStatus });
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, status: newStatus } : t))
      );
      toast.success(`Status updated to ${newStatus} ✅`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status ❌");
    }
  };

  // ✅ Delete template
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteEmailTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted successfully ✅");
    } catch (err) {
      console.error("Failed to delete template:", err);
      toast.error("Failed to delete template ❌");
    }
  };

  return (
    <div>
      <PageHeader
        title="Email Templates"
        right={
          <button
            onClick={() => nav("/email-templates/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Template
          </button>
        }
      />
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading templates...</div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Key</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>

              {/* ✅ Search Row */}
              <tr className="bg-gray-100 border-t">
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
                  <input
                    type="text"
                    placeholder="Search Subject"
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </th>
                <th className="p-2">
                  <select
                    value={searchStatus}
                    onChange={(e) =>
                      setSearchStatus(e.target.value as TemplateStatus | "all")
                    }
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
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500 italic">
                    No templates found.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{t.key}</td>
                    <td className="p-3">{t.title}</td>
                    <td className="p-3">{t.subject}</td>

                    {/* ✅ Toggle Status */}
                    <td className="p-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={t.status === "active"}
                          onChange={() => handleToggle(t)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </td>

                    {/* ✅ Actions */}
                    <td className="p-3 text-center space-x-3">
                      <button
                        onClick={() => nav(`/email-templates/edit/${t.id}`)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit Template"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Template"
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

export default EmailTemplateList;





// import React, { useEffect, useState } from "react";
// import PageHeader from "../../components/layout/PageHeader";
// import {
//   getEmailTemplates,
//   updateEmailTemplate,
//   deleteEmailTemplate,
// } from "../../services/emailTemplateService";
// import type { EmailTemplate, TemplateStatus } from "../../types/EmailTemplate";
// import { useNavigate } from "react-router-dom";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// const EmailTemplateList: React.FC = () => {
//   const [templates, setTemplates] = useState<EmailTemplate[]>([]);
//   const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ Search fields
//   const [searchKey, setSearchKey] = useState("");
//   const [searchTitle, setSearchTitle] = useState("");
//   const [searchSubject, setSearchSubject] = useState("");
//   const [searchStatus, setSearchStatus] = useState<TemplateStatus | "all">("all");

//   const nav = useNavigate();

//   // Load Templates
//   const fetchTemplates = async () => {
//     try {
//       setLoading(true);
//       const data = await getEmailTemplates();
//       setTemplates(data);
//       setFilteredTemplates(data);
//     } catch (err) {
//       console.error("Failed to fetch templates:", err);
//       toast.error("Failed to fetch templates ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTemplates();
//   }, []);

//   // ✅ Filtering logic
//   useEffect(() => {
//     const filtered = templates.filter((t) => {
//       const matchesKey = t.key.toLowerCase().includes(searchKey.toLowerCase());
//       const matchesTitle = (t.title || "").toLowerCase().includes(searchTitle.toLowerCase());
//       const matchesSubject = (t.subject || "").toLowerCase().includes(searchSubject.toLowerCase());
//       const matchesStatus = searchStatus === "all" ? true : t.status === searchStatus;

//       return matchesKey && matchesTitle && matchesSubject && matchesStatus;
//     });

//     setFilteredTemplates(filtered);
//   }, [searchKey, searchTitle, searchSubject, searchStatus, templates]);

//   // Toggle status
//   const handleToggle = async (template: EmailTemplate) => {
//     const newStatus: TemplateStatus = template.status === "active" ? "inactive" : "active";
//     try {
//       await updateEmailTemplate(template.id, { ...template, status: newStatus });
//       setTemplates((prev) =>
//         prev.map((t) => (t.id === template.id ? { ...t, status: newStatus } : t))
//       );
//       toast.success(`Status updated to ${newStatus} ✅`);
//     } catch (err) {
//       console.error("Failed to update status:", err);
//       toast.error("Failed to update status ❌");
//     }
//   };

//   // Delete template
//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this template?")) return;
//     try {
//       await deleteEmailTemplate(id);
//       setTemplates((prev) => prev.filter((t) => t.id !== id));
//       toast.success("Template deleted successfully ✅");
//     } catch (err) {
//       console.error("Failed to delete template:", err);
//       toast.error("Failed to delete template ❌");
//     }
//   };

//   return (
//     <div>
//       <PageHeader
//         title="Email Templates"
//         right={
//           <button
//             onClick={() => nav("/email-templates/add")}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Add Template
//           </button>
//         }
//       />
//       <Toaster position="top-right" reverseOrder={false} />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="text-center py-6 text-gray-500">Loading templates...</div>
//         ) : (
//           <table className="min-w-full border text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-3 text-left">Key</th>
//                 <th className="p-3 text-left">Title</th>
//                 <th className="p-3 text-left">Subject</th>
//                 <th className="p-3 text-left">Status</th>
//                 <th className="p-3 text-center">Actions</th>
//               </tr>

//               {/* ✅ Search row */}
//               <tr className="bg-gray-100 border-t">
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
//                     placeholder="Search Subject"
//                     value={searchSubject}
//                     onChange={(e) => setSearchSubject(e.target.value)}
//                     className="w-full border rounded px-2 py-1 text-sm"
//                   />
//                 </th>

//                 {/* ✅ Status dropdown */}
//                 <th className="p-2">
//                   <select
//                     value={searchStatus}
//                     onChange={(e) =>
//                       setSearchStatus(e.target.value as TemplateStatus | "all")
//                     }
//                     className="w-full border rounded px-2 py-1 text-sm"
//                   >
//                     <option value="all">All</option>
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
//                 </th>

//                 <th></th>
//               </tr>
//             </thead>

//             <tbody>
//               {filteredTemplates.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="text-center p-4 text-gray-500 italic">
//                     No templates found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredTemplates.map((t) => (
//                   <tr key={t.id} className="border-t hover:bg-gray-50">
//                     <td className="p-3">{t.key}</td>
//                     <td className="p-3">{t.title}</td>
//                     <td className="p-3">{t.subject}</td>

//                     {/* Toggle Status */}
//                     <td className="p-3">
//                       <label className="relative inline-flex items-center cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={t.status === "active"}
//                           onChange={() => handleToggle(t)}
//                           className="sr-only peer"
//                         />
//                         <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
//                       </label>
//                     </td>

//                     {/* Actions */}
//                     <td className="p-3 text-center space-x-3">
//                       <button
//                         onClick={() => nav(`/email-templates/edit/${t.id}`)}
//                         className="text-yellow-600 hover:text-yellow-800"
//                         title="Edit Template"
//                       >
//                         <Edit size={18} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(t.id)}
//                         className="text-red-600 hover:text-red-800"
//                         title="Delete Template"
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

// export default EmailTemplateList;



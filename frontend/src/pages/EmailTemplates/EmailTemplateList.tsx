// frontend/src/pages/EmailTemplate/EmailTemplateList.tsx
import React, { useEffect, useState, useCallback } from "react";
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
import Pagination from "../../components/common/Pagination";

const EmailTemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchKey, setSearchKey] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchSubject, setSearchSubject] = useState("");
  const [searchStatus, setSearchStatus] = useState<TemplateStatus | "all">("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const nav = useNavigate();

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEmailTemplates({
        key: searchKey || undefined,
        title: searchTitle || undefined,
        subject: searchSubject || undefined,
        status: searchStatus || "all",
        page: currentPage,
        limit,
      });

      if (Array.isArray(data)) {
        setTemplates(data);
        setTotalPages(1);
      } else if (data && typeof data === "object") {
        setTemplates(data.items || []);
        setTotalPages(data.totalPages || Math.ceil((data.total || 0) / limit) || 1);
      } else {
        setTemplates([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      toast.error("Failed to fetch templates ❌");
    } finally {
      setLoading(false);
    }
  }, [searchKey, searchTitle, searchSubject, searchStatus, currentPage, limit]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey, searchTitle, searchSubject, searchStatus]);

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

  const handleToggle = async (template: EmailTemplate) => {
    const newStatus: TemplateStatus =
      template.status === "active" ? "inactive" : "active";
    try {
      await updateEmailTemplate(template.id, { status: newStatus });
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, status: newStatus } : t))
      );
      toast.success(`Status updated to ${newStatus} ✅`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status ❌");
    }
  };

  // 🧠 Helper to prevent leading or consecutive spaces
  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    // prevent spaces-only input
    if (value.trimStart() === "" && value.length > 0) return;
    setter(value.replace(/\s{2,}/g, " ")); // replace multiple spaces with single
    setCurrentPage(1);
  };

  return (
    <div>
      {/* <PageHeader
        title="Email Templates"
        right={
          <button
            onClick={() => nav("/email-templates/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Template
          </button>
        }
      /> */}
{/* here also added export csv */}
<PageHeader
  title="Email Templates"
  right={
    <div className="flex gap-2">
      {/* ✅ Export CSV Button (consistent with other pages) */}
      <button
        onClick={() => {
          if (!templates.length) {
            toast.error("No templates to export ❌");
            return;
          }

          try {
            const headers = ["Key", "Title", "Subject", "Status"];

            const csvRows = [
              headers.join(","), // header row
              ...templates.map((t) => {
                const key = t.key ?? "-";
                const title = t.title ?? "-";
                const subject = t.subject ?? "-";
                const status = t.status ?? "-";

                // Properly escape quotes for CSV
                return [
                  `"${key.replace(/"/g, '""')}"`,
                  `"${title.replace(/"/g, '""')}"`,
                  `"${subject.replace(/"/g, '""')}"`,
                  `"${status}"`,
                ].join(",");
              }),
            ];

            const blob = new Blob([csvRows.join("\n")], {
              type: "text/csv;charset=utf-8;",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "email_templates_export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Email templates exported successfully ✅");
          } catch (err) {
            console.error("CSV Export Error:", err);
            toast.error("Failed to export CSV ❌");
          }
        }}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Export CSV
      </button>

      {/* ✅ Add Template Button (unchanged) */}
      <button
        onClick={() => nav("/email-templates/add")}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Add Template
      </button>
    </div>
  }
/>


      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">
            Loading templates...
          </div>
        ) : (
          <>
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Key</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Subject</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>

                {/* 🔍 Search Row */}
                <tr className="bg-gray-100 border-t">
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Key"
                      value={searchKey}
                      onChange={(e) => handleInputChange(setSearchKey, e)}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Title"
                      value={searchTitle}
                      onChange={(e) => handleInputChange(setSearchTitle, e)}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Subject"
                      value={searchSubject}
                      onChange={(e) => handleInputChange(setSearchSubject, e)}
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
                {templates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center p-4 text-gray-500 italic"
                    >
                      No templates found.
                    </td>
                  </tr>
                ) : (
                  templates.map((t) => (
                    <tr key={t.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{t.key}</td>
                      <td className="p-3">{t.title}</td>
                      <td className="p-3">{t.subject}</td>
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

            <div className="flex justify-end items-center p-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                limit={limit}
                onLimitChange={(l) => {
                  setLimit(l);
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

export default EmailTemplateList;

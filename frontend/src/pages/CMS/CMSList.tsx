import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Pagination from "../../components/common/Pagination";
import { getCmsList, updateCms, deleteCms } from "../../services/cmsService";
import type { CMS, CMSStatus, CMSFormData } from "../../types/CMS";
import { Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const CMSList: React.FC = () => {
  const [cmsList, setCmsList] = useState<CMS[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Filters
  const [searchId, setSearchId] = useState<string>("");
  const [searchKey, setSearchKey] = useState<string>("");
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [searchStatus, setSearchStatus] = useState<"" | CMSStatus>("");

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const nav = useNavigate();

  // ✅ Helper functions for input sanitization
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

  // ✅ Fetch CMS list (supports pagination + filters)
  const fetchCMS = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getCmsList({
        id: searchId,
        key: searchKey,
        title: searchTitle,
        status: searchStatus || undefined,
        page: currentPage,
        limit,
      });

      // Handle different API structures gracefully
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
      console.error("❌ Failed to fetch CMS:", err);
      toast.error("Failed to load CMS pages");
    } finally {
      setLoading(false);
    }
  }, [searchId, searchKey, searchTitle, searchStatus, currentPage, limit]);

  useEffect(() => {
    fetchCMS();
  }, [fetchCMS]);

  // ✅ Delete CMS Page
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this CMS page?"))
      return;
    try {
      await deleteCms(id);
      setCmsList((prev) => prev.filter((c) => c.id !== id));
      toast.success("CMS deleted successfully ✅");
    } catch (err) {
      console.error("❌ Delete failed:", err);
      toast.error("Failed to delete CMS");
    }
  };

  // ✅ Toggle CMS Active/Inactive
  const handleToggle = async (cms: CMS) => {
    const newStatus: CMSStatus =
      cms.status === "active" ? "inactive" : "active";
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
      toast.success(
        newStatus === "active"
          ? "CMS marked as active ✅"
          : "CMS marked as inactive ⚪"
      );
    } catch (err) {
      console.error("❌ Status update failed:", err);
      toast.error("Failed to update status");
    }
  };

  return (
    <div>
      {/* <PageHeader
        title="CMS Pages"
        right={
          <button
            onClick={() => nav("/cms/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add CMS
          </button>
        }
      /> */}
      {/* we change this also to add export csv */}
      <PageHeader
        title="CMS Pages"
        right={
          <div className="flex gap-2">
            {/* ✅ Export CSV Button */}
            <button
              onClick={() => {
                if (!cmsList.length) {
                  toast.error("No CMS pages to export ❌");
                  return;
                }

                // Convert CMS list to CSV
                const headers = ["ID", "Key", "Title", "Status"];
                const csvRows = [
                  headers.join(","), // Header row
                  ...cmsList.map((c) =>
                    [
                      c.id,
                      `"${c.key}"`,
                      `"${c.title || "-"}"`,
                      `"${c.status}"`,
                    ].join(",")
                  ),
                ];

                const blob = new Blob([csvRows.join("\n")], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "cms_export.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success("CSV exported successfully ✅");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Export CSV
            </button>

            {/* ✅ Add CMS Button */}
            <button
              onClick={() => nav("/cms/add")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Add CMS
            </button>
          </div>
        }
      />

      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">
            Loading CMS pages...
          </div>
        ) : (
          <>
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Key</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>

                {/* ✅ Search Filters Row with space prevention */}
                <tr className="bg-gray-100">
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search ID"
                      value={searchId}
                      onChange={(e) => handleCleanInput(e, setSearchId)}
                      onKeyDown={handlePreventSpace}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Key"
                      value={searchKey}
                      onChange={(e) => handleCleanInput(e, setSearchKey)}
                      onKeyDown={handlePreventSpace}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Title"
                      value={searchTitle}
                      onChange={(e) => handleCleanInput(e, setSearchTitle)}
                      onKeyDown={handlePreventSpace}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </th>
                  <th className="p-2">
                    <select
                      value={searchStatus}
                      onChange={(e) => {
                        setSearchStatus(e.target.value as "" | CMSStatus);
                        setCurrentPage(1);
                      }}
                      className="w-full border rounded px-2 py-1 text-sm"
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
                    <td
                      colSpan={5}
                      className="text-center p-4 text-gray-500 italic"
                    >
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
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
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

            {/* ✅ Pagination Section */}
            <div className="flex justify-end items-center p-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
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

export default CMSList;

// src/pages/ApplicationConfig/ApplicationConfigList.tsx
import React, { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import {
  getApplicationConfigList,
  deleteApplicationConfigById,
  updateApplicationConfigById,
} from "../../services/applicationConfigService";
import type { ApplicationConfig, ConfigStatus } from "../../types/ApplicationConfig";
import type { Config } from "../../types/Config";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert";

import Pagination from "../../components/common/Pagination";

const ApplicationConfigList: React.FC = () => {
  const [configs, setConfigs] = useState<ApplicationConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Client-side filters
  const [searchKey, setSearchKey] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [searchDisplayOrder, setSearchDisplayOrder] = useState("");
  const [searchStatus, setSearchStatus] = useState<"" | ConfigStatus>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const nav = useNavigate();

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch configs (server-side) with sorting
  const fetchConfigs = useCallback(
    async (pageArg = currentPage, limitArg = limit, sb = sortBy, so = sortOrder) => {
      try {
        setLoading(true);
        const response = await getApplicationConfigList(pageArg, limitArg, sb, so);
        // response should be { data: Config[], total, totalPages?, currentPage? }
        const data: Config[] = Array.isArray(response.data) ? response.data : response.data || [];
        const fixedData: ApplicationConfig[] = data.map((c: Config) => ({
          id: c.id,
          key: c.key,
          value: c.value ?? "",
          displayOrder: c.displayOrder,
          status: c.status as ConfigStatus,
          createdBy: c.createdBy ?? undefined,
          updatedBy: c.updatedBy ?? undefined,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt ?? undefined,
        }));

        setConfigs(fixedData);

        const total = response.total ?? 0;
        setTotalPages(total ? Math.ceil(total / limitArg) : Math.max(1, Math.ceil(fixedData.length / limitArg)));
        setCurrentPage(response.currentPage ?? pageArg);
      } catch (err) {
        console.error("Failed to fetch configs:", err);
        toast.error("Failed to load configurations");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // initial + when limit or sorting change -> reset page to 1 and fetch
  useEffect(() => {
    setCurrentPage(1);
    fetchConfigs(1, limit, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, sortBy, sortOrder]);

  // when page changes
  useEffect(() => {
    fetchConfigs(currentPage, limit, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Delete
  // const handleDelete = async (id: number) => {
  //   if (!window.confirm("Are you sure you want to delete this configuration?")) return;
  //   try {
  //     await deleteApplicationConfigById(id);
  //     setConfigs((prev) => prev.filter((c) => c.id !== id));
  //     toast.success("Configuration deleted ");
  //     fetchConfigs(currentPage, limit, sortBy, sortOrder);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to delete configuration ");
  //   }
  // };

const handleDeleteConfirmed = async (id: number, onClose: () => void) => {
  try {
    await deleteApplicationConfigById(id);
    setConfigs((prev) => prev.filter((r) => r.id !== id));
    toast.success("Application config deleted successfully");
    onClose();
  } catch (err) {
    console.error("Delete failed:", err);
    toast.error("Failed to delete application config");
    onClose();
  }
};

const confirmDelete = (id: number) => {
  confirmAlert({
    customUI: ({ onClose }) => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Are you sure you want to delete this appication config?</h3>
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


  // Toggle status
  const handleToggle = async (config: ApplicationConfig) => {
    const newStatus: ConfigStatus = config.status === "active" ? "inactive" : "active";
    try {
      await updateApplicationConfigById(config.id, {
        key: config.key,
        value: config.value,
        displayOrder: config.displayOrder,
        status: newStatus,
      });
      setConfigs((prev) => prev.map((c) => (c.id === config.id ? { ...c, status: newStatus } : c)));
      toast.success(`Status updated to ${newStatus} `);
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Failed to update status ");
    }
  };

  // Client-side filtering (applied on already-fetched page)
  const filteredConfigs = configs.filter((c) => {
    const matchesKey = c.key.toLowerCase().includes(searchKey.toLowerCase());
    const matchesValue = c.value.toLowerCase().includes(searchValue.toLowerCase());
    const matchesDisplayOrder = searchDisplayOrder ? c.displayOrder.toString().includes(searchDisplayOrder) : true;
    const matchesStatus = searchStatus ? c.status === searchStatus : true;
    return matchesKey && matchesValue && matchesDisplayOrder && matchesStatus;
  });

  // Sorting handlers (cycles: asc -> desc -> none)
  const handleSort = (columnKey: string) => {
    if (sortBy !== columnKey) {
      // new column -> asc
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

    // was desc -> reset to none (backend default)
    setSortBy(undefined);
    setSortOrder("desc"); // keep default for future
    setCurrentPage(1);
  };

  const SortArrow = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return (
        <span className="inline-block ml-2 opacity-50 select-none cursor-pointer" aria-hidden>
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

  // small helper for input sanitization
  const sanitizeAndSet = (setter: (v: string) => void, raw: string) => {
    const cleaned = raw.replace(/^\s+|\s+$/g, "");
    setter(cleaned);
    setCurrentPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Application Configurations"
        right={
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!configs.length) {
                  toast.error("No configurations to export ");
                  return;
                }
                try {
                  const headers = ["Key", "Value", "Display Order", "Status"];
                  const csvRows = [
                    headers.join(","),
                    ...configs.map((c) => {
                      const key = c.key ?? "-";
                      const value = c.value ?? "-";
                      const displayOrder = c.displayOrder !== undefined && c.displayOrder !== null ? c.displayOrder.toString() : "-";
                      const status = c.status ?? "-";
                      return [`"${key.replace(/"/g, '""')}"`, `"${value.replace(/"/g, '""')}"`, `"${displayOrder.replace(/"/g, '""')}"`, `"${status}"`].join(",");
                    }),
                  ];

                  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", "application_configs_export.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast.success("Application configurations exported successfully ✅");
                } catch (err) {
                  console.error("CSV Export Error:", err);
                  toast.error("Failed to export CSV ");
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer"
            >
              Export CSV
            </button>

            <button onClick={() => nav("/application-config/add")} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer">
              Add Config
            </button>
          </div>
        }
      />

      <Toaster position="top-right" />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading configurations...</div>
        ) : (
          <>
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">
                    <button className="flex items-center" onClick={() => handleSort("key")}>
                      Key <SortArrow column="key" />
                    </button>
                  </th>

                  <th className="p-3 text-left">
                    <button className="flex items-center" onClick={() => handleSort("value")}>
                      Value <SortArrow column="value" />
                    </button>
                  </th>

                  <th className="p-3 text-left">
                    <button className="flex items-center" onClick={() => handleSort("displayOrder")}>
                      Display Order <SortArrow column="displayOrder" />
                    </button>
                  </th>

                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>

                {/* Search Row */}
                <tr className="bg-gray-100 border-t">
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Key"
                      value={searchKey}
                      onChange={(e) => sanitizeAndSet(setSearchKey, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === " " && (e.currentTarget.selectionStart === 0 || !e.currentTarget.value.trim())) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </th>

                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Value"
                      value={searchValue}
                      onChange={(e) => sanitizeAndSet(setSearchValue, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === " " && (e.currentTarget.selectionStart === 0 || !e.currentTarget.value.trim())) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </th>

                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Display Order"
                      value={searchDisplayOrder}
                      onChange={(e) => sanitizeAndSet(setSearchDisplayOrder, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === " " && (e.currentTarget.selectionStart === 0 || !e.currentTarget.value.trim())) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </th>

                  <th className="p-2">
                    <select
                      value={searchStatus}
                      onChange={(e) => {
                        setSearchStatus(e.target.value as "" | ConfigStatus);
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
                {filteredConfigs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500 italic">
                      No configurations found.
                    </td>
                  </tr>
                ) : (
                  filteredConfigs.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{c.key}</td>
                      <td className="p-3">{c.value}</td>
                      <td className="p-3">{c.displayOrder}</td>
                      <td className="p-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={c.status === "active"} onChange={() => handleToggle(c)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                        </label>
                      </td>
                      <td className="p-3 text-center space-x-3">
                        <button onClick={() => nav(`/application-config/edit/${c.id}`)} className="text-yellow-600 hover:text-yellow-800 cursor-pointer" title="Edit Config">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => confirmDelete(c.id)} className="text-red-600 hover:text-red-800 cursor-pointer" title="Delete Config">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-end items-center p-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  fetchConfigs(page, limit, sortBy, sortOrder);
                }}
                limit={limit}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setCurrentPage(1);
                  fetchConfigs(1, newLimit, sortBy, sortOrder);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationConfigList;






// import React, { useCallback, useEffect, useState } from "react";
// import PageHeader from "../../components/layout/PageHeader";
// import {
//   getApplicationConfigList,
//   deleteApplicationConfigById,
//   updateApplicationConfigById,
// } from "../../services/applicationConfigService";
// import type {
//   ApplicationConfig,
//   ConfigStatus,
// } from "../../types/ApplicationConfig";
// import type { Config } from "../../types/Config";
// import { useNavigate } from "react-router-dom";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Pagination from "../../components/common/Pagination";

// const ApplicationConfigList: React.FC = () => {
//   const [configs, setConfigs] = useState<ApplicationConfig[]>([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ Filters
//   const [searchKey, setSearchKey] = useState("");
//   const [searchValue, setSearchValue] = useState("");
//   const [searchDisplayOrder, setSearchDisplayOrder] = useState("");
//   const [searchStatus, setSearchStatus] = useState<"" | ConfigStatus>("");

//   // ✅ Pagination
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [limit, setLimit] = useState<number>(10);
//   const [totalPages, setTotalPages] = useState<number>(1);

//   const nav = useNavigate();

//   // ✅ Fetch configs
//   const fetchConfigs = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await getApplicationConfigList(currentPage, limit);

//       const data: Config[] = Array.isArray(response.data) ? response.data : [];
//       const fixedData: ApplicationConfig[] = data.map((c: Config) => ({
//         id: c.id,
//         key: c.key,
//         value: c.value ?? "",
//         displayOrder: c.displayOrder,
//         status: c.status as ConfigStatus,
//         createdBy: c.createdBy ?? undefined,
//         updatedBy: c.updatedBy ?? undefined,
//         createdAt: c.createdAt,
//         updatedAt: c.updatedAt ?? undefined,
//       }));

//       setConfigs(fixedData);
//       setTotalPages(
//         response.total
//           ? Math.ceil(response.total / limit)
//           : Math.ceil(fixedData.length / limit)
//       );
//     } catch (err) {
//       console.error("Failed to fetch configs:", err);
//       toast.error("Failed to load configurations");
//     } finally {
//       setLoading(false);
//     }
//   }, [currentPage, limit]);

//   useEffect(() => {
//     fetchConfigs();
//   }, [fetchConfigs]);

//   // ✅ Delete
//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this configuration?"))
//       return;
//     try {
//       await deleteApplicationConfigById(id);
//       setConfigs((prev) => prev.filter((c) => c.id !== id));
//       toast.success("Configuration deleted ");
//       fetchConfigs();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete configuration ");
//     }
//   };

//   // ✅ Toggle Status
//   const handleToggle = async (config: ApplicationConfig) => {
//     const newStatus: ConfigStatus =
//       config.status === "active" ? "inactive" : "active";
//     try {
//       await updateApplicationConfigById(config.id, {
//         key: config.key,
//         value: config.value,
//         displayOrder: config.displayOrder,
//         status: newStatus,
//       });
//       setConfigs((prev) =>
//         prev.map((c) => (c.id === config.id ? { ...c, status: newStatus } : c))
//       );
//       toast.success(`Status updated to ${newStatus} ✅`);
//     } catch (err) {
//       console.error("Toggle error:", err);
//       toast.error("Failed to update status ");
//     }
//   };

//   // ✅ Client-side filters
//   const filteredConfigs = configs.filter((c) => {
//     const matchesKey = c.key.toLowerCase().includes(searchKey.toLowerCase());
//     const matchesValue = c.value
//       .toLowerCase()
//       .includes(searchValue.toLowerCase());
//     const matchesDisplayOrder = searchDisplayOrder
//       ? c.displayOrder.toString().includes(searchDisplayOrder)
//       : true;
//     const matchesStatus = searchStatus ? c.status === searchStatus : true;
//     return matchesKey && matchesValue && matchesDisplayOrder && matchesStatus;
//   });

//   return (
//     <div>
//       {/* <PageHeader
//         title="Application Configurations"
//         right={
//           <button
//             onClick={() => nav("/application-config/add")}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Add Config
//           </button>
//         }
//       /> */}
//       {/* here adding the export csv */}
//       <PageHeader
//         title="Application Configurations"
//         right={
//           <div className="flex gap-2">
//             {/* ✅ Export CSV Button (consistent across pages) */}
//             <button
//               onClick={() => {
//                 if (!configs.length) {
//                   toast.error("No configurations to export ");
//                   return;
//                 }

//                 try {
//                   const headers = ["Key", "Value", "Display Order", "Status"];
//                   const csvRows = [
//                     headers.join(","),
//                     ...configs.map((c) => {
//                       const key = c.key ?? "-";
//                       const value = c.value ?? "-";
//                       const displayOrder =
//                         c.displayOrder !== undefined && c.displayOrder !== null
//                           ? c.displayOrder.toString()
//                           : "-";
//                       const status = c.status ?? "-";

//                       return [
//                         `"${key.replace(/"/g, '""')}"`,
//                         `"${value.replace(/"/g, '""')}"`,
//                         `"${displayOrder.replace(/"/g, '""')}"`,
//                         `"${status}"`,
//                       ].join(",");
//                     }),
//                   ];

//                   const blob = new Blob([csvRows.join("\n")], {
//                     type: "text/csv;charset=utf-8;",
//                   });
//                   const url = window.URL.createObjectURL(blob);
//                   const link = document.createElement("a");
//                   link.href = url;
//                   link.setAttribute(
//                     "download",
//                     "application_configs_export.csv"
//                   );
//                   document.body.appendChild(link);
//                   link.click();
//                   document.body.removeChild(link);

//                   toast.success(
//                     "Application configurations exported successfully ✅"
//                   );
//                 } catch (err) {
//                   console.error("CSV Export Error:", err);
//                   toast.error("Failed to export CSV ");
//                 }
//               }}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer"
//             >
//               Export CSV
//             </button>

//             {/* ✅ Add Config Button (unchanged) */}
//             <button
//               onClick={() => nav("/application-config/add")}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer"
//             >
//               Add Config
//             </button>
//           </div>
//         }
//       />

//       <Toaster position="top-right" />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <div className="text-center py-6 text-gray-500">
//             Loading configurations...
//           </div>
//         ) : (
//           <>
//             <table className="min-w-full border text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="p-3 text-left">Key</th>
//                   <th className="p-3 text-left">Value</th>
//                   <th className="p-3 text-left">Display Order</th>
//                   <th className="p-3 text-left">Status</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>

//                 {/* ✅ Search Row */}
//                 <tr className="bg-gray-100 border-t">
//                   <th className="p-2">
//                     <input
//                       type="text"
//                       placeholder="Search Key"
//                       value={searchKey}
//                       onChange={(e) => {
//                         const cleanedValue = e.target.value.replace(
//                           /^\s+|\s+$/g,
//                           ""
//                         );
//                         setSearchKey(cleanedValue);
//                         setCurrentPage(1);
//                       }}
//                       onKeyDown={(e) => {
//                         if (
//                           e.key === " " &&
//                           (e.currentTarget.selectionStart === 0 ||
//                             !e.currentTarget.value.trim())
//                         ) {
//                           e.preventDefault();
//                         }
//                       }}
//                       className="w-full border rounded px-2 py-1 text-sm"
//                     />
//                   </th>
//                   <th className="p-2">
//                     <input
//                       type="text"
//                       placeholder="Search Value"
//                       value={searchValue}
//                       onChange={(e) => {
//                         const cleanedValue = e.target.value.replace(
//                           /^\s+|\s+$/g,
//                           ""
//                         );
//                         setSearchValue(cleanedValue);
//                         setCurrentPage(1);
//                       }}
//                       onKeyDown={(e) => {
//                         if (
//                           e.key === " " &&
//                           (e.currentTarget.selectionStart === 0 ||
//                             !e.currentTarget.value.trim())
//                         ) {
//                           e.preventDefault();
//                         }
//                       }}
//                       className="w-full border rounded px-2 py-1 text-sm"
//                     />
//                   </th>
//                   <th className="p-2">
//                     <input
//                       type="text"
//                       placeholder="Search Display Order"
//                       value={searchDisplayOrder}
//                       onChange={(e) => {
//                         const cleanedValue = e.target.value.replace(
//                           /^\s+|\s+$/g,
//                           ""
//                         );
//                         setSearchDisplayOrder(cleanedValue);
//                         setCurrentPage(1);
//                       }}
//                       onKeyDown={(e) => {
//                         if (
//                           e.key === " " &&
//                           (e.currentTarget.selectionStart === 0 ||
//                             !e.currentTarget.value.trim())
//                         ) {
//                           e.preventDefault();
//                         }
//                       }}
//                       className="w-full border rounded px-2 py-1 text-sm"
//                     />
//                   </th>
//                   <th className="p-2">
//                     <select
//                       value={searchStatus}
//                       onChange={(e) => {
//                         setSearchStatus(e.target.value as "" | ConfigStatus);
//                         setCurrentPage(1);
//                       }}
//                       className="w-full border rounded px-2 py-1 text-sm"
//                     >
//                       <option value="">All</option>
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </th>
//                   <th></th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {filteredConfigs.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={5}
//                       className="text-center p-4 text-gray-500 italic"
//                     >
//                       No configurations found.
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredConfigs.map((c) => (
//                     <tr key={c.id} className="border-t hover:bg-gray-50">
//                       <td className="p-3">{c.key}</td>
//                       <td className="p-3">{c.value}</td>
//                       <td className="p-3">{c.displayOrder}</td>
//                       <td className="p-3">
//                         <label className="relative inline-flex items-center cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={c.status === "active"}
//                             onChange={() => handleToggle(c)}
//                             className="sr-only peer"
//                           />
//                           <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
//                         </label>
//                       </td>
//                       <td className="p-3 text-center space-x-3">
//                         <button
//                           onClick={() =>
//                             nav(`/application-config/edit/${c.id}`)
//                           }
//                           className="text-yellow-600 hover:text-yellow-800"
//                           title="Edit Config"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(c.id)}
//                           className="text-red-600 hover:text-red-800"
//                           title="Delete Config"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>

//             {/* ✅ Pagination */}
//             <div className="flex justify-end items-center p-3">
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={(page) => setCurrentPage(page)}
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

// export default ApplicationConfigList;

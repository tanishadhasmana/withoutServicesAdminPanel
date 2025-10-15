import { useEffect, useState, useCallback } from "react";
import PageHeader from "../../components/layout/PageHeader";
import Pagination from "../../components/common/Pagination";
import { getAuditLogs } from "../../services/auditService";
import type { AuditLog } from "../../types/AuditLog";

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Filters
  const [searchUser, setSearchUser] = useState<string>("");
  const [searchType, setSearchType] = useState<string>("");
  const [searchActivity, setSearchActivity] = useState<string>("");

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // ✅ Fetch logs (server-side pagination)
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, total, totalPages } = await getAuditLogs(currentPage, limit);

      // Basic client-side filtering (if backend doesn’t handle it)
      const filtered = data.filter((log: AuditLog) => {
        const matchUser = log.username
          ?.toLowerCase()
          .includes(searchUser.toLowerCase());
        const matchType = log.type
          ?.toLowerCase()
          .includes(searchType.toLowerCase());
        const matchActivity = log.activity
          ?.toLowerCase()
          .includes(searchActivity.toLowerCase());
        return matchUser && matchType && matchActivity;
      });

      setLogs(filtered);
      setTotalItems(total);
      setTotalPages(totalPages);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      alert("Failed to load audit logs ❌");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchUser, searchType, searchActivity]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      {/* <PageHeader title="Audit Logs" /> */}
      {/* addede export csv btn */}
      <PageHeader
  title="Audit Logs"
  right={
    <button
      onClick={() => {
        if (!logs.length) return;

        const headers = ["ID", "User", "Type", "Activity", "Timestamp"];
        const csvRows = [
          headers.join(","),
          ...logs.map((l) =>
            [
              l.id ?? "-",
              `"${(l.username ?? "-").replace(/"/g, '""')}"`,
              `"${(l.type ?? "-").replace(/"/g, '""')}"`,
              `"${(l.activity ?? "-").replace(/"/g, '""')}"`,
              `"${l.timestamp ? new Date(l.timestamp).toLocaleString() : "-"}"`,
            ].join(",")
          ),
        ];

        const blob = new Blob([csvRows.join("\n")], {
          type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "audit_logs_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Export CSV
    </button>
  }
/>


      <div className="bg-white rounded shadow p-4 mt-4">
        {loading ? (
          <div className="text-center text-gray-500 py-6">
            Loading audit logs...
          </div>
        ) : (
          <>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2 px-3 text-left">#</th>
                  <th className="py-2 px-3 text-left">User</th>
                  <th className="py-2 px-3 text-left">Type</th>
                  <th className="py-2 px-3 text-left">Activity</th>
                  <th className="py-2 px-3 text-left">Timestamp</th>
                </tr>

                {/* ✅ Search Row with Sanitized Inputs */}
                <tr className="bg-gray-100 border-t">
                  <th className="p-2 text-center text-gray-400">—</th>
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search User"
                      value={searchUser}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/^\s+|\s+$/g, "");
                        setSearchUser(cleaned);
                        setCurrentPage(1);
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === " " &&
                          (e.currentTarget.selectionStart === 0 ||
                            !e.currentTarget.value.trim())
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Type"
                      value={searchType}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/^\s+|\s+$/g, "");
                        setSearchType(cleaned);
                        setCurrentPage(1);
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === " " &&
                          (e.currentTarget.selectionStart === 0 ||
                            !e.currentTarget.value.trim())
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="text"
                      placeholder="Search Activity"
                      value={searchActivity}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/^\s+|\s+$/g, "");
                        setSearchActivity(cleaned);
                        setCurrentPage(1);
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === " " &&
                          (e.currentTarget.selectionStart === 0 ||
                            !e.currentTarget.value.trim())
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{log.id}</td>
                      <td className="py-2 px-3">{log.username}</td>
                      <td className="py-2 px-3">{log.type}</td>
                      <td className="py-2 px-3">{log.activity}</td>
                      <td className="py-2 px-3">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-gray-500 italic"
                    >
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ✅ Pagination + Total Count */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-600">
                Total Logs: {totalItems}
              </span>
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

export default AuditLogsPage;



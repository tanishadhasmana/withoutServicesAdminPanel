import { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { getAuditLogs } from "../../services/auditService";
import type { AuditLog } from "../../types/AuditLog";

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLogs(await getAuditLogs());
      } catch (err) {
        console.error(err);
        alert("Failed to load audit logs");
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Audit Logs" />
      <div className="bg-white rounded shadow p-4 mt-4">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">ID</th>
              <th className="py-2 text-left">User</th>
              <th className="py-2 text-left">Type</th>
              <th className="py-2 text-left">Activity</th>
              <th className="py-2 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="py-2">{l.id}</td>
                <td className="py-2">{l.username}</td>
                <td className="py-2">{l.type || "-"}</td>
                <td className="py-2">{l.activity || "-"}</td>
                <td className="py-2">
                  {new Date(l.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No logs available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage;

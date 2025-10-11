import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import {
  getApplicationConfigList,
  deleteApplicationConfigById,
  updateApplicationConfigById,
} from "../../services/applicationConfigService";
import type { ApplicationConfig, ConfigStatus } from "../../types/ApplicationConfig";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const ApplicationConfigList: React.FC = () => {
  const [configs, setConfigs] = useState<ApplicationConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Search state
  const [searchKey, setSearchKey] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [searchDisplayOrder, setSearchDisplayOrder] = useState(""); // New search
  const [searchStatus, setSearchStatus] = useState<"" | ConfigStatus>("");

  const nav = useNavigate();

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await getApplicationConfigList();
const fixedData: ApplicationConfig[] = data.map((c) => ({
  id: c.id,
  key: c.key,
  value: c.value ?? "",           // ensure string
  displayOrder: c.displayOrder,
  status: c.status,
  createdBy: c.createdBy ?? undefined,
  updatedBy: c.updatedBy ?? undefined,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt ?? undefined,
  deletedAt: c.deletedAt ?? undefined,
}));


      setConfigs(fixedData);
    } catch (err) {
      console.error("Failed to fetch configs:", err);
      toast.error("Failed to load configs ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) return;
    try {
      await deleteApplicationConfigById(id);
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      toast.success("Configuration deleted ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete configuration ❌");
    }
  };

  const handleToggle = async (config: ApplicationConfig) => {
    const newStatus: ConfigStatus = config.status === "active" ? "inactive" : "active";
    try {
      await updateApplicationConfigById(config.id, { ...config, status: newStatus });
      setConfigs((prev) =>
        prev.map((c) => (c.id === config.id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Status updated to ${newStatus} ✅`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status ❌");
    }
  };

  const filteredConfigs = configs.filter((c) => {
    const matchesKey = c.key.toLowerCase().includes(searchKey.toLowerCase());
    const matchesValue = c.value.toLowerCase().includes(searchValue.toLowerCase());
    const matchesDisplayOrder = searchDisplayOrder
      ? c.displayOrder.toString().includes(searchDisplayOrder)
      : true;
    const matchesStatus = searchStatus ? c.status === searchStatus : true;
    return matchesKey && matchesValue && matchesDisplayOrder && matchesStatus;
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Application Configurations"
        right={
          <button
            onClick={() => nav("/application-config/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Config
          </button>
        }
      />
      <Toaster position="top-right" />

      <div className="bg-white rounded shadow overflow-auto mt-4">
        {loading ? (
          <p className="text-center py-6 text-gray-500">Loading configurations...</p>
        ) : (
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Key</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Display Order</th>
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
                    onChange={(e) => setSearchKey(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </th>
                <th className="p-2">
                  <input
                    type="text"
                    placeholder="Search Value"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </th>
                <th className="p-2">
                  <input
                    type="text"
                    placeholder="Search Display Order"
                    value={searchDisplayOrder}
                    onChange={(e) => setSearchDisplayOrder(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </th>
                <th className="p-2">
                  <select
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value as "" | ConfigStatus)}
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
                        <input
                          type="checkbox"
                          checked={c.status === "active"}
                          onChange={() => handleToggle(c)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </td>
                    <td className="p-3 text-center space-x-3">
                      <button
                        onClick={() => nav(`/application-config/edit/${c.id}`)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit Config"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Config"
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

export default ApplicationConfigList;






// import React, { useEffect, useState } from "react";
// import PageHeader from "../../components/layout/PageHeader";
// import {
//   getApplicationConfigList,
//   deleteApplicationConfigById,
//   updateApplicationConfigById,
// } from "../../services/applicationConfigService";
// import type { ApplicationConfig, ConfigStatus } from "../../types/ApplicationConfig";
// import { useNavigate } from "react-router-dom";
// import { Edit, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// const ApplicationConfigList: React.FC = () => {
//   const [configs, setConfigs] = useState<ApplicationConfig[]>([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ Search state
//   const [searchKey, setSearchKey] = useState("");
//   const [searchValue, setSearchValue] = useState("");
//   const [searchDisplayOrder, setSearchDisplayOrder] = useState(""); // New search
//   const [searchStatus, setSearchStatus] = useState<"" | ConfigStatus>("");

//   const nav = useNavigate();

//   const fetchConfigs = async () => {
//     try {
//       setLoading(true);
//       const data = await getApplicationConfigList();
//       setConfigs(data);
//     } catch (err) {
//       console.error("Failed to fetch configs:", err);
//       toast.error("Failed to load configs ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchConfigs();
//   }, []);

//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this configuration?")) return;
//     try {
//       await deleteApplicationConfigById(id);
//       setConfigs((prev) => prev.filter((c) => c.id !== id));
//       toast.success("Configuration deleted ✅");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete configuration ❌");
//     }
//   };

//   const handleToggle = async (config: ApplicationConfig) => {
//     const newStatus: ConfigStatus = config.status === "active" ? "inactive" : "active";
//     try {
//       await updateApplicationConfigById(config.id, { ...config, status: newStatus });
//       setConfigs((prev) =>
//         prev.map((c) => (c.id === config.id ? { ...c, status: newStatus } : c))
//       );
//       toast.success(`Status updated to ${newStatus} ✅`);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update status ❌");
//     }
//   };

//   const filteredConfigs = configs.filter((c) => {
//     const matchesKey = c.key.toLowerCase().includes(searchKey.toLowerCase());
//     const matchesValue = c.value.toLowerCase().includes(searchValue.toLowerCase());
//     const matchesDisplayOrder = searchDisplayOrder
//       ? c.displayOrder.toString().includes(searchDisplayOrder)
//       : true;
//     const matchesStatus = searchStatus ? c.status === searchStatus : true;
//     return matchesKey && matchesValue && matchesDisplayOrder && matchesStatus;
//   });

//   return (
//     <div className="p-6">
//       <PageHeader
//         title="Application Configurations"
//         right={
//           <button
//             onClick={() => nav("/application-config/add")}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Add Config
//           </button>
//         }
//       />
//       <Toaster position="top-right" />

//       <div className="bg-white rounded shadow overflow-auto mt-4">
//         {loading ? (
//           <p className="text-center py-6 text-gray-500">Loading configurations...</p>
//         ) : (
//           <table className="min-w-full border text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-3 text-left">Key</th>
//                 <th className="p-3 text-left">Value</th>
//                 <th className="p-3 text-left">Display Order</th>
//                 <th className="p-3 text-left">Status</th>
//                 <th className="p-3 text-center">Actions</th>
//               </tr>

//               {/* Search Row */}
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
//                     placeholder="Search Value"
//                     value={searchValue}
//                     onChange={(e) => setSearchValue(e.target.value)}
//                     className="w-full border rounded px-2 py-1 text-sm"
//                   />
//                 </th>
//                 <th className="p-2">
//                   <input
//                     type="text"
//                     placeholder="Search Display Order"
//                     value={searchDisplayOrder}
//                     onChange={(e) => setSearchDisplayOrder(e.target.value)}
//                     className="w-full border rounded px-2 py-1 text-sm"
//                   />
//                 </th>
//                 <th className="p-2">
//                   <select
//                     value={searchStatus}
//                     onChange={(e) => setSearchStatus(e.target.value as "" | ConfigStatus)}
//                     className="w-full border rounded px-2 py-1 text-sm"
//                   >
//                     <option value="">All</option>
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
//                 </th>
//                 <th></th>
//               </tr>
//             </thead>

//             <tbody>
//               {filteredConfigs.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="text-center p-4 text-gray-500 italic">
//                     No configurations found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredConfigs.map((c) => (
//                   <tr key={c.id} className="border-t hover:bg-gray-50">
//                     <td className="p-3">{c.key}</td>
//                     <td className="p-3">{c.value}</td>
//                     <td className="p-3">{c.displayOrder}</td>
//                     <td className="p-3">
//                       <label className="relative inline-flex items-center cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={c.status === "active"}
//                           onChange={() => handleToggle(c)}
//                           className="sr-only peer"
//                         />
//                         <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
//                       </label>
//                     </td>
//                     <td className="p-3 text-center space-x-3">
//                       <button
//                         onClick={() => nav(`/application-config/edit/${c.id}`)}
//                         className="text-yellow-600 hover:text-yellow-800"
//                         title="Edit Config"
//                       >
//                         <Edit size={18} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(c.id)}
//                         className="text-red-600 hover:text-red-800"
//                         title="Delete Config"
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

// export default ApplicationConfigList;


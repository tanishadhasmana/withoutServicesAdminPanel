import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export type PermissionItem = {
  id: number;
  name: string; // e.g. "user_list", "email_edit"
  status?: string | null;
};

interface Props {
  permissions: PermissionItem[];
  selectedIds: number[];
  onToggle: (permissionId: number) => void;
}

const PermissionMatrix: React.FC<Props> = ({
  permissions,
  selectedIds,
  onToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  // Group permissions by module (before "_")
  const grouped = permissions.reduce<Record<string, PermissionItem[]>>(
    (acc, p) => {
      const [moduleName] = p.name.split("_");
      acc[moduleName] = acc[moduleName] || [];
      acc[moduleName].push(p);
      return acc;
    },
    {}
  );

  // Filter modules by search
  const filteredModules = Object.keys(grouped).filter((module) =>
    module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const actionOrder = ["list", "add", "edit", "delete"];

  // Toggle accordion open/close
  const toggleAccordion = (module: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  // Handle Select All / Unselect All for a module
  const handleSelectAll = (module: string) => {
    const modulePerms = grouped[module];
    const allSelected = modulePerms.every((p) =>
      selectedIds.includes(p.id)
    );

    modulePerms.forEach((p) => {
      const isSelected = selectedIds.includes(p.id);
      if (allSelected && isSelected) onToggle(p.id); // uncheck all
      else if (!allSelected && !isSelected) onToggle(p.id); // check all
    });
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ marginBottom: "1rem", fontWeight: "600" }}>
        Permissions <span style={{ color: "red" }}>*</span>
      </h3>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search modules..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />

      <hr style={{ marginBottom: "15px" }} />

      {/* Accordion List */}
      {filteredModules.map((module) => {
        const isOpen = openModules[module] || false;
        const modulePerms = grouped[module];
        const allSelected = modulePerms.every((p) =>
          selectedIds.includes(p.id)
        );

        return (
          <div
            key={module}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "10px",
              overflow: "hidden",
              backgroundColor: "#fff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            {/* Header */}
            <div
              onClick={() => toggleAccordion(module)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                cursor: "pointer",
                backgroundColor: "#f9f9f9",
                borderBottom: isOpen ? "1px solid #eee" : "none",
              }}
            >
              <div style={{ fontWeight: "600", textTransform: "capitalize" }}>
                {module}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Show Select All only when expanded */}
                {isOpen && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent accordion toggle
                      handleSelectAll(module);
                    }}
                    style={{
                      backgroundColor: allSelected ? "#f44336" : "#1976d2",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    {allSelected ? "Unselect All" : "Select All"}
                  </button>
                )}
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {/* Details */}
            {isOpen && (
              <div
                style={{
                  padding: "10px 16px 14px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                {actionOrder.map((action) => {
                  const perm = modulePerms.find((p) =>
                    p.name.endsWith(`_${action}`)
                  );
                  if (!perm) return null;

                  return (
                    <label
                      key={perm.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.95rem",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(perm.id)}
                        onChange={() => onToggle(perm.id)}
                      />
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {filteredModules.length === 0 && (
        <p style={{ marginTop: "10px", color: "#777", fontSize: "0.9rem" }}>
          No modules found matching your search.
        </p>
      )}
    </div>
  );
};

export default PermissionMatrix;





// import React, { useState } from "react";
// import {
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Checkbox,
//   FormControlLabel,
//   Typography,
//   TextField,
//   Box,
//   Divider,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; //react icons.

// export type PermissionItem = {
//   id: number;
//   name: string; // e.g. "user_list", "email_edit"
//   status?: string | null;
// };

// interface Props {
//   permissions: PermissionItem[];
//   selectedIds: number[];
//   onToggle: (permissionId: number) => void;
// }

// const PermissionMatrix: React.FC<Props> = ({
//   permissions,
//   selectedIds,
//   onToggle,
// }) => {
//   const [searchTerm, setSearchTerm] = useState("");

//   // Group permissions by module (before "_")
//   const grouped = permissions.reduce<Record<string, PermissionItem[]>>(
//     (acc, p) => {
//       const parts = p.name.split("_");
//       const moduleName = parts[0] || "other";
//       acc[moduleName] = acc[moduleName] || [];
//       acc[moduleName].push(p);
//       return acc;
//     },
//     {}
//   );

//   // Filter by search
//   const filteredModules = Object.keys(grouped).filter((module) =>
//     module.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const actionOrder = ["list", "add", "edit", "delete"];

//   return (
//     <Box mt={4}>
//       <Typography variant="h6" mb={2}>
//         Permissions<span style={{ color: "red" }}>*</span>
//       </Typography>

//       {/* 🔍 Search */}
//       <TextField
//         label="Search modules..."
//         size="small"
//         variant="outlined"
//         fullWidth
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         sx={{ mb: 2 }}
//       />

//       <Divider sx={{ mb: 2 }} />

//       {/* Accordion for each module */}
//       {filteredModules.map((module) => (
//         <Accordion key={module} disableGutters elevation={1}>
//           <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//             <Typography fontWeight="600" textTransform="capitalize">
//               {module}
//             </Typography>
//           </AccordionSummary>

//           <AccordionDetails>
//             <Box display="flex" flexWrap="wrap" gap={2}>
//               {actionOrder.map((action) => {
//                 const perm = grouped[module].find((p) =>
//                   p.name.endsWith(`_${action}`)
//                 );
//                 if (!perm) return null;

//                 return (
//                   <FormControlLabel
//                     key={perm.id}
//                     control={
//                       <Checkbox
//                         checked={selectedIds.includes(perm.id)}
//                         onChange={() => onToggle(perm.id)}
//                       />
//                     }
//                     label={action.charAt(0).toUpperCase() + action.slice(1)}
//                   />
//                 );
//               })}
//             </Box>
//           </AccordionDetails>
//         </Accordion>
//       ))}

//       {filteredModules.length === 0 && (
//         <Typography variant="body2" color="text.secondary" mt={2}>
//           No modules found matching your search.
//         </Typography>
//       )}
//     </Box>
//   );
// };

// export default PermissionMatrix;


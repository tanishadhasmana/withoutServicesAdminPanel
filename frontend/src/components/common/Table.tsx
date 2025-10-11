// src/components/common/Table.tsx
import React from "react";

interface Props {
  headers: string[];
  rows: React.ReactNode[];
}
const Table: React.FC<Props> = ({ headers, rows }) => (
  <div className="bg-white rounded shadow overflow-auto">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((h) => <th key={h} className="text-left p-3 text-sm text-gray-600">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => <tr key={i} className="border-t">{r}</tr>)}
      </tbody>
    </table>
  </div>
);
export default Table;

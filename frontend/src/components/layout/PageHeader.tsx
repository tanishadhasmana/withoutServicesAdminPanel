// src/components/layout/PageHeader.tsx
import React from "react";

const PageHeader: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
  <div className="flex items-center justify-between mb-4">
    <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
    {right}
  </div>
);

export default PageHeader;

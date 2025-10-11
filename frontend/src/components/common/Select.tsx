// src/components/common/Select.tsx
import React from "react";

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`w-full border px-3 py-2 rounded ${props.className ?? ""}`}></select>
);

export default Select;

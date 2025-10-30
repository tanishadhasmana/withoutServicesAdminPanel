// src/components/common/Button.tsx
import React from "react";
//HTMLButtonElement means this gives ur button component all the normal props children is buttons inner content, and rest is other button attributes like onClick, className, etc.
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ children, ...rest }) => (
  <button {...rest} className={`px-4 py-2 rounded ${rest.className ?? "bg-blue-600 text-white"}`}>
    {children}
  </button>
);

export default Button;

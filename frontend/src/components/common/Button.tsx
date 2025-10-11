// src/components/common/Button.tsx
import React from "react";

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ children, ...rest }) => (
  <button {...rest} className={`px-4 py-2 rounded ${rest.className ?? "bg-blue-600 text-white"}`}>
    {children}
  </button>
);

export default Button;

// src/components/common/Input.tsx
import React from "react";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full border px-3 py-2 rounded ${props.className ?? ""}`} />
);

export default Input;

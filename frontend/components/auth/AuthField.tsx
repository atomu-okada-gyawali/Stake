"use client";

import { InputHTMLAttributes } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefix?: string;
}

export default function AuthField({ label, prefix, className = "", ...props }: AuthFieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-stake-muted uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="w-full flex items-center bg-white border border-[#6B7280]">
        {prefix && <span className="pl-4 text-stake-accent text-lg">{prefix}</span>}
        <input
          {...props}
          className={`w-full bg-transparent px-4 py-4 text-[#353534] text-lg outline-none ${className}`}
        />
      </div>
    </div>
  );
}

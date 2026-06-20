"use client";

import { ChevronRight } from "./Icons";

interface PrimaryButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "default" | "submit";
}

export default function PrimaryButton({ onClick, disabled, children, variant = "default" }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-stake-accent text-[#161E00] font-bold uppercase tracking-wider hover:bg-stake-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
        variant === "submit"
          ? "py-4 text-base shadow-[0_0_20px_rgba(187,244,0,0.15)]"
          : "py-5 text-xs shadow-[0_0_20px_rgba(187,244,0,0.2)]"
      }`}
    >
      {children}
      {variant !== "submit" && <ChevronRight />}
    </button>
  );
}

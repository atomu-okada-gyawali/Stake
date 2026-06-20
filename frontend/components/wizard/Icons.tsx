"use client";

interface IconProps {
  className?: string;
}

export function ChevronLeft({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 16 16">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 12L6 8l4-4" />
    </svg>
  );
}

export function ChevronRight({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 16 16">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4l4 4-4 4" />
    </svg>
  );
}

export function Checkmark({ className = "w-full h-full" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function Calendar({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 20 20">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2v2m8-2v2M3 8h14M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
    </svg>
  );
}

export function Person({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export function Search({ className = "w-[18px] h-[18px]" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  );
}

export function Plus({ className = "w-[9px] h-[9px]" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 10 10">
      <path strokeLinecap="round" strokeWidth="2" d="M5 1v8M1 5h8" />
    </svg>
  );
}

export function PersonIcon({ className = "w-[18px] h-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 18 20">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1C6.79 1 5 2.79 5 5v3c0 2.21 1.79 4 4 4s4-1.79 4-4V5c0-2.21-1.79-4-4-4zM5 14c-2.21 0-4 1.79-4 4v1h16v-1c0-2.21-1.79-4-4-4" />
    </svg>
  );
}

export function ChartIcon({ className = "w-5 h-[18px]" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 20 18">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 10h4l2-8 4 16 2-8h4" />
    </svg>
  );
}

export function ArrowRight({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

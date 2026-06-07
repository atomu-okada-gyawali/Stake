import React from "react";

type HistoryStatus = "VERIFIED" | "FAILED" | "PENDING";

interface HistoryItemProps {
  title: string;
  date: string;
  description: string;
  status: HistoryStatus;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  title,
  date,
  description,
  status,
}) => {
  const isSuccess = status === "VERIFIED";

  return (
    <div className="w-full min-h-[108px] border-b border-white/5 flex items-center px-6 gap-6 hover:bg-white/5 transition-colors cursor-pointer group">
      {/* Dynamic Icon based on status */}
      <div
        className={`w-10 h-10 border flex items-center justify-center shrink-0 transition-colors 
        ${isSuccess ? "border-stake-accent/40 bg-stake-accent/5" : "border-red-500/40 bg-red-500/5"}`}
      >
        <svg
          className={`w-5 h-5 ${isSuccess ? "text-stake-accent" : "text-red-500"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSuccess ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M6 18L18 6M6 6l12 12"
            />
          )}
        </svg>
      </div>

      <div className="flex-1 py-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-stake-muted uppercase tracking-widest">
            {date}
          </span>
          <span
            className={`text-[10px] font-black px-2 py-0.5 uppercase tracking-tighter
            ${isSuccess ? "bg-stake-accent/10 text-stake-accent" : "bg-red-500/10 text-red-500"}`}
          >
            {status}
          </span>
        </div>
        <h4 className="text-lg text-white font-bold uppercase leading-tight group-hover:text-stake-accent transition-colors">
          {title}
        </h4>
        <p className="text-xs text-stake-muted mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HistoryItem;

import React from "react";

type HistoryStatus = "VERIFIED" | "FAILED";

interface HistoryItemProps {
  title: string;
  date: string;
  description: string;
  status: HistoryStatus;
  onFailureReport?: () => void;
  reportedReason?: string;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  title,
  date,
  description,
  status,
  onFailureReport,
  reportedReason,
}) => {
  const isSuccess = status === "VERIFIED";

  return (
    <div className="py-5 flex gap-5">
      <div
        className={`w-10 h-10 border flex items-center justify-center shrink-0 ${
          isSuccess ? "border-stake-accent/40" : "border-stake-dangerText/40"
        }`}
      >
        <svg
          className={`w-5 h-5 ${isSuccess ? "text-stake-accent" : "text-stake-dangerText"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSuccess ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-stake-muted uppercase tracking-wider">
            {date}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
              isSuccess
                ? "bg-stake-accent/10 text-stake-accent"
                : "bg-stake-dangerText/10 text-stake-dangerText"
            }`}
          >
            {isSuccess ? "VERIFIED" : "REPUTATION DROP"}
          </span>
        </div>
        <h4 className={`text-lg font-bold mt-1 ${isSuccess ? "text-white" : "text-stake-muted"}`}>
          {title}
        </h4>
        <p className={`text-xs mt-1 ${isSuccess ? "text-stake-muted" : "text-stake-muted/60"}`}>
          {description}
        </p>
        {!isSuccess && (
          <>
            {reportedReason && (
              <p className="mt-2 text-stake-muted/70 text-xs italic">
                &ldquo;{reportedReason}&rdquo;
              </p>
            )}
            <button
              onClick={onFailureReport}
              className="mt-3 text-stake-dangerText text-[10px] font-bold uppercase hover:opacity-80 transition-opacity"
            >
              {reportedReason ? "Edit Failure Report" : "Submit Failure Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryItem;

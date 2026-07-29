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
  const accent = isSuccess ? "text-stake-accent" : "text-stake-dangerText";
  const alreadySubmitted = isSuccess || !!reportedReason;

  return (
    <div className="bg-stake-card border border-[#444933]/30 p-5">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className={`text-xs font-bold uppercase ${accent}`}>{date}</span>
          <h3 className="text-white text-2xl font-bold">{title}</h3>
          <p className="text-stake-muted text-base">{description}</p>
          {!isSuccess && reportedReason && (
            <p className="text-stake-muted/70 text-xs italic pt-1">
              &ldquo;{reportedReason}&rdquo;
            </p>
          )}
        </div>
        <svg
          className={`w-7 h-8 mt-4 shrink-0 ${accent}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {isSuccess ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </div>
      <div className="mt-5">
        <button
          onClick={isSuccess ? undefined : onFailureReport}
          disabled={alreadySubmitted}
          className={`px-8 py-3 font-bold text-xs uppercase transition-all ${
            alreadySubmitted
              ? "bg-stake-muted/10 text-stake-muted cursor-not-allowed"
              : "bg-stake-dangerText text-[#2B0A06] hover:brightness-95"
          }`}
        >
          {isSuccess ? "Completed" : reportedReason ? "Report Submitted" : "Submit Failure Report"}
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;

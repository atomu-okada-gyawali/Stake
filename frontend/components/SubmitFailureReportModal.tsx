"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { failuresAPI, FailureHistoryItem } from "@/lib/services";

interface SubmitFailureReportModalProps {
  open: boolean;
  onClose: () => void;
  item: FailureHistoryItem | null;
  onSubmitted: (updated: FailureHistoryItem) => void;
}

export default function SubmitFailureReportModal({
  open,
  onClose,
  item,
  onSubmitted,
}: SubmitFailureReportModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason(item?.reason ?? "");
      setError(null);
    }
  }, [open, item]);

  if (!open || !item) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await failuresAPI.submitReport({
        goalId: item.goalId,
        subtaskId: item.subtaskId,
        occurrenceDate: item.occurrenceDate,
        reason,
      });
      toast.success("Failure report submitted");
      onSubmitted({ ...item, reported: true, reason });
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Object && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : "Failed to submit failure report";
      setError(message ?? "Failed to submit failure report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-[480px] bg-stake-bg border border-[#444933] shadow-2xl mb-12">
        {/* Header */}
        <div className="mx-2 mt-2 border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-6">
            <h2 className="text-stake-textLight text-2xl font-bold">
              {item.reported ? "Edit Failure Report" : "Submit Failure Report"}
            </h2>
            <button onClick={onClose} className="text-stake-muted">
              <svg className="w-[14px] h-[14px]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="inline-flex items-center gap-2 bg-[#1C1B1B] px-3 py-1 mb-6">
            <span className="text-stake-dangerText text-xs font-bold">
              {item.title.toUpperCase()}
            </span>
          </div>

          <label className="block text-xs font-bold text-stake-muted uppercase tracking-wider mb-2">
            What happened?
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this deadline was missed. What will you change next time?"
            rows={5}
            className="w-full bg-[#1C1B1B] border border-[#444933] p-4 text-white text-sm placeholder-stake-muted/30 outline-none resize-none focus:border-stake-dangerText transition-colors"
          />

          {error && (
            <div className="mt-4 p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-[#444933] px-6 py-[12px] flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 bg-stake-dangerText text-[#2B0A06] py-[13px] text-xs font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT REPORT"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-[#444933] text-stake-textLight py-[13px] text-xs font-bold uppercase"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

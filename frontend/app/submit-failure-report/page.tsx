"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/Header";
import EvidenceUpload from "@/components/EvidenceUpload";
import { toast } from "sonner";
import { failuresAPI, FailureHistoryItem } from "@/lib/services";

function SubmitFailureReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("goalId");
  const subtaskId = searchParams.get("subtaskId");
  const occurrenceDate = searchParams.get("occurrenceDate");

  const [item, setItem] = useState<FailureHistoryItem | null>(null);
  const [itemLoading, setItemLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!goalId) {
      setItemLoading(false);
      return;
    }
    async function loadItem() {
      try {
        const { data } = await failuresAPI.list();
        const match = data.find(
          (f) =>
            f.goalId === goalId &&
            (f.subtaskId ?? "") === (subtaskId ?? "") &&
            (f.occurrenceDate ?? "") === (occurrenceDate ?? ""),
        );
        setItem(match ?? null);
        setReason(match?.reason ?? "");
      } catch {
        toast.error("Failed to load the failed task");
      } finally {
        setItemLoading(false);
      }
    }
    loadItem();
  }, [goalId, subtaskId, occurrenceDate]);

  const handleSubmit = async () => {
    if (!item || !reason.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await failuresAPI.submitReport({
        goalId: item.goalId,
        subtaskId: item.subtaskId,
        occurrenceDate: item.occurrenceDate,
        reason,
        photo: photo ?? undefined,
      });
      toast.success("Failure report submitted");
      router.push("/profile");
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

  const isEdit = !!item?.reported;

  return (
    <div className="min-h-screen bg-stake-bg font-poppins">
      <Header />
      <main className="pt-[97px]">
        <div className="max-w-[672px] mx-auto px-6 py-6">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => router.push("/profile")}
              className="text-stake-muted text-xs font-bold"
            >
              Profile
            </button>
            <svg className="w-1 h-[7px] text-stake-muted" viewBox="0 0 5 7" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1l3 2.5L1 6" />
            </svg>
            <span className="text-white text-xs font-bold">Failure Report</span>
          </div>

          <h1 className="text-white text-[32px] font-bold mb-6">
            {isEdit ? "EDIT FAILURE REPORT" : "SUBMIT FAILURE REPORT"}
          </h1>

          {item && (
            <div className="inline-flex items-center gap-2 bg-[#1C1B1B] px-3 py-1 mb-8">
              <svg className="w-3 h-3 text-stake-dangerText" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1l10 10M11 1L1 11" />
              </svg>
              <span className="text-stake-dangerText text-xs font-bold">
                TASK: {item.title.toUpperCase()}
              </span>
            </div>
          )}

          {itemLoading ? (
            <div className="border border-[#444933] bg-[#1A1A1A]/80 p-8 text-center">
              <p className="text-stake-muted text-sm">Loading...</p>
            </div>
          ) : !item ? (
            <div className="border border-[#444933] bg-[#1A1A1A]/80 p-8 text-center">
              <p className="text-stake-muted text-sm">
                No failed task specified. Open a failed task from your profile history to report it.
              </p>
            </div>
          ) : (
            <div className="bg-stake-card border border-[#444933] p-[41px]">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-stake-textLight text-xs font-bold">1. FAILURE EVIDENCE</p>
                <span className="text-stake-muted/50 text-[10px]">OPTIONAL</span>
              </div>
              <EvidenceUpload onFileSelect={setPhoto} />

              <div className="mt-[52.5px]">
                <div className="flex items-center gap-2 mb-[34px]">
                  <p className="text-stake-textLight text-xs font-bold">2. WHAT HAPPENED?</p>
                </div>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this deadline was missed. What will you change next time?"
                  rows={7}
                  className="w-full bg-[#1C1B1B] border border-[#444933] p-[17px] text-white text-base placeholder-stake-muted/30 outline-none resize-none focus:border-stake-dangerText transition-colors"
                />
              </div>

              {error && (
                <div className="mt-4 p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="mt-[66px]">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !reason.trim()}
                  className="w-full bg-stake-dangerText text-[#2B0A06] py-6 flex items-center justify-between px-6 text-2xl font-extrabold hover:bg-stake-dangerText/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "SUBMITTING..." : isEdit ? "UPDATE REPORT" : "SUBMIT REPORT"}
                  <svg className="w-5 h-5 text-[#2B0A06]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 10h10M10 5l5 5-5 5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SubmitFailureReportPage() {
  return (
    <Suspense fallback={null}>
      <SubmitFailureReportContent />
    </Suspense>
  );
}

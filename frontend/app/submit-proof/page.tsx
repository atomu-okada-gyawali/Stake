"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/Header";
import EvidenceUpload from "@/components/EvidenceUpload";
import { toast } from "sonner";
import { evidenceAPI, goalsAPI } from "@/lib/services";

function SubmitProofContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("goalId");

  const [goalTitle, setGoalTitle] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!goalId) return;
    async function loadGoal() {
      try {
        const { data } = await goalsAPI.list();
        const goals = data as { id: string; title: string }[];
        const goal = goals.find((g) => g.id === goalId);
        if (goal) setGoalTitle(goal.title);
      } catch {
        setGoalTitle("Unknown Goal");
      }
    }
    loadGoal();
  }, [goalId]);

  const handleSubmit = async () => {
    if (!goalId || !file) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await evidenceAPI.submit(goalId, file);
      toast.success("Proof submitted successfully!");
      router.push("/profile");
    } catch (err: unknown) {
      console.error("Submit proof error:", err);
      let message = "Failed to submit proof";
      if (err instanceof Object && "response" in err) {
        const axiosErr = err as { response: { data: unknown; status: number } };
        message = (axiosErr.response?.data as { message?: string })?.message ?? `Server error (${axiosErr.response?.status})`;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="text-white text-xs font-bold">Proof Submission</span>
          </div>

          <h1 className="text-white text-[32px] font-bold mb-6">SUBMIT PROOF</h1>

          {goalTitle && (
            <div className="inline-flex items-center gap-2 bg-[#1C1B1B] px-3 py-1 mb-8">
              <svg className="w-[10.5px] h-[12.25px] text-stake-accent" viewBox="0 0 11 13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 1h-6a1 1 0 00-1 1v9a1 1 0 001 1h6a1 1 0 001-1V2a1 1 0 00-1-1z" />
                <path d="M7 1v2H4V1" />
              </svg>
              <span className="text-white text-xs font-bold">TASK: {goalTitle.toUpperCase()}</span>
            </div>
          )}

          {!goalId && (
            <div className="border border-[#444933] bg-[#1A1A1A]/80 p-8 text-center">
              <p className="text-stake-muted text-sm">No goal specified. Select a goal from your profile to submit proof.</p>
            </div>
          )}

          {goalId && (
            <div className="bg-stake-card border border-[#444933] p-[41px]">
              <p className="text-stake-textLight text-xs font-bold mb-4">1. Submit Proof media</p>
              <EvidenceUpload onFileSelect={setFile} />

              <div className="mt-[52.5px]">
                <div className="flex items-center gap-2 mb-[34px]">
                  <p className="text-stake-textLight text-xs font-bold">2. REFLECTION</p>
                  <span className="text-stake-muted/50 text-[10px]">OPTIONAL</span>
                </div>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Execution summary. What did you learn? How will you adapt?"
                  rows={7}
                  className="w-full bg-[#1C1B1B] border border-[#444933] p-[17px] text-white text-base placeholder-stake-muted/30 outline-none resize-none"
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
                  disabled={isSubmitting || !file}
                  className="w-full bg-stake-accent text-[#161E00] py-6 flex items-center justify-between px-6 text-2xl font-extrabold hover:bg-stake-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT PROOF"}
                  <svg className="w-5 h-5 text-[#161E00]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
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

export default function SubmitProofPage() {
  return (
    <Suspense fallback={null}>
      <SubmitProofContent />
    </Suspense>
  );
}

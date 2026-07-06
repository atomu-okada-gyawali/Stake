"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useWizard } from "./WizardContext";
import { Calendar, Plus } from "./Icons";
import PrimaryButton from "./PrimaryButton";

export default function StepTimeline() {
  const router = useRouter();
  const { startDate, endDate, milestones, setMilestones } = useWizard();

  return (
    <div className="mt-8">
      <div className="border border-[#444933] p-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-[18px] h-5 text-stake-accent" />
              <span className="text-stake-muted text-base">GOAL TIMELINE</span>
            </div>
            <p className="text-stake-muted/70 text-sm mb-8">Define the window of commitment.</p>

            <div className="mb-6">
              <label className="text-stake-accent text-sm font-bold uppercase tracking-wider block mb-2">START DATE</label>
              <div className="relative">
                <input type="text" value={startDate ? format(startDate, "MM/dd/yyyy") : ""} readOnly className="w-full bg-[#1C1B1B] border border-[#444933] px-4 py-4 pr-10 text-white text-sm outline-none" />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-5 text-stake-muted" />
              </div>
            </div>

            <div className="mb-8">
              <label className="text-stake-accent text-sm font-bold uppercase tracking-wider block mb-2">TARGET END DATE</label>
              <div className="relative">
                <input type="text" value={endDate ? format(endDate, "MM/dd/yyyy") : "mm/dd/yyyy"} readOnly className="w-full bg-[#1C1B1B] border border-[#444933] px-4 py-4 pr-10 text-white/50 text-sm outline-none" />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stake-muted" />
              </div>
            </div>

            <div className="bg-[#0E0E0E] border border-stake-accent/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-sm font-bold leading-tight">TOTAL CAMPAIGN<br />DURATION</span>
                <span className="text-stake-accent text-sm font-bold text-right leading-tight">
                  {startDate && endDate
                    ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} DAYS`
                    : "--\nDAYS"}
                </span>
              </div>
              <div className="h-1 bg-[#444933]">
                <div className="h-1 bg-stake-accent transition-all" style={{ width: startDate && endDate ? `${Math.min(100, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) / 365 * 100)}%` : "10%" }} />
              </div>
            </div>
          </div>

          <div className="border-l border-stake-accent/30 pl-8">
            <h3 className="text-white text-sm font-bold mb-5">MILESTONES &amp; SUBTASKS</h3>
            <div className="space-y-4">
              {milestones.map((ms, i) => (
                <div key={i} className="bg-[#1F1E1E] border border-[#444933] p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-stake-muted text-sm font-bold mt-1 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <input
                      type="text"
                      value={ms}
                      onChange={(e) => {
                        const next = [...milestones];
                        next[i] = e.target.value;
                        setMilestones(next);
                      }}
                      placeholder={i === milestones.length - 1 ? "Identify next sub-task..." : ""}
                      className="w-full bg-transparent text-white text-sm placeholder-stake-muted/40 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMilestones([...milestones, ""])}
              className="flex items-center gap-2 mt-5 text-stake-accent text-sm font-bold hover:underline"
            >
              <Plus />
              ADD NEW SUBTASK
            </button>
          </div>
        </div>

        <div className="mt-8">
          <PrimaryButton onClick={() => router.push("/goals/new?step=4")}>NEXT</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

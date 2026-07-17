"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { useRouter } from "next/navigation";
import { useWizard } from "./WizardContext";
import { Calendar, Plus } from "./Icons";
import PrimaryButton from "./PrimaryButton";
import "react-day-picker/style.css";

export default function StepTimeline() {
  const router = useRouter();
  const { startDate, endDate, milestones, setMilestones } = useWizard();
  const [openPickerIndex, setOpenPickerIndex] = useState<number | null>(null);

  const updateMilestone = (index: number, patch: Partial<{ title: string; deadline: Date | undefined }>) => {
    const next = [...milestones];
    next[index] = { ...next[index], ...patch };
    setMilestones(next);
  };

  const canProceed = milestones
    .filter((m) => m.title.trim().length > 0)
    .every((m) => m.deadline);

  const deadlineDisabledMatchers = [
    ...(startDate ? [{ before: startDate }] : []),
    ...(endDate ? [{ after: endDate }] : []),
  ];

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
                <div key={i} className="relative bg-[#1F1E1E] border border-[#444933] p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-stake-muted text-sm font-bold mt-1 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <input
                      type="text"
                      value={ms.title}
                      onChange={(e) => updateMilestone(i, { title: e.target.value })}
                      placeholder={i === milestones.length - 1 ? "Identify next sub-task..." : ""}
                      className="w-full bg-transparent text-white text-sm placeholder-stake-muted/40 outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenPickerIndex(openPickerIndex === i ? null : i)}
                    className={`mt-3 ml-7 flex items-center gap-2 text-xs font-bold uppercase ${ms.deadline ? "text-stake-accent" : "text-stake-muted"}`}
                  >
                    <Calendar className="w-3.5 h-4" />
                    {ms.deadline ? format(ms.deadline, "MMM dd, yyyy") : "Set deadline"}
                  </button>

                  {openPickerIndex === i && (
                    <div className="absolute z-20 top-full left-0 mt-2 bg-stake-bg border border-[#444933] shadow-2xl">
                      <DayPicker
                        mode="single"
                        selected={ms.deadline}
                        onSelect={(date) => {
                          updateMilestone(i, { deadline: date });
                          setOpenPickerIndex(null);
                        }}
                        disabled={deadlineDisabledMatchers}
                        defaultMonth={ms.deadline ?? startDate}
                        showOutsideDays
                        className="!text-white"
                        classNames={{
                          chevron: "fill-stake-accent",
                          day: "w-9 h-9 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-none transition-colors",
                          day_button: "w-full h-full rounded-none",
                          selected: "!bg-stake-accent/20 !text-stake-accent !rounded-none",
                          disabled: "!text-stake-muted/20",
                          today: "text-white font-bold",
                          outside: "text-[#353534]",
                          caption_label: "text-white text-sm font-bold",
                          nav: "flex items-center gap-2",
                          month_grid: "w-full",
                          weekday: "text-stake-muted text-xs font-bold uppercase py-2",
                          weekdays: "text-center",
                          months: "flex justify-center p-3",
                          root: "w-full",
                        }}
                        formatters={{
                          formatCaption: (date) => format(date, "MMMM yyyy").toUpperCase(),
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMilestones([...milestones, { title: "", deadline: undefined }])}
              className="flex items-center gap-2 mt-5 text-stake-accent text-sm font-bold hover:underline"
            >
              <Plus />
              ADD NEW SUBTASK
            </button>
          </div>
        </div>

        <div className="mt-8">
          <PrimaryButton onClick={() => router.push("/goals/new?step=4")} disabled={!canProceed}>NEXT</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

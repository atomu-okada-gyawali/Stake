"use client";

import { useRouter } from "next/navigation";
import { useWizard } from "./WizardContext";
import PrimaryButton from "./PrimaryButton";

export default function StepFrequency() {
  const router = useRouter();
  const { frequencyMode, setFrequencyMode, selectedDays, setSelectedDays } = useWizard();

  return (
    <div className="mt-8">
      <div className="border border-[#444933] p-8">
        <h2 className="text-white text-2xl font-bold mb-1">SET FREQUENCY</h2>
        <p className="text-stake-muted text-base mb-8">How often will you execute this stake?</p>

        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setFrequencyMode("once")}
            className={`w-full flex items-center justify-between p-5 transition-colors ${
              frequencyMode === "once"
                ? "bg-[#2A2A2A] border border-stake-accent/40"
                : "bg-[#1C1B1B] border border-[#444933]"
            }`}
          >
            <div>
              <span className="text-stake-muted text-xs font-bold uppercase tracking-wider">SINGLE EVENT</span>
              <p className="text-white text-2xl font-bold mt-1">Once</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${frequencyMode === "once" ? "border-stake-accent" : "border-[#444933]"}`}>
              {frequencyMode === "once" && <div className="w-3 h-3 rounded-full bg-stake-accent" />}
            </div>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#444933]" />
            <span className="text-[#7A7A6A] text-xs font-bold uppercase tracking-wider">OR REPEAT ON</span>
            <div className="flex-1 h-px bg-[#444933]" />
          </div>

          <div>
            <span className="text-stake-muted text-xs font-bold uppercase tracking-wider block mb-4">WEEKLY SCHEDULE</span>
            <div className={`flex gap-2 ${frequencyMode !== "weekly" ? "opacity-40 pointer-events-none" : ""}`}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setFrequencyMode("weekly");
                    setSelectedDays(
                      selectedDays.includes(i)
                        ? selectedDays.filter((d) => d !== i)
                        : [...selectedDays, i]
                    );
                  }}
                  className={`w-12 h-12 text-lg font-bold transition-all ${
                    selectedDays.includes(i)
                      ? "bg-stake-accent text-[#161E00] shadow-[0_0_15px_rgba(187,244,0,0.2)] border border-stake-accent"
                      : "bg-[#2A2A2A] text-stake-muted border border-[#444933]"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <PrimaryButton
            onClick={() => router.push("/goals/new?step=4")}
            disabled={frequencyMode === "weekly" && selectedDays.length === 0}
          >
            NEXT
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

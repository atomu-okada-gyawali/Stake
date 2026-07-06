"use client";

import { useRouter } from "next/navigation";
import { useWizard } from "./WizardContext";
import { PersonIcon, ChartIcon, Checkmark } from "./Icons";
import PrimaryButton from "./PrimaryButton";

export default function StepIdentify() {
  const router = useRouter();
  const { goalTitle, setGoalTitle, description, setDescription, goalType, setGoalType } = useWizard();

  const canProceed = goalTitle.trim().length > 0 && goalType !== null;

  return (
    <div className="mt-8 space-y-12">
      <div className="space-y-8">
        <div className="relative">
          <input
            id="goal-title"
            type="text"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            placeholder="e.g., 100km Ultra Marathon Training"
            className="w-full bg-transparent border border-[#444933] px-3 pt-6 pb-3 text-white text-2xl font-bold placeholder-[#353534] outline-none transition-colors focus:border-stake-accent"
          />
          <label
            htmlFor="goal-title"
            className="absolute top-2 left-3 text-xs font-bold text-stake-muted uppercase tracking-wider"
          >
            GOAL TITLE
          </label>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">DESCRIPTION</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Define the success criteria and the price of failure..."
            rows={4}
            className="w-full bg-[#1C1B1B] border border-[#444933] p-5 text-white text-base placeholder-[#353534] outline-none resize-none transition-colors focus:border-stake-accent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">GOAL TYPE</span>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setGoalType("task")}
            className={`relative text-left bg-stake-bg/5 backdrop-blur-md border p-6 transition-all ${
              goalType === "task"
                ? "border-stake-accent bg-stake-accent/5"
                : "border-[#444933] hover:border-stake-muted/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-[42px] h-[44px] bg-[#353534] flex items-center justify-center">
                <PersonIcon className="w-[18px] h-5 text-stake-accent" />
              </div>
              <div className={`w-6 h-6 border transition-colors ${goalType === "task" ? "border-stake-accent bg-stake-accent" : "border-[#444933]"}`}>
                {goalType === "task" && <Checkmark className="w-full h-full text-[#161E00]" />}
              </div>
            </div>
            <div className="mt-6">
              <span className="text-white text-xs font-bold uppercase">TASK</span>
              <p className="text-stake-muted text-base mt-1 leading-relaxed">
                A singular, high-stakes objective with a hard deadline.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setGoalType("project")}
            className={`relative text-left bg-stake-bg/5 backdrop-blur-md border p-6 transition-all ${
              goalType === "project"
                ? "border-stake-accent bg-stake-accent/5"
                : "border-[#444933] hover:border-stake-muted/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-[42px] h-[44px] bg-[#353534] flex items-center justify-center">
                <ChartIcon className="w-5 h-[18px] text-[#00DBE9]" />
              </div>
              <div className={`w-6 h-6 border transition-colors ${goalType === "project" ? "border-stake-accent bg-stake-accent" : "border-[#444933]"}`}>
                {goalType === "project" && <Checkmark className="w-full h-full text-[#161E00]" />}
              </div>
            </div>
            <div className="mt-6">
              <span className="text-white text-xs font-bold uppercase">PROJECT</span>
              <p className="text-stake-muted text-base mt-1 leading-relaxed">
                A recurring habit or multi-phase journey over time.
              </p>
            </div>
          </button>
        </div>
      </div>

      <PrimaryButton onClick={() => canProceed && router.push("/goals/new?step=2")} disabled={!canProceed}>
        NEXT STEP
      </PrimaryButton>
    </div>
  );
}

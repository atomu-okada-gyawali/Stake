"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import Stepper from "./Stepper";
import "react-day-picker/style.css";

interface CreateGoalWizardProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateGoalWizard({ open, onClose }: CreateGoalWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [goalTitle, setGoalTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<"task" | "project" | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2026, 2, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [frequencyMode, setFrequencyMode] = useState<"once" | "weekly">("once");
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [milestones, setMilestones] = useState<string[]>(["Initial Benchmarking Session", ""]);

  if (!open) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4);
    } else {
      setStep(1);
      onClose();
    }
  };

  const handleClose = () => {
    setStep(1);
    setGoalTitle("");
    setDescription("");
    setGoalType(null);
    setStartDate(new Date(2026, 2, 1));
    setEndDate(undefined);
    setFrequencyMode("once");
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    setMilestones(["Initial Benchmarking Session", ""]);
    onClose();
  };

  const canProceed = goalTitle.trim().length > 0 && goalType !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-[896px] bg-stake-bg border border-[#444933] shadow-2xl mb-12">
        {/* Contextual Header & Back Action */}
        <div className="px-6 pt-12 pb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-stake-muted hover:text-white transition-colors group"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 12L6 8l4-4"
              />
            </svg>
            <span className="text-xs font-bold tracking-wider uppercase">
              {step === 2 ? "BACK TO STEP 1" : step === 3 ? "BACK TO STEP 2" : "BACK"}
            </span>
          </button>
          <h1 className="text-white text-2xl font-bold mt-3">
            SET A NEW GOAL
          </h1>
        </div>

        {/* Stepper */}
        <div className="px-6">
          <Stepper currentStep={step} />
        </div>

        {/* Step Content */}
        <div className="px-6 pb-8">
          {step === 1 && (
            <div className="mt-8 space-y-12">
              {/* Goal Identity Input */}
              <div className="space-y-8">
                {/* Goal Title Input */}
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

                {/* Description Textarea */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">
                    DESCRIPTION
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Define the success criteria and the price of failure..."
                    rows={4}
                    className="w-full bg-[#1C1B1B] border border-[#444933] p-5 text-white text-base placeholder-[#353534] outline-none resize-none transition-colors focus:border-stake-accent"
                  />
                </div>
              </div>

              {/* Goal Type Selection (Bento Cards) */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">
                  GOAL TYPE
                </span>
                <div className="grid grid-cols-2 gap-4">
                  {/* Task Card */}
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
                        <svg
                          className="w-[18px] h-5 text-stake-accent"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 18 20"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 1C6.79 1 5 2.79 5 5v3c0 2.21 1.79 4 4 4s4-1.79 4-4V5c0-2.21-1.79-4-4-4zM5 14c-2.21 0-4 1.79-4 4v1h16v-1c0-2.21-1.79-4-4-4"
                          />
                        </svg>
                      </div>
                      <div
                        className={`w-6 h-6 border transition-colors ${
                          goalType === "task"
                            ? "border-stake-accent bg-stake-accent"
                            : "border-[#444933]"
                        }`}
                      >
                        {goalType === "task" && (
                          <svg
                            className="w-full h-full text-[#161E00]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="mt-6">
                      <span className="text-white text-xs font-bold uppercase">TASK</span>
                      <p className="text-stake-muted text-base mt-1 leading-relaxed">
                        A singular, high-stakes objective with a hard deadline.
                      </p>
                    </div>
                  </button>

                  {/* Project Card */}
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
                        <svg
                          className="w-5 h-[18px] text-[#00DBE9]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 20 18"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2 10h4l2-8 4 16 2-8h4"
                          />
                        </svg>
                      </div>
                      <div
                        className={`w-6 h-6 border transition-colors ${
                          goalType === "project"
                            ? "border-stake-accent bg-stake-accent"
                            : "border-[#444933]"
                        }`}
                      >
                        {goalType === "project" && (
                          <svg
                            className="w-full h-full text-[#161E00]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
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

              {/* Action Area */}
              <div>
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="w-full bg-stake-accent text-[#161E00] py-5 font-bold text-xs uppercase tracking-wider hover:bg-stake-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(187,244,0,0.2)]"
                >
                  NEXT STEP
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 4l4 4-4 4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8">
              <div className="border border-[#444933] p-8">
                <h2 className="text-xs font-bold text-stake-muted uppercase tracking-wider mb-6">
                  GOAL TIMELINE
                </h2>

                {/* Date Range Fields */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">
                      START DATE
                    </span>
                    <div className="flex items-center border border-stake-accent px-4 py-3 gap-3">
                      <svg
                        className="w-5 h-5 text-stake-accent shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 2v2m8-2v2M3 8h14M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
                        />
                      </svg>
                      <span className="text-white text-sm font-bold">
                        {startDate ? format(startDate, "MMMM dd, yyyy").toUpperCase() : "SELECT..."}
                      </span>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">
                      END DATE
                    </span>
                    <div className="flex items-center border border-[#444933] px-4 py-3 gap-3">
                      <svg
                        className="w-5 h-5 text-stake-muted shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 2v2m8-2v2M3 8h14M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
                        />
                      </svg>
                      <span className="text-[#353534] text-sm font-bold">
                        {endDate ? format(endDate, "MMMM dd, yyyy").toUpperCase() : "SELECT..."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calendar */}
                <div className="flex justify-center">
                  <DayPicker
                    mode="range"
                    selected={{ from: startDate, to: endDate }}
                    onSelect={(range) => {
                      setStartDate(range?.from);
                      setEndDate(range?.to);
                    }}
                    defaultMonth={startDate}
                    showOutsideDays
                    className="!text-white"
                    classNames={{
                      chevron: "fill-stake-accent",
                      day: "w-10 h-10 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-none transition-colors",
                      day_button: "w-full h-full rounded-none",
                      selected: "!bg-stake-accent/20 !text-stake-accent !rounded-none relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[2px] after:bg-stake-accent",
                      range_start: "!bg-stake-accent/20 !text-stake-accent !rounded-none relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[2px] after:bg-stake-accent",
                      range_end: "!bg-stake-accent/20 !text-stake-accent !rounded-none relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[2px] after:bg-stake-accent",
                      range_middle: "!bg-stake-accent/10 !text-stake-accent/80 !rounded-none",
                      today: "text-white font-bold",
                      outside: "text-[#353534]",
                      caption_label: "text-white text-sm font-bold",
                      nav: "flex items-center gap-2",
                      month_grid: "w-full",
                      weekday: "text-stake-muted text-xs font-bold uppercase py-2",
                      weekdays: "text-center",
                      months: "flex justify-center",
                      root: "w-full max-w-sm",
                    }}
                    formatters={{
                      formatCaption: (date) => format(date, "MMMM yyyy").toUpperCase(),
                    }}
                  />
                </div>

                {/* Action Area */}
                <div className="mt-8">
                  <button
                    onClick={handleNext}
                    disabled={!startDate || !endDate}
                    className="w-full bg-stake-accent text-[#161E00] py-5 font-bold text-xs uppercase tracking-wider hover:bg-stake-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(187,244,0,0.2)]"
                  >
                    NEXT
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 4l4 4-4 4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && goalType === "task" && (
            <div className="mt-8">
              <div className="border border-[#444933] p-8">
                <h2 className="text-white text-2xl font-bold mb-1">SET FREQUENCY</h2>
                <p className="text-stake-muted text-base mb-8">How often will you execute this stake?</p>

                {/* Frequency Selection */}
                <div className="space-y-6">
                  {/* Option: Once */}
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
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        frequencyMode === "once"
                          ? "border-stake-accent"
                          : "border-[#444933]"
                      }`}
                    >
                      {frequencyMode === "once" && (
                        <div className="w-3 h-3 rounded-full bg-stake-accent" />
                      )}
                    </div>
                  </button>

                  {/* OR REPEAT ON Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-[#444933]" />
                    <span className="text-[#7A7A6A] text-xs font-bold uppercase tracking-wider">OR REPEAT ON</span>
                    <div className="flex-1 h-px bg-[#444933]" />
                  </div>

                  {/* Weekly Schedule */}
                  <div>
                    <span className="text-stake-muted text-xs font-bold uppercase tracking-wider block mb-4">
                      WEEKLY SCHEDULE
                    </span>
                    <div className={`flex gap-2 ${frequencyMode !== "weekly" ? "opacity-40 pointer-events-none" : ""}`}>
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setFrequencyMode("weekly");
                            setSelectedDays((prev) =>
                              prev.includes(i)
                                ? prev.filter((d) => d !== i)
                                : [...prev, i]
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

                {/* Action Area */}
                <div className="mt-8">
                  <button
                    onClick={handleNext}
                    disabled={frequencyMode === "weekly" && selectedDays.length === 0}
                    className="w-full bg-stake-accent text-[#161E00] py-5 font-bold text-xs uppercase tracking-wider hover:bg-stake-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(187,244,0,0.2)]"
                  >
                    NEXT
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 4l4 4-4 4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && goalType === "project" && (
            <div className="mt-8">
              <div className="border border-[#444933] p-8">
                {/* GOAL TIMELINE Section */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Left - Calendar Interface */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-[18px] h-5 text-stake-accent" fill="none" stroke="currentColor" viewBox="0 0 18 20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2v2m8-2v2M3 8h14M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
                      </svg>
                      <span className="text-stake-muted text-base">GOAL TIMELINE</span>
                    </div>
                    <p className="text-stake-muted/70 text-sm mb-8">Define the window of commitment.</p>

                    {/* Start Date Input */}
                    <div className="mb-6">
                      <label className="text-stake-accent text-sm font-bold uppercase tracking-wider block mb-2">START DATE</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={startDate ? format(startDate, "MM/dd/yyyy") : ""}
                          onChange={() => {}}
                          className="w-full bg-[#1C1B1B] border border-[#444933] px-4 py-4 pr-10 text-white text-sm outline-none"
                        />
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-5 text-stake-muted" fill="none" stroke="currentColor" viewBox="0 0 18 20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2v2m8-2v2M3 8h14M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
                        </svg>
                      </div>
                    </div>

                    {/* End Date Input */}
                    <div className="mb-8">
                      <label className="text-stake-accent text-sm font-bold uppercase tracking-wider block mb-2">TARGET END DATE</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={endDate ? format(endDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
                          onChange={() => {}}
                          className="w-full bg-[#1C1B1B] border border-[#444933] px-4 py-4 pr-10 text-white/50 text-sm outline-none"
                        />
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stake-muted" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2v2m8-2v2M3 8h14M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
                        </svg>
                      </div>
                    </div>

                    {/* Duration Visualization */}
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
                        <div
                          className="h-1 bg-stake-accent transition-all"
                          style={{
                            width: startDate && endDate
                              ? `${Math.min(100, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) / 365 * 100)}%`
                              : "10%"
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right - Milestones & Subtasks */}
                  <div className="border-l border-stake-accent/30 pl-8">
                    <h3 className="text-white text-sm font-bold mb-5">MILESTONES &amp; SUBTASKS</h3>
                    <div className="space-y-4">
                      {milestones.map((ms, i) => (
                        <div key={i} className="bg-[#1F1E1E] border border-[#444933] p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-stake-muted text-sm font-bold mt-1 shrink-0">
                              {String(i + 1).padStart(2, "0")}
                            </span>
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
                      <svg className="w-[9px] h-[9px]" fill="none" stroke="currentColor" viewBox="0 0 10 10">
                        <path strokeLinecap="round" strokeWidth="2" d="M5 1v8M1 5h8" />
                      </svg>
                      ADD NEW SUBTASK
                    </button>
                  </div>
                </div>

                {/* Action Area */}
                <div className="mt-8">
                  <button
                    onClick={handleNext}
                    className="w-full bg-stake-accent text-[#161E00] py-5 font-bold text-xs uppercase tracking-wider hover:bg-stake-accent/90 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(187,244,0,0.2)]"
                  >
                    NEXT
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 4l4 4-4 4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-stake-muted text-center py-16">
              <p className="text-lg">Step 4: Verifier</p>
              <p className="text-sm mt-2">Who will verify your progress?</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface Milestone {
  title: string;
  deadline: Date | undefined;
}

interface WizardState {
  step: number;
  goalTitle: string;
  description: string;
  goalType: "task" | "project" | null;
  startDate: Date | undefined;
  endDate: Date | undefined;
  frequencyMode: "once" | "weekly";
  selectedDays: number[];
  milestones: Milestone[];
}

interface WizardContextType extends WizardState {
  setStep: (step: number) => void;
  setGoalTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setGoalType: (v: "task" | "project" | null) => void;
  setStartDate: (v: Date | undefined) => void;
  setEndDate: (v: Date | undefined) => void;
  setFrequencyMode: (v: "once" | "weekly") => void;
  setSelectedDays: (v: number[]) => void;
  setMilestones: (v: Milestone[]) => void;
  reset: () => void;
}

const defaults: WizardState = {
  step: 1,
  goalTitle: "",
  description: "",
  goalType: null,
  startDate: new Date(2026, 2, 1),
  endDate: undefined,
  frequencyMode: "once",
  selectedDays: [0, 1, 2, 3, 4, 5, 6],
  milestones: [
    { title: "Initial Benchmarking Session", deadline: undefined },
    { title: "", deadline: undefined },
  ],
};

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(defaults.step);
  const [goalTitle, setGoalTitle] = useState(defaults.goalTitle);
  const [description, setDescription] = useState(defaults.description);
  const [goalType, setGoalType] = useState(defaults.goalType);
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [frequencyMode, setFrequencyMode] = useState(defaults.frequencyMode);
  const [selectedDays, setSelectedDays] = useState(defaults.selectedDays);
  const [milestones, setMilestones] = useState(defaults.milestones);

  const reset = () => {
    setStep(defaults.step);
    setGoalTitle(defaults.goalTitle);
    setDescription(defaults.description);
    setGoalType(defaults.goalType);
    setStartDate(defaults.startDate);
    setEndDate(defaults.endDate);
    setFrequencyMode(defaults.frequencyMode);
    setSelectedDays(defaults.selectedDays);
    setMilestones(defaults.milestones);
  };

  return (
    <WizardContext.Provider
      value={{
        step, setStep,
        goalTitle, setGoalTitle,
        description, setDescription,
        goalType, setGoalType,
        startDate, setStartDate,
        endDate, setEndDate,
        frequencyMode, setFrequencyMode,
        selectedDays, setSelectedDays,
        milestones, setMilestones,
        reset,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}

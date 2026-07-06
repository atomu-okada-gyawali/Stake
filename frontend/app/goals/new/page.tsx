"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WizardProvider, useWizard } from "@/components/wizard/WizardContext";
import WizardLayout from "@/components/wizard/WizardLayout";
import StepIdentify from "@/components/wizard/StepIdentify";
import StepDuration from "@/components/wizard/StepDuration";
import StepFrequency from "@/components/wizard/StepFrequency";
import StepTimeline from "@/components/wizard/StepTimeline";
import StepVerifier from "@/components/wizard/StepVerifier";

function WizardContent() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const step = stepParam ? Math.min(Math.max(parseInt(stepParam, 10), 1), 4) : 1;
  const { goalType } = useWizard();

  return (
    <WizardLayout step={step}>
      {step === 1 && <StepIdentify />}
      {step === 2 && <StepDuration />}
      {step === 3 && goalType === "task" && <StepFrequency />}
      {step === 3 && goalType === "project" && <StepTimeline />}
      {step === 4 && <StepVerifier />}
    </WizardLayout>
  );
}

export default function NewGoalPage() {
  return (
    <WizardProvider>
      <Suspense fallback={null}>
        <WizardContent />
      </Suspense>
    </WizardProvider>
  );
}

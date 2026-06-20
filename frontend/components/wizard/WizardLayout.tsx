"use client";

import { useRouter } from "next/navigation";
import Stepper from "@/components/Stepper";
import { ChevronLeft } from "./Icons";

interface WizardLayoutProps {
  step: number;
  children: React.ReactNode;
}

export default function WizardLayout({ step, children }: WizardLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (step > 1) {
      router.push(`/goals/new?step=${step - 1}`);
    } else {
      router.push("/profile");
    }
  };

  const backLabel =
    step === 2 ? "BACK TO STEP 1"
    : step === 3 ? "BACK TO STEP 2"
    : step === 4 ? "BACK TO STEP 3"
    : "BACK";

  return (
    <div className="flex items-start justify-center min-h-screen pt-12 bg-black pb-12">
      <div className="w-full max-w-[896px] bg-stake-bg border border-[#444933] shadow-2xl">
        <div className="px-6 pt-12 pb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-stake-muted hover:text-white transition-colors group"
          >
            <ChevronLeft />
            <span className="text-xs font-bold tracking-wider uppercase">{backLabel}</span>
          </button>
          <h1 className="text-white text-2xl font-bold mt-3">SET A NEW GOAL</h1>
        </div>

        <div className="px-6">
          <Stepper currentStep={step as 1 | 2 | 3 | 4} />
        </div>

        <div className="px-6 pb-8">{children}</div>
      </div>
    </div>
  );
}

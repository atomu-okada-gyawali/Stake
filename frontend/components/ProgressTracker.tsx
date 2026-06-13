import React from 'react';

const Stepper = ({ currentStep = 1 }) => {
  const steps = ["Identify", "Duration", "Frequency", "Verifier"];
  
  return (
    <div className="w-full flex items-center justify-between px-12 py-8 relative">
      {/* Background Connecting Line */}
      <div className="absolute top-[43px] left-0 w-full h-[2px] bg-[#353534] z-0" />
      
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={label} className="flex flex-col items-center z-10 w-20">
            <div className={`w-8 h-8 flex items-center justify-center border-2 transition-all 
              ${isActive || isCompleted 
                ? 'bg-stake-accent border-stake-bg shadow-[0_0_10px_#BAF400]' 
                : 'bg-[#353534] border-transparent'}`}
            >
              {isCompleted ? (
                /* Checkmark Icon */
                <svg className="w-4 h-4 text-stake-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                /* Small dot for incomplete/active */
                <div className={`w-2 h-2 ${isActive ? 'bg-stake-bg' : 'bg-stake-muted'}`} />
              )}
            </div>
            <span className={`mt-2 text-xs font-bold uppercase tracking-wider 
              ${isActive || isCompleted ? 'text-stake-accent' : 'text-stake-muted'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
"use client";

import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { useRouter } from "next/navigation";
import { useWizard } from "./WizardContext";
import { Calendar } from "./Icons";
import PrimaryButton from "./PrimaryButton";
import "react-day-picker/style.css";

export default function StepDuration() {
  const router = useRouter();
  const { startDate, setStartDate, endDate, setEndDate } = useWizard();

  return (
    <div className="mt-8">
      <div className="border border-[#444933] p-8">
        <h2 className="text-xs font-bold text-stake-muted uppercase tracking-wider mb-6">GOAL TIMELINE</h2>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">START DATE</span>
            <div className="flex items-center border border-stake-accent px-4 py-3 gap-3">
              <Calendar className="w-5 h-5 text-stake-accent shrink-0" />
              <span className="text-white text-sm font-bold">
                {startDate ? format(startDate, "MMMM dd, yyyy").toUpperCase() : "SELECT..."}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">END DATE</span>
            <div className="flex items-center border border-[#444933] px-4 py-3 gap-3">
              <Calendar className="w-5 h-5 text-stake-muted shrink-0" />
              <span className="text-[#353534] text-sm font-bold">
                {endDate ? format(endDate, "MMMM dd, yyyy").toUpperCase() : "SELECT..."}
              </span>
            </div>
          </div>
        </div>

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

        <div className="mt-8">
          <PrimaryButton onClick={() => router.push("/goals/new?step=3")} disabled={!startDate || !endDate}>
            NEXT
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "./WizardContext";
import { Search, Person, Checkmark, ArrowRight } from "./Icons";
import PrimaryButton from "./PrimaryButton";

interface Friend {
  id: number;
  name: string;
}

const friends: Friend[] = [
  { id: 1, name: "Friend 1" },
  { id: 2, name: "Alex Rivera" },
  { id: 3, name: "Jordan Smyth" },
];

export default function StepVerifier() {
  const router = useRouter();
  const { reset } = useWizard();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number>(1);

  const filtered = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mt-8">
      <div className="border border-[#444933] bg-[#1A1A1A]/80 p-8">
        <h2 className="text-white text-2xl font-bold mb-2">Choose Your Verifier</h2>

        <div className="border border-[#444933] p-4 mb-8">
          <p className="text-stake-muted text-sm font-bold italic leading-relaxed">
            * Your task completion must be verified by one of your friends to maintain your reputation.
          </p>
        </div>

        <div className="border border-[#444933] bg-[#0E0E0E] mb-8">
          <div className="flex items-center gap-3 px-4 py-4">
            <Search className="w-[18px] h-[18px] text-stake-muted shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full bg-transparent text-white text-sm font-bold placeholder-[#6B7280] outline-none"
            />
          </div>
        </div>

        <div className="space-y-px mb-8">
          {filtered.map((friend) => {
            const isSelected = selectedId === friend.id;
            return (
              <button
                key={friend.id}
                type="button"
                onClick={() => setSelectedId(friend.id)}
                className={`w-full flex items-center justify-between px-4 py-5 transition-all ${
                  isSelected
                    ? "bg-[#2A2A2A] border border-stake-accent/40 shadow-[0_0_1px_1px_rgba(187,244,0,0.2)]"
                    : "bg-[#1F1E1E]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#353534] border border-[#444933] flex items-center justify-center overflow-hidden">
                    <Person className="w-6 h-6 text-stake-muted/40" />
                  </div>
                  <span className="text-white text-lg font-bold">{friend.name}</span>
                </div>

                {isSelected ? (
                  <div className="w-[26px] h-[26px] bg-stake-accent flex items-center justify-center">
                    <Checkmark className="w-[15px] h-[15px] text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 border border-[#444933] bg-[#131313]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t border-[#444933] pt-6">
          <PrimaryButton
            variant="submit"
            onClick={() => {
              reset();
              router.push("/profile");
            }}
          >
            SUBMIT
            <ArrowRight />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWizard } from "./WizardContext";
import { goalsAPI, friendsAPI, CreateGoalPayload } from "../../lib/services";
import { Search, Person, Checkmark, ArrowRight } from "./Icons";
import PrimaryButton from "./PrimaryButton";

interface Friend {
  id: string;
  username: string;
}

export default function StepVerifier() {
  const router = useRouter();
  const {
    goalTitle,
    description,
    goalType,
    startDate,
    endDate,
    frequencyMode,
    selectedDays,
    milestones,
    reset,
  } = useWizard();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFriends() {
      try {
        const { data } = await friendsAPI.listFriends();
        setFriends(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch {
        setError("Failed to load friends");
      } finally {
        setLoading(false);
      }
    }
    loadFriends();
  }, []);

  const filtered = friends.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    setError(null);

    const payload: CreateGoalPayload = {
      title: goalTitle,
      description: description || undefined,
      goalType: goalType!,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      stakeholders: [selectedId],
    };

    if (goalType === "task") {
      payload.daysOfWeek = frequencyMode === "weekly" ? selectedDays : [];
    }

    if (goalType === "project") {
      payload.subtasks = milestones
        .filter((m) => m.trim().length > 0)
        .map((title) => ({ title }));
    }

    try {
      await goalsAPI.create(payload);
      toast.success("Goal created successfully!");
      reset();
      router.push("/profile");
    } catch (err: unknown) {
      const message =
        err instanceof Object && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : "Failed to create goal";
      setError(message ?? "Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {loading && (
          <div className="text-stake-muted text-sm text-center py-8">
            Loading friends...
          </div>
        )}

        {!loading && friends.length === 0 && (
          <div className="text-stake-muted text-sm text-center py-8 border border-[#444933] mb-8">
            No friends yet. Add friends from the Circle Feed page first.
          </div>
        )}

        {!loading && filtered.length > 0 && (
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
                    <span className="text-white text-lg font-bold">{friend.username}</span>
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
        )}

        {error && (
          <div className="mb-4 p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="border-t border-[#444933] pt-6">
          <PrimaryButton
            variant="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedId || friends.length === 0}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
            <ArrowRight />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

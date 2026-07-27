"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import HistoryItem from "@/components/HistoryItem";
import EditProfileModal from "@/components/EditProfileModal";
import SubmitFailureReportModal from "@/components/SubmitFailureReportModal";
import { toast } from "sonner";
import {
  authAPI,
  goalsAPI,
  failuresAPI,
  statsAPI,
  UserProfile,
  FailureHistoryItem,
  UserStats,
} from "@/lib/services";
import { setAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/apiClient";

const uploadsBase = API_BASE_URL.replace(/\/api$/, "");

interface Task {
  id: string;
  subtaskId?: string;
  date: string;
  title: string;
  description: string | undefined;
  variant: "filled" | "outlined";
}

function ProgressBar({ fill }: { fill: number }) {
  return (
    <div className="w-full h-1 bg-[#353534]">
      <div
        className="h-full bg-stake-accent"
        style={{ width: `${fill}%` }}
      />
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [failureHistory, setFailureHistory] = useState<FailureHistoryItem[]>([]);
  const [failureHistoryLoading, setFailureHistoryLoading] = useState(true);
  const [reportingItem, setReportingItem] = useState<FailureHistoryItem | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    statsAPI
      .getMyStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error("Failed to load your stats"))
      .finally(() => setStatsLoading(false));
  }, []);

  const loadFailureHistory = () => {
    failuresAPI
      .list()
      .then(({ data }) => setFailureHistory(data))
      .catch(() => toast.error("Failed to load task failure history"))
      .finally(() => setFailureHistoryLoading(false));
  };

  useEffect(() => {
    loadFailureHistory();
  }, []);

  useEffect(() => {
    authAPI
      .getCurrentUser()
      .then(({ data }) => setUser(data))
      .catch(() => toast.error("Failed to load your profile"));
  }, []);

  const handleProfileSaved = (updated: UserProfile) => {
    setUser(updated);
    const token = localStorage.getItem("authToken");
    if (token) setAuth(token, updated);
  };

  useEffect(() => {
    async function loadTasks() {
      try {
        const { data } = await goalsAPI.list();
        const goals = data as {
          id: string;
          title: string;
          description?: string;
          goalType: string;
          startDate?: string;
          endDate?: string;
          submittedForCurrentPeriod: boolean;
          subtasks?: { id: string; title: string; deadline: string; submitted: boolean }[];
        }[];

        const formatDate = (d: string | number | Date) =>
          new Date(d).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).toUpperCase();

        const mapped: Task[] = [];
        for (const g of goals) {
          if (g.goalType === "project") {
            for (const st of g.subtasks ?? []) {
              if (st.submitted) continue;
              mapped.push({
                id: g.id,
                subtaskId: st.id,
                date: formatDate(st.deadline),
                title: `${g.title}: ${st.title}`,
                description: g.description,
                variant: "filled",
              });
            }
          } else if (!g.submittedForCurrentPeriod) {
            mapped.push({
              id: g.id,
              date: formatDate(g.startDate ?? g.endDate ?? Date.now()),
              title: g.title,
              description: g.description,
              variant: "filled",
            });
          }
        }
        setTasks(mapped);
      } catch {
        toast.error("Failed to load your tasks");
      } finally {
        setTasksLoading(false);
      }
    }
    loadTasks();
  }, []);

  return (
    <div className="min-h-screen bg-stake-bg font-poppins">
      <Header />

      <main className="pt-[97px]">
        <div className="max-w-[904px] mx-auto px-6 py-6">
          {/* Profile Summary & Stats */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stake-muted/20 border border-[#444933] overflow-hidden flex items-center justify-center shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={`${uploadsBase}${user.avatarUrl}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-stake-muted text-sm font-bold">
                      {user?.username.charAt(0).toUpperCase() ?? ""}
                    </span>
                  )}
                </div>
                <h1 className="text-white text-[32px] font-bold">
                  {user?.fullName ?? "..."}
                </h1>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  aria-label="Edit profile"
                  className="text-stake-muted hover:text-stake-accent transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => router.push("/goals/new")}
                className="bg-stake-accent text-[#161E00] px-[25px] py-[9px] font-bold text-xs uppercase tracking-wider hover:bg-stake-accent/90 transition-colors"
              >
                SET NEW GOAL
              </button>
            </div>

            <div className="bg-[#1C1B1B] border border-[#444933]">
              <div className="grid grid-cols-4 divide-x divide-[#242424]">
                <div className="px-5 py-5">
                  <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">
                    EXECUTION STREAK
                  </span>
                  <div className="mt-2">
                    <span className="text-[32px] font-bold text-stake-accent">
                      {statsLoading
                        ? "…"
                        : `${stats?.executionStreak ?? 0} Day${stats?.executionStreak === 1 ? "" : "s"}`}
                    </span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar fill={Math.min(100, ((stats?.executionStreak ?? 0) / 30) * 100)} />
                  </div>
                </div>

                <div className="px-5 py-5">
                  <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">
                    GOALS IN PROGRESS
                  </span>
                  <div className="mt-2">
                    <span className="text-[32px] font-bold text-white">
                      {statsLoading ? "…" : stats?.goalsInProgress ?? 0}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-5">
                  <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">
                    TOTAL GOALS COMPLETED
                  </span>
                  <div className="mt-2">
                    <span className="text-[32px] font-bold text-white">
                      {statsLoading ? "…" : stats?.totalGoalsCompleted ?? 0}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-5">
                  <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">
                    PEER VALIDATED
                  </span>
                  <div className="mt-2">
                    <span className="text-[32px] font-bold text-stake-dangerText">
                      {statsLoading ? "…" : stats?.peerValidated ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Current Tasks & Tasks History */}
          <section className="mt-10 grid grid-cols-2 gap-10">
            {/* Current Tasks */}
            <div>
              <div className="flex items-center justify-between border-b border-[#444933] pb-3 mb-6">
                <h2 className="text-white text-2xl font-bold">Current Tasks</h2>
                <span className="bg-stake-accent/10 text-stake-accent text-[10px] font-bold px-2 py-1 uppercase">
                  ACTIVE JOURNEY
                </span>
              </div>

              {tasksLoading ? (
                <div className="text-stake-muted/50 text-sm text-center py-8">
                  Loading tasks...
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-stake-muted/50 text-sm text-center py-8">
                  No active tasks. Set a new goal to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.subtaskId ? `${task.id}-${task.subtaskId}` : task.id}
                      className="bg-stake-card border border-[#444933]/30 p-5"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-stake-accent uppercase">
                            {task.date}
                          </span>
                          <h3 className="text-white text-2xl font-bold">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-stake-muted text-base">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <svg
                          className="w-7 h-8 text-stake-accent mt-4 shrink-0"
                          viewBox="0 0 27 32"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M13.5 2C7.977 2 3.5 6.477 3.5 12v4.5L1 24h25l-2.5-7.5V12c0-5.523-4.477-10-10-10z" />
                          <path d="M10 24c0 1.933 1.567 3.5 3.5 3.5S17 25.933 17 24" />
                        </svg>
                      </div>
                      <div className="mt-5">
                          <button
                          onClick={() =>
                            router.push(
                              `/submit-proof?goalId=${task.id}${task.subtaskId ? `&subtaskId=${task.subtaskId}` : ""}`,
                            )
                          }
                          className="bg-stake-accent text-[#161E00] px-8 py-3 font-bold text-xs uppercase hover:bg-stake-accent/90 transition-colors"
                        >
                          SUBMIT PROOF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks History */}
            <div>
              <div className="flex items-center justify-between border-b border-[#444933] pb-3 mb-6">
                <h2 className="text-white text-2xl font-bold">Tasks History</h2>
                <button className="text-stake-muted text-[10px] font-bold uppercase hover:text-white transition-colors">
                  VIEW ALL ARCHIVE
                </button>
              </div>

              {failureHistoryLoading ? (
                <div className="text-stake-muted/50 text-sm text-center py-8">
                  Loading...
                </div>
              ) : failureHistory.length === 0 ? (
                <div className="text-stake-muted/50 text-sm text-center py-8">
                  No missed deadlines yet.
                </div>
              ) : (
                <div className="divide-y divide-[#444933]/30">
                  {failureHistory.map((item) => (
                    <HistoryItem
                      key={`${item.goalId}-${item.subtaskId ?? ""}-${item.occurrenceDate ?? item.date}`}
                      title={item.title}
                      date={new Date(item.date)
                        .toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                        .toUpperCase()}
                      description={item.description ?? "Deadline passed without evidence submitted."}
                      status="FAILED"
                      reportedReason={item.reason}
                      onFailureReport={() => setReportingItem(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {user && (
        <EditProfileModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSaved={handleProfileSaved}
        />
      )}

      <SubmitFailureReportModal
        open={!!reportingItem}
        onClose={() => setReportingItem(null)}
        item={reportingItem}
        onSubmitted={(updated) => {
          setFailureHistory((prev) =>
            prev.map((f) =>
              f.goalId === updated.goalId &&
              f.subtaskId === updated.subtaskId &&
              f.occurrenceDate === updated.occurrenceDate
                ? updated
                : f,
            ),
          );
        }}
      />
    </div>
  );
}

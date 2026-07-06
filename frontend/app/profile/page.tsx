"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const stats = [
  {
    label: "EXECUTION STREAK",
    value: "42 Days",
    valueColor: "text-stake-accent",
    bottom: <ProgressBar fill={85} />,
  },
  {
    label: "GOALS IN PROGRESS",
    value: "12",
    valueColor: "text-white",
    bottom: (
      <span className="text-xs text-[#0A6D00] font-regular">+2 from last week</span>
    ),
  },
  {
    label: "TOTAL GOALS COMPLETED",
    value: "89",
    valueColor: "text-white",
    bottom: (
      <span className="text-xs text-stake-muted font-regular">Rank: Elite Tier</span>
    ),
  },
  {
    label: "PEER VALIDATED",
    value: "315",
    valueColor: "text-stake-dangerText",
    bottom: (
      <span className="text-xs text-[#531900] font-regular">Trusted by the Squad</span>
    ),
  },
];

const tasks = [
  {
    date: "APRIL 22, 12:14 PM",
    title: "AFTERNOON RUN",
    description: "3km run from Anamnagar to Pashupatinath (Round)",
    variant: "filled" as const,
  },
  {
    date: "APRIL 25, 2 PM",
    title: "WATER PLANTS",
    description: "Water plants on balcony and clean the terrace area.",
    variant: "outlined" as const,
  },
];

const historyItems = [
  {
    status: "VERIFIED" as const,
    date: "APRIL 17, 2:00 PM",
    title: "PHYSIOLOGY EXAM PREPARATION",
    description: "Completed task paper 23 to 50 with deep focus.",
  },
  {
    status: "FAILED" as const,
    date: "APRIL 13, 5:00 PM",
    title: "DAILY YOGA",
    description: "Missed 45 min yoga session without distraction.",
  },
];

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

  return (
    <div className="min-h-screen bg-stake-bg font-poppins">
      <Header />

      <main className="pt-[97px]">
        <div className="max-w-[904px] mx-auto px-6 py-6">
          {/* Profile Summary & Stats */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stake-muted/20 border border-[#444933]" />
                <h1 className="text-white text-[32px] font-bold">D. Goggins</h1>
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
                {stats.map((stat) => (
                  <div key={stat.label} className="px-5 py-5">
                    <span className="text-xs font-bold text-stake-muted uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <div className="mt-2">
                      <span className={`text-[32px] font-bold ${stat.valueColor}`}>
                        {stat.value}
                      </span>
                    </div>
                    <div className="mt-2">{stat.bottom}</div>
                  </div>
                ))}
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

              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.title}
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
                        <p className="text-stake-muted text-base">
                          {task.description}
                        </p>
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
                      {task.variant === "filled" ? (
                        <button className="bg-stake-accent text-[#161E00] px-8 py-3 font-bold text-xs uppercase hover:bg-stake-accent/90 transition-colors">
                          SUBMIT PROOF
                        </button>
                      ) : (
                        <button className="border border-[#444933] text-white px-8 py-3 font-bold text-xs uppercase hover:bg-white/5 transition-colors">
                          SUBMIT PROOF
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks History */}
            <div>
              <div className="flex items-center justify-between border-b border-[#444933] pb-3 mb-6">
                <h2 className="text-white text-2xl font-bold">Tasks History</h2>
                <button className="text-stake-muted text-[10px] font-bold uppercase hover:text-white transition-colors">
                  VIEW ALL ARCHIVE
                </button>
              </div>

              <div className="divide-y divide-[#444933]/30">
                {historyItems.map((item) => {
                  const isSuccess = item.status === "VERIFIED";
                  return (
                    <div
                      key={item.title}
                      className="py-5 flex gap-5"
                    >
                      <div
                        className={`w-10 h-10 border flex items-center justify-center shrink-0 ${
                          isSuccess
                            ? "border-stake-accent/40"
                            : "border-stake-dangerText/40"
                        }`}
                      >
                        <svg
                          className={`w-5 h-5 ${
                            isSuccess ? "text-stake-accent" : "text-stake-dangerText"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {isSuccess ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          )}
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-stake-muted uppercase tracking-wider">
                            {item.date}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                              isSuccess
                                ? "bg-stake-accent/10 text-stake-accent"
                                : "bg-stake-dangerText/10 text-stake-dangerText"
                            }`}
                          >
                            {item.status === "VERIFIED"
                              ? "VERIFIED"
                              : "REPUTATION DROP"}
                          </span>
                        </div>
                        <h4
                          className={`text-lg font-bold mt-1 ${
                            isSuccess ? "text-white" : "text-stake-muted"
                          }`}
                        >
                          {item.title}
                        </h4>
                        <p
                          className={`text-xs mt-1 ${
                            isSuccess
                              ? "text-stake-muted"
                              : "text-stake-muted/60"
                          }`}
                        >
                          {item.description}
                        </p>
                        {!isSuccess && (
                          <button className="mt-3 text-stake-dangerText text-[10px] font-bold uppercase hover:opacity-80 transition-opacity">
                            Submit Failure report
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import FeedCard from "@/components/FeedCard";
import AddFriendsModal from "@/components/AddFriendsModal";
import SquadRequestsModal from "@/components/SquadRequestsModal";
import { toast } from "sonner";
import { evidenceAPI, friendsAPI } from "@/lib/services";
import type { FeedItem, LeaderboardEntry } from "@/lib/services";
import { API_BASE_URL } from "@/lib/apiClient";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface Friend {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

const uploadsBase = API_BASE_URL.replace(/\/api$/, "");

export default function CircleFeedPage() {
  const router = useRouter();
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [showSquadRequests, setShowSquadRequests] = useState(false);
  const [myFriends, setMyFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFriends() {
      try {
        const { data } = await friendsAPI.listFriends();
        setMyFriends(data);
      } catch {
        toast.error("Failed to load your circle");
      } finally {
        setFriendsLoading(false);
      }
    }
    loadFriends();
  }, [showAddFriends]);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const { data } = await friendsAPI.getLeaderboard();
        setLeaderboard(data);
      } catch {
        toast.error("Failed to load the leaderboard");
      } finally {
        setLeaderboardLoading(false);
      }
    }
    loadLeaderboard();
  }, [showAddFriends]);

  useEffect(() => {
    async function loadFeed() {
      try {
        const { data } = await evidenceAPI.getFeed();
        setFeedItems(data);
      } catch {
        toast.error("Failed to load feed");
      } finally {
        setFeedLoading(false);
      }
    }
    loadFeed();
  }, []);

  const handleVerify = async (evidenceId: string) => {
    setVerifyingId(evidenceId);
    try {
      const { data } = await evidenceAPI.verify(evidenceId, true);
      setFeedItems((prev) =>
        prev.map((item) =>
          item.id === evidenceId ? { ...item, status: data.status, canVerify: false } : item,
        ),
      );
      toast.success("Submission verified!");
    } catch (err: unknown) {
      const message =
        err instanceof Object && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : "Failed to verify submission";
      toast.error(message ?? "Failed to verify submission");
    } finally {
      setVerifyingId(null);
    }
  };

  const ordinal = (n: number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`;
  };

  const formatTimestamp = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-stake-bg font-poppins">
        <Header />

        <main className="pt-[97px]">
          <div className="max-w-[1280px] mx-auto px-6 py-8 flex gap-10">
            {/* Left Column - Feed */}
            <section className="flex-1 max-w-[770px]">
              {/* Feed Header */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-white text-[32px] font-bold">
                  Circle Feed
                </h1>
                <button
                  onClick={() => router.push("/goals/new")}
                  className="bg-stake-accent text-[#161E00] px-6 py-3 font-extrabold text-sm uppercase tracking-wider hover:bg-stake-accent/90 transition-colors shadow-[4px_4px_0_rgba(255,255,255,0.1)]"
                >
                  + SET NEW GOAL
                </button>
              </div>

              {/* Feed Cards */}
              {feedLoading ? (
                <div className="text-stake-muted/50 text-sm text-center py-16">
                  Loading feed...
                </div>
              ) : feedItems.length === 0 ? (
                <div className="text-stake-muted/50 text-sm text-center py-16">
                  No activity from your circle yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {feedItems.map((item) => {
                    const proofUrl = item.proofData
                      ? `${uploadsBase}${item.proofData}`
                      : undefined;
                    const isVideo = item.proofData?.match(/\.(mp4|mov|avi|webm)$/i);
                    return (
                      <FeedCard
                        key={item.id}
                        userName={item.userName}
                        userAvatarUrl={
                          item.userAvatarUrl
                            ? `${uploadsBase}${item.userAvatarUrl}`
                            : undefined
                        }
                        timestamp={formatTimestamp(item.timestamp)}
                        goalTitle={item.goalTitle}
                        description={item.description ?? "Submitted proof for this goal."}
                        proofUrl={proofUrl}
                        proofType={isVideo ? "video" : "image"}
                        status={item.status}
                        kind={item.type}
                        canVerify={item.canVerify}
                        isVerifying={verifyingId === item.id}
                        onVerify={() => handleVerify(item.id)}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* Right Column - Sidebars */}
            <aside className="w-[434px] shrink-0 space-y-6 self-start sticky top-[97px] max-h-[calc(100vh-97px)] overflow-y-auto">
              {/* My Circle Section */}
              <section className="bg-[#1C1B1B] border border-[#2D2D2D]">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white text-lg font-extrabold">
                      MY CIRCLE
                    </h2>
                    <button
                      onClick={() => setShowSquadRequests(true)}
                      className="text-white text-xs font-medium hover:underline"
                    >
                      View requests
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAddFriends(true)}
                    className="w-full border border-[#3F3F46] py-3 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors mb-5"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="#A1A1AA"
                      strokeWidth="1.5"
                    >
                      <path d="M10 5v10M5 10h10" />
                    </svg>
                    <span className="text-sm font-bold text-[#A1A1AA]">
                      Add New Friends
                    </span>
                  </button>

                  {friendsLoading ? (
                    <div className="text-stake-muted/50 text-sm text-center py-4">
                      Loading...
                    </div>
                  ) : myFriends.length === 0 ? (
                    <div className="text-stake-muted/50 text-sm text-center py-4">
                      No friends yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myFriends.map((friend) => (
                        <div key={friend.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#2D2D2D] flex items-center justify-center overflow-hidden">
                            {friend.avatarUrl ? (
                              <img
                                src={`${uploadsBase}${friend.avatarUrl}`}
                                alt={`${friend.username}'s avatar`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="#6B7280"
                                strokeWidth="1.5"
                              >
                                <circle cx="8" cy="5" r="3" />
                                <path d="M2 15c0-4 2.7-6 6-6s6 2 6 6" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-bold text-[#A1A1AA]">
                            {friend.username}
                          </span>
                          <div className="flex-1" />
                          <div className="w-2 h-2 rounded-full bg-stake-accent" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Leaderboard Section */}
              <section className="bg-[#0A0A0A] border border-stake-accent/20 shadow-[0_0_20px_rgba(187,244,0,0.05)]">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <h2 className="text-stake-accent text-lg font-extrabold">
                      CIRCLE LEADER BOARD
                    </h2>
                  </div>

                  {leaderboardLoading ? (
                    <div className="text-stake-muted/50 text-sm text-center py-4">
                      Loading...
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="text-stake-muted/50 text-sm text-center py-4">
                      No rankings yet
                    </div>
                  ) : (
                    <div className="space-y-px">
                      {leaderboard.map((entry, index) => {
                        const rank = index + 1;
                        const isFirst = rank === 1;
                        return (
                          <div
                            key={entry.id}
                            className={`flex items-center px-4 py-3 ${
                              isFirst
                                ? "bg-stake-accent/5 border border-stake-accent"
                                : "bg-[#1C1B1B] border border-[#2D2D2D]"
                            }`}
                          >
                            <span
                              className={`w-10 text-lg font-extrabold italic ${
                                isFirst
                                  ? "text-stake-accent"
                                  : "text-[#6B7280]"
                              }`}
                            >
                              {ordinal(rank)}
                            </span>
                            {entry.avatarUrl && (
                              <img
                                src={`${uploadsBase}${entry.avatarUrl}`}
                                alt={`${entry.username}'s avatar`}
                                className="w-8 h-8 object-cover mr-3 border border-white/10"
                              />
                            )}
                            <div className="flex-1">
                              <span
                                className={`text-base font-extrabold ${
                                  isFirst ? "text-white" : "text-[#A1A1AA]"
                                }`}
                              >
                                {entry.username}
                              </span>
                              {entry.isCurrentUser && (
                                <div className="text-[10px] font-bold text-stake-accent uppercase tracking-wider">
                                  YOU
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-lg font-extrabold ${
                                  isFirst ? "text-white" : "text-[#A1A1AA]"
                                }`}
                              >
                                {entry.score}
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  isFirst
                                    ? "text-stake-accent"
                                    : "text-[#6B7280]"
                                }`}
                              >
                                Pts
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button className="w-full text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-5 hover:text-white transition-colors">
                    VIEW ALL RANKINGS
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#2D2D2D]">
          <div className="max-w-[1280px] mx-auto px-6 py-8 flex items-center justify-between">
            <span className="text-xs font-bold text-[#525252]">
              &copy; 2024 STAKE. ACCOUNTABILITY OR BUST.
            </span>
            <div className="flex gap-8">
              <button className="text-xs font-bold text-[#6B7280] hover:text-white transition-colors uppercase">
                RULES
              </button>
              <button className="text-xs font-bold text-[#6B7280] hover:text-white transition-colors uppercase">
                PRIVACY
              </button>
              <button className="text-xs font-bold text-[#6B7280] hover:text-white transition-colors uppercase">
                SUPPORT
              </button>
            </div>
          </div>
        </footer>
      </div>

      <AddFriendsModal
        open={showAddFriends}
        onClose={() => setShowAddFriends(false)}
      />

      <SquadRequestsModal
        open={showSquadRequests}
        onClose={() => setShowSquadRequests(false)}
      />
    </ProtectedRoute>
  );
}

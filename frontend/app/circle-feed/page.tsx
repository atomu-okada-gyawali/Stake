"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import FeedCard from "@/components/FeedCard";
import AddFriendsModal from "@/components/AddFriendsModal";
import SquadRequestsModal from "@/components/SquadRequestsModal";
import { toast } from "sonner";
import { evidenceAPI, friendsAPI } from "@/lib/services";
import type { FeedItem } from "@/lib/services";
import { API_BASE_URL } from "@/lib/apiClient";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface Friend {
  id: string;
  username: string;
  email: string;
}

const leaderboard = [
  { rank: 1, name: "Friend 2", pts: 20 },
  { rank: 2, name: "Friend 1", pts: 10 },
];

export default function CircleFeedPage() {
  const router = useRouter();
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [showSquadRequests, setShowSquadRequests] = useState(false);
  const [myFriends, setMyFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

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
                    const uploadsBase = API_BASE_URL.replace(/\/api$/, "");
                    const proofUrl = item.proofData
                      ? `${uploadsBase}${item.proofData}`
                      : undefined;
                    const isVideo = item.proofData?.match(/\.(mp4|mov|avi|webm)$/i);
                    return (
                      <FeedCard
                        key={item.id}
                        userName={item.userName}
                        timestamp={formatTimestamp(item.timestamp)}
                        goalTitle={item.goalTitle}
                        description={item.description ?? "Submitted proof for this goal."}
                        proofUrl={proofUrl}
                        proofType={isVideo ? "video" : "image"}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* Right Column - Sidebars */}
            <aside className="w-[434px] shrink-0 space-y-6">
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
                          <div className="w-8 h-8 bg-[#2D2D2D] flex items-center justify-center">
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
                  <div className="flex items-center gap-2 mb-6">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="#ABD600"
                      strokeWidth="1.5"
                    >
                      <path d="M3 17V7l3-4 3 4v10" />
                      <path d="M14 17V4l3-1 3 1v13" />
                      <path d="M3 17h14" />
                      <path d="M7 12v-2" />
                      <path d="M11 12v-4" />
                      <path d="M17 12V8" />
                    </svg>
                    <h2 className="text-stake-accent text-lg font-extrabold">
                      CIRCLE LEADER BOARD
                    </h2>
                  </div>

                  <div className="space-y-px">
                    {leaderboard.map((entry) => {
                      const isFirst = entry.rank === 1;
                      return (
                        <div
                          key={entry.rank}
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
                            {entry.rank === 1
                              ? "1st"
                              : entry.rank === 2
                              ? "2nd"
                              : `${entry.rank}th`}
                          </span>
                          <div className="flex-1">
                            <span
                              className={`text-base font-extrabold ${
                                isFirst ? "text-white" : "text-[#A1A1AA]"
                              }`}
                            >
                              {entry.name}
                            </span>
                            {isFirst && (
                              <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                                CONSISTENCY STREAK
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-lg font-extrabold ${
                                isFirst ? "text-white" : "text-[#A1A1AA]"
                              }`}
                            >
                              {entry.pts}
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

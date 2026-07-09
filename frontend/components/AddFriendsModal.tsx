"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { friendsAPI } from "@/lib/services";

interface AddFriendsModalProps {
  open: boolean;
  onClose: () => void;
}

interface UserResult {
  id: string;
  username: string;
  email: string;
  isFriend?: boolean;
  hasPendingRequest?: boolean;
}

export default function AddFriendsModal({ open, onClose }: AddFriendsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [suggestions, setSuggestions] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    try {
      const { data } = await friendsAPI.getSuggestions();
      setSuggestions(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchSuggestions();
      setSearchQuery("");
      setResults([]);
      setError(null);
    }
  }, [open, fetchSuggestions]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const { data } = await friendsAPI.searchUsers(searchQuery.trim());
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSendInvite = async (userId: string) => {
    setSendingId(userId);
    setError(null);
    try {
      await friendsAPI.sendRequest(userId);
      toast.success("Friend request sent!");
      setResults((prev) =>
        prev.map((r) =>
          r.id === userId ? { ...r, hasPendingRequest: true } : r,
        ),
      );
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === userId ? { ...s, hasPendingRequest: true } : s,
        ),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Object && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : "Failed to send request";
      setError(message ?? "Failed to send request");
    } finally {
      setSendingId(null);
    }
  };

  if (!open) return null;

  const displayItems =
    results.length > 0
      ? results
      : searchQuery.trim()
        ? []
        : suggestions;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-[512px] bg-stake-bg border border-[#444933] shadow-2xl mb-12">
        {/* Header */}
        <div className="px-6 pt-12 pb-4">
          <h1 className="text-white text-2xl font-bold">
            EXPAND YOUR SQUAD
          </h1>
          <p className="text-stake-muted text-sm mt-2 leading-relaxed">
            Add friends to witness your progress and maintain high-stakes
            accountability.
          </p>
        </div>

        {/* Search Bar */}
        <div className="px-6 mb-6">
          <div className="flex items-center bg-[#2A2A2A] border border-[#444933]/30 px-4 py-[17px]">
            <svg
              className="w-[18px] h-[18px] text-stake-muted shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or email..."
              className="ml-3 bg-transparent text-sm text-stake-muted/50 outline-none w-full placeholder-stake-muted/50"
            />
          </div>
        </div>

        {/* Suggested / Search Results */}
        <div className="px-6 pb-6">
          <p className="text-stake-muted text-[10px] font-bold tracking-widest mb-[31px]">
            {searchQuery.trim() ? "SEARCH RESULTS" : "SUGGESTED CONTACTS"}
          </p>

          {error && (
            <div className="mb-4 p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-stake-muted text-sm text-center py-8">
              Searching...
            </div>
          )}

          {!loading && displayItems.length === 0 && (
            <div className="text-stake-muted/50 text-sm text-center py-8">
              {searchQuery.trim()
                ? "No users found"
                : "No suggestions available"}
            </div>
          )}

          {!loading && displayItems.length > 0 && (
            <div>
              {displayItems.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-stake-card border-b border-[#444933]/20 px-[13px] h-[66px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#353534] border border-[#444933] flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-stake-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-white text-sm font-bold block">
                        {user.username}
                      </span>
                      <span className="text-stake-muted/50 text-xs">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  {user.isFriend ? (
                    <span className="text-stake-accent text-[10px] font-bold">
                      FRIENDS
                    </span>
                  ) : user.hasPendingRequest ? (
                    <span className="text-stake-muted/50 text-[10px] font-bold">
                      PENDING
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendInvite(user.id)}
                      disabled={sendingId === user.id}
                      className="border border-[#444933] px-[13px] py-[7px] disabled:opacity-50"
                    >
                      <span className="text-stake-textLight text-[10px] font-bold">
                        {sendingId === user.id ? "SENDING..." : "SEND INVITE"}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-[#444933] px-6 py-[12px] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-stake-accent text-[#161E00] py-[13px] text-xs font-bold"
          >
            DONE
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-[#444933] text-stake-textLight py-[13px] text-xs font-bold"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

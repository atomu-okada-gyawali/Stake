"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { friendsAPI } from "@/lib/services";

interface SquadRequestsModalProps {
  open: boolean;
  onClose: () => void;
}

interface IncomingRequest {
  id: string;
  sender: {
    id: string;
    username: string;
    email: string;
  };
  createdAt: string;
}

export default function SquadRequestsModal({ open, onClose }: SquadRequestsModalProps) {
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setLoading(true);
    friendsAPI
      .listRequests()
      .then(({ data }) => setRequests(data.received ?? []))
      .catch(() => setError("Failed to load requests"))
      .finally(() => setLoading(false));
  }, [open]);

  const handleAccept = async (id: string) => {
    try {
      await friendsAPI.acceptRequest(id);
      toast.success("Friend request accepted!");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to accept request");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await friendsAPI.declineRequest(id);
      toast.success("Friend request declined");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to decline request");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-[526px] bg-stake-bg border border-[#444933] shadow-2xl mb-12">
        {/* Header */}
        <div className="mx-2 mt-2 border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-6">
            <h2 className="text-stake-textLight text-2xl font-bold">
              Squad Requests
            </h2>
            <button onClick={onClose} className="text-stake-muted">
              <svg
                className="w-[14px] h-[14px]"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer summary */}
        <div className="mx-2 bg-[#0E0E0E] border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-[25px]">
            <span className="text-stake-muted text-xs font-semibold">
              {requests.length} PENDING REQUEST{requests.length !== 1 ? "S" : ""}
            </span>
            <button className="text-stake-textLight text-xs font-bold">
              VIEW ALL
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mx-2 mb-2">
          {loading && (
            <div className="text-stake-muted text-sm text-center py-12">
              Loading...
            </div>
          )}

          {!loading && error && (
            <div className="mx-4 mt-4 p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && requests.length === 0 && (
            <div className="text-stake-muted/50 text-sm text-center py-12">
              No pending requests
            </div>
          )}

          {!loading && requests.length > 0 && (
            <div>
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center px-4 h-[88px]"
                >
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-[#353534] border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-stake-muted text-lg font-bold">
                      {req.sender.username.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="ml-[16px] flex-1 min-w-0">
                    <h3 className="text-stake-textLight text-lg font-bold truncate">
                      {req.sender.username}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleDecline(req.id)}
                      className="w-10 h-10 border border-[#444933] flex items-center justify-center"
                    >
                      <svg
                        className="w-[14px] h-[14px] text-stake-muted"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 1l12 12M13 1L1 13" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="w-10 h-10 bg-stake-accent flex items-center justify-center shadow-[0_0_15px_rgba(187,244,0,0.2)]"
                    >
                      <svg
                        className="w-[18px] h-[14px] text-[#556D00]"
                        viewBox="0 0 19 15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M1 7.5l6 6L18 1" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

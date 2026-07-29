import React from "react";

interface FeedCardProps {
  userName: string;
  userAvatarUrl?: string;
  timestamp: string;
  goalTitle: string;
  description: string;
  proofUrl?: string;
  proofType?: "image" | "video";
  status?: "pending" | "verified" | "failed";
  kind?: "proof" | "failure";
  canVerify?: boolean;
  isVerifying?: boolean;
  onVerify?: () => void;
  onLike?: () => void;
}

const FeedCard: React.FC<FeedCardProps> = ({
  userName,
  userAvatarUrl,
  timestamp,
  goalTitle,
  description,
  proofUrl,
  proofType,
  status = "pending",
  kind = "proof",
  canVerify = false,
  isVerifying = false,
  onVerify,
  onLike,
}) => {
  const isFailure = kind === "failure";

  return (
    <article className="max-w-[620px] bg-stake-card border border-[#2D2D2D] shadow-2xl">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#1A1A1A] border border-white/10 flex items-center justify-center overflow-hidden">
            {userAvatarUrl ? (
              <img
                src={userAvatarUrl}
                alt={`${userName}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-4 h-4 border-2 border-stake-muted rounded-full" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm leading-none">
              {userName}
            </span>
            <span className="text-stake-muted text-xs mt-1">{timestamp}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5 mb-4">
          <h4 className={`font-bold text-sm ${isFailure ? "text-stake-dangerText" : "text-white"}`}>
            {isFailure ? "Failed goal" : "Goal"}: {goalTitle}
          </h4>
          <p className="text-[#A1A1AA] text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Proof Media */}
        {(proofUrl || !isFailure) && (
          <div className="w-full aspect-video bg-[#0A0A0A] border border-white/5 flex items-center justify-center group relative overflow-hidden">
            {proofUrl && proofType === "video" ? (
              <video
                src={proofUrl}
                controls
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : proofUrl ? (
              <img
                src={proofUrl}
                alt="Proof"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                <div className="z-10 bg-black/60 px-4 py-2 border border-white/10">
                  <span className="text-[10px] font-black text-stake-muted uppercase tracking-[0.2em]">
                    Proof Image Pending
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={onLike}
            className="h-10 bg-[#2D2D2D] border border-[#3F3F46] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#3F3F46] transition-all"
          >
            Like
          </button>
          {isFailure ? (
            <button
              disabled
              className="h-10 bg-stake-dangerText/10 text-stake-dangerText font-black text-xs uppercase tracking-widest cursor-default"
            >
              Failure Reported
            </button>
          ) : status === "verified" ? (
            <button
              disabled
              className="h-10 bg-stake-accent/10 text-stake-accent font-black text-xs uppercase tracking-widest cursor-default"
            >
              Verified
            </button>
          ) : status === "failed" ? (
            <button
              disabled
              className="h-10 bg-stake-dangerText/10 text-stake-dangerText font-black text-xs uppercase tracking-widest cursor-default"
            >
              Rejected
            </button>
          ) : canVerify ? (
            <button
              onClick={onVerify}
              disabled={isVerifying}
              className="h-10 bg-stake-accent text-black font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_4px_14px_rgba(187,244,0,0.3)] disabled:opacity-60"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          ) : (
            <button
              disabled
              title="Only the friend chosen as verifier for this goal can verify it"
              className="h-10 bg-[#2D2D2D]/50 text-stake-muted font-black text-xs uppercase tracking-widest cursor-not-allowed"
            >
              Awaiting Verifier
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default FeedCard;

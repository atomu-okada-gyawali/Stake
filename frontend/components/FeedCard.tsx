import React from "react";

interface FeedCardProps {
  userName: string;
  timestamp: string;
  goalTitle: string;
  description: string;
  onVerify?: () => void;
  onLike?: () => void;
}

const FeedCard: React.FC<FeedCardProps> = ({
  userName,
  timestamp,
  goalTitle,
  description,
  onVerify,
  onLike,
}) => {
  return (
    <article className="max-w-[739px] bg-stake-card border border-[#2D2D2D] shadow-2xl">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-[#1A1A1A] border border-white/10 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-stake-muted rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-base leading-none">
              {userName}
            </span>
            <span className="text-stake-muted text-xs mt-1">{timestamp}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-5">
          <h4 className="text-white font-bold text-base">Goal: {goalTitle}</h4>
          <p className="text-[#A1A1AA] text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Image Placeholder */}
        <div className="w-full aspect-[16/10] bg-[#0A0A0A] border border-white/5 flex items-center justify-center group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
          <div className="z-10 bg-black/60 px-4 py-2 border border-white/10">
            <span className="text-[10px] font-black text-stake-muted uppercase tracking-[0.2em]">
              Proof Image Pending
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={onLike}
            className="h-11 bg-[#2D2D2D] border border-[#3F3F46] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#3F3F46] transition-all"
          >
            Like
          </button>
          <button
            onClick={onVerify}
            className="h-11 bg-stake-accent text-black font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_4px_14px_rgba(187,244,0,0.3)]"
          >
            Verify
          </button>
        </div>
      </div>
    </article>
  );
};

export default FeedCard;

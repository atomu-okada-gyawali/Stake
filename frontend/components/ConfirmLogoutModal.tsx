"use client";

interface ConfirmLogoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

export default function ConfirmLogoutModal({
  open,
  onClose,
  onConfirm,
  isLoggingOut,
}: ConfirmLogoutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[400px] mx-4 bg-stake-bg border border-[#444933] shadow-2xl">
        {/* Header */}
        <div className="mx-2 mt-2 border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-6">
            <h2 className="text-stake-textLight text-2xl font-bold">Log Out</h2>
            <button onClick={onClose} className="text-stake-muted">
              <svg className="w-[14px] h-[14px]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <p className="text-stake-muted text-sm">
            Are you sure you want to log out? You'll need to sign back in to see your goals and squad.
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-[#444933] px-6 py-[12px] flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex-1 bg-stake-dangerText text-[#2B0A06] py-[13px] text-xs font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? "LOGGING OUT..." : "LOG OUT"}
          </button>
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 border border-[#444933] text-stake-textLight py-[13px] text-xs font-bold uppercase disabled:opacity-40"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

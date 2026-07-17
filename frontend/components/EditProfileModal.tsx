"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authAPI, UserProfile } from "@/lib/services";
import { API_BASE_URL } from "@/lib/apiClient";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaved: (user: UserProfile) => void;
}

const uploadsBase = API_BASE_URL.replace(/\/api$/, "");

export default function EditProfileModal({ open, onClose, user, onSaved }: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(user.username);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setUsername(user.username);
      setAvatarFile(null);
      setAvatarPreview(null);
      setError(null);
    }
  }, [open, user]);

  if (!open) return null;

  const handleAvatarSelect = (file: File | null) => {
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const currentAvatarUrl = avatarPreview ?? (user.avatarUrl ? `${uploadsBase}${user.avatarUrl}` : null);

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await authAPI.updateProfile({
        username: username !== user.username ? username : undefined,
        avatar: avatarFile ?? undefined,
      });
      toast.success("Profile updated successfully!");
      onSaved(data);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Object && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : "Failed to update profile";
      setError(message ?? "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-[480px] bg-stake-bg border border-[#444933] shadow-2xl mb-12">
        {/* Header */}
        <div className="mx-2 mt-2 border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-6">
            <h2 className="text-stake-textLight text-2xl font-bold">Edit Profile</h2>
            <button onClick={onClose} className="text-stake-muted">
              <svg className="w-[14px] h-[14px]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 shrink-0"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleAvatarSelect(e.target.files?.[0] ?? null)}
              />
              <div className="w-24 h-24 rounded-full bg-[#353534] border border-[#444933] overflow-hidden flex items-center justify-center">
                {currentAvatarUrl ? (
                  <img src={currentAvatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-stake-muted text-2xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-stake-accent border-2 border-stake-bg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#161E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
              </div>
            </button>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-stake-muted uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1C1B1B] border border-[#444933] px-4 py-3 text-white text-sm outline-none focus:border-stake-accent transition-colors"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-[#444933] px-6 py-[12px] flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSubmitting || !username.trim()}
            className="flex-1 bg-stake-accent text-[#161E00] py-[13px] text-xs font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-[#444933] text-stake-textLight py-[13px] text-xs font-bold uppercase"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

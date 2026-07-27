"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearAuth } from "../lib/auth";
import { authAPI, friendsAPI, UserProfile } from "../lib/services";
import { API_BASE_URL } from "../lib/apiClient";
import { toast } from "sonner";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

const uploadsBase = API_BASE_URL.replace(/\/api$/, "");

function NavLink({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[20px] font-bold flex items-center gap-2 transition-colors ${
        active ? "text-stake-accent" : "text-stake-muted hover:text-stake-accent"
      }`}
    >
      {children}
    </button>
  );
}

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    authAPI
      .getCurrentUser()
      .then(({ data }) => setUser(data))
      .catch(() => {});
    friendsAPI
      .listRequests()
      .then(({ data }) => setPendingRequestCount(data.received?.length ?? 0))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authAPI.logout();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to log out");
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      router.push("/");
    }
  };

  return (
    <nav className="fixed top-0 w-full h-[97px] bg-stake-bg/80 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between z-50">
      <button
        onClick={() => router.push("/circle-feed")}
        className="text-2xl font-black text-white tracking-tight"
      >
        STAKE
      </button>

      <div className="flex items-center gap-8">
        <NavLink active={pathname === "/circle-feed"} onClick={() => router.push("/circle-feed")}>
          Circle Feed
        </NavLink>

        <NavLink active={pathname === "/profile"} onClick={() => router.push("/profile")}>
          <div className="w-5 h-5 rounded-full bg-stake-muted/20 border border-current overflow-hidden flex items-center justify-center shrink-0">
            {user?.avatarUrl ? (
              <img
                src={`${uploadsBase}${user.avatarUrl}`}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[10px] font-bold leading-none">
                {user?.username.charAt(0).toUpperCase() ?? ""}
              </span>
            )}
          </div>
          Profile
        </NavLink>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          disabled={isLoggingOut}
          className="text-[20px] font-bold text-stake-logout hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {isLoggingOut ? "Logging Out..." : "Log Out"}
        </button>

        <div className="h-6 w-[1px] bg-white/10" />

        <button
          onClick={() => router.push("/circle-feed")}
          aria-label={
            pendingRequestCount > 0
              ? `${pendingRequestCount} pending squad request${pendingRequestCount !== 1 ? "s" : ""}`
              : "Squad requests"
          }
          className="relative text-stake-muted hover:text-stake-accent transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {pendingRequestCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-stake-accent text-[#161E00] text-[10px] font-bold flex items-center justify-center">
              {pendingRequestCount}
            </span>
          )}
        </button>
      </div>

      <ConfirmLogoutModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </nav>
  );
};

export default Header;

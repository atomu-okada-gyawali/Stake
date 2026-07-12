"use client";

import { useRouter, usePathname } from "next/navigation";
import { clearAuth } from "../lib/auth";
import { authAPI } from "../lib/services";
import { toast } from "sonner";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full h-[97px] bg-stake-bg/80 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between z-50">
      <button
        onClick={() => router.push("/circle-feed")}
        className="text-2xl font-black text-white tracking-tight"
      >
        STAKE
      </button>

      <div className="flex items-center gap-8">
        <button
          onClick={() => router.push("/circle-feed")}
          className={`text-[20px] font-bold transition-colors ${
            pathname === "/circle-feed"
              ? "text-stake-accent"
              : "text-stake-muted hover:text-stake-accent"
          }`}
        >
          Circle Feed
        </button>
        <button
          onClick={() => router.push("/profile")}
          className={`text-[20px] font-bold flex items-center gap-2 transition-colors ${
            pathname === "/profile"
              ? "text-stake-accent"
              : "text-stake-muted hover:text-stake-accent"
          }`}
        >
          <div className="w-3 h-3 border-2 border-current rounded-full" />
          Profile
        </button>
        <button
          onClick={async () => {
            try { await authAPI.logout(); } catch { toast.error("Failed to log out"); }
            clearAuth();
            router.push("/");
          }}
          className="text-[20px] font-bold text-stake-logout hover:opacity-80"
        >
          Log Out
        </button>

        <div className="h-6 w-[1px] bg-white/10" />

        <div className="flex gap-4">
          <div className="w-5 h-5 bg-stake-muted opacity-90 rounded-sm cursor-pointer" />
          <div className="w-5 h-5 bg-stake-muted opacity-90 rounded-sm cursor-pointer" />
        </div>
      </div>
    </nav>
  );
};

export default Header;
"use client";

import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-stake-bg font-poppins flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg">
        <div className="h-18 flex items-center justify-center">
          <h1 className="text-white text-5xl font-extrabold tracking-tight">
            STAKE
          </h1>
        </div>

        <div className="bg-stake-card border border-white/5 p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <h2 className="text-white text-[32px] font-bold mb-8">
            {isLogin ? "Login" : "Registration"}
          </h2>

          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="w-12 h-px bg-[#444933]" />

          <div className="w-12 h-px bg-[#444933]" />
        </div>
      </div>
    </div>
  );
}

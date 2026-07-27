"use client";

import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { setAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthField from "./AuthField";
import PrimaryButton from "@/components/wizard/PrimaryButton";
import { ArrowRight } from "@/components/wizard/Icons";
import { Button } from "@/components/ActionButton";

interface LoginFormProps {
  onToggleMode: () => void;
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;
      setAuth(token, user);

      router.push("/circle-feed");
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AuthField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="performer@stake.co"
        required
      />

      <AuthField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      <PrimaryButton variant="submit" onClick={() => {}} disabled={loading}>
        {loading ? "SUBMITTING..." : "SUBMIT"}
        <ArrowRight />
      </PrimaryButton>

      <div className="pt-6 border-t border-[#444933] space-y-6">
        <div className="flex items-center justify-center gap-3">
          <span className="text-stake-muted text-base">No account?</span>
          <Button variant="outline-lime" type="button" onClick={onToggleMode}>
            Register
          </Button>
        </div>

        <button
          type="button"
          onClick={() => toast.info("Password reset isn't available yet")}
          className="block mx-auto text-stake-muted text-xs font-bold uppercase tracking-wider hover:text-white transition-colors"
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
}

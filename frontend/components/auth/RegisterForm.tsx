"use client";

import { useState } from "react";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { setAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AuthField from "./AuthField";
import PrimaryButton from "@/components/wizard/PrimaryButton";
import { ArrowRight } from "@/components/wizard/Icons";

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!agreed) {
      toast.error("You must agree to the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/auth/register", {
        fullName,
        username,
        email,
        password,
      });

      const { token, user } = response.data;
      setAuth(token, user);

      toast.success("Account created successfully!");
      router.push("/circle-feed");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AuthField
        label="Full Name"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="e.g. David Goggins"
        required
      />

      <AuthField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="performer@stake.co"
        required
      />

      <AuthField
        label="Username"
        prefix="@"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="chief_performer"
        required
      />

      <div className="grid grid-cols-2 gap-8">
        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <AuthField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <label className="flex items-start gap-4 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 w-5 h-5 shrink-0 border border-[#444933] bg-white accent-stake-accent"
        />
        <span className="text-stake-textLight text-xs font-bold uppercase leading-relaxed">
          I agree to the terms and conditions and understand the stakes.
        </span>
      </label>

      <PrimaryButton variant="submit" onClick={() => {}} disabled={loading}>
        {loading ? "SUBMITTING..." : "SUBMIT"}
        <ArrowRight />
      </PrimaryButton>
    </form>
  );
}

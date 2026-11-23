"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, ShieldCheck, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [activeRole, setActiveRole] = useState<"store_owner" | "admin">("store_owner");
  const [name, setName] = useState("maya@happypaws.sy");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation rules from Technical Specification (Section 4.1):
    // 1. Any empty fields: "Please fill in all empty fields."
    if (!name.trim() || !password.trim()) {
      setError("Please fill in all empty fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        name: name.trim(),
        password: password.trim(),
      });

      login(response.accessToken, response.user);
      router.push("/dashboard");
    } catch {
      // 2. Failed login rule from Specification:
      // "Invalid name or password. Please re-enter."
      setError("Invalid name or password. Please re-enter.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSwitch = (role: "store_owner" | "admin") => {
    setActiveRole(role);
    setError(null);
    if (role === "admin") {
      setName("admin@rafeeq.sy");
      setPassword("Admin@2026");
    } else {
      setName("maya@happypaws.sy");
      setPassword("StoreOwner@2026");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-7 p-4">
      {/* Workspace Indicator */}
      <div className="flex items-center gap-2 text-xs font-bold text-navy/80 dark:text-yellow tracking-wider uppercase">
        <ShieldCheck className="w-4 h-4 text-blue" />
        <span>Your Rafeeq Workspace</span>
      </div>

      {/* Headings */}
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-muted">
          Sign in to care for what matters.
        </p>
      </div>

      {/* Role Switcher Tabs (Figma spec: Store Owner / Admin) */}
      <div className="grid grid-cols-2 p-1.5 bg-cream/70 dark:bg-card border border-card-border rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => handleRoleSwitch("store_owner")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
            activeRole === "store_owner"
              ? "bg-white dark:bg-card-border text-foreground shadow-xs"
              : "text-muted hover:text-foreground"
          }`}
        >
          <StoreIcon className="w-4 h-4" />
          <span>Store owner</span>
        </button>
        <button
          type="button"
          onClick={() => handleRoleSwitch("admin")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
            activeRole === "admin"
              ? "bg-white dark:bg-card-border text-foreground shadow-xs"
              : "text-muted hover:text-foreground"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Inline Error as required by spec (No browser alert) */}
        {error && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email / Username field */}
        <Input
          label="Email address"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. maya@happypaws.sy"
          icon={<User className="w-4 h-4" />}
          autoComplete="username"
        />

        {/* Password field with show/hide */}
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          icon={<Lock className="w-4 h-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted hover:text-foreground p-1 transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          autoComplete="current-password"
        />

        {/* Session preferences */}
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-foreground/80 font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-md border-input-border text-yellow accent-yellow focus:ring-yellow cursor-pointer"
            />
            <span>Remember me on this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full text-base font-bold shadow-sm"
        >
          {activeRole === "store_owner"
            ? "Sign in as store owner"
            : "Sign in as admin"}
        </Button>

        {/* Quick Demo Autofill Helper for Hackathon Evaluation */}
        <div className="pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => handleRoleSwitch(activeRole === "store_owner" ? "admin" : "store_owner")}
            className="w-full text-xs font-semibold text-muted hover:text-foreground"
          >
            {activeRole === "store_owner" ? "Switch to admin" : "Switch to store owner"}
          </Button>
        </div>
      </form>

      {/* Footer Info */}
      <p className="text-center text-xs text-muted/80">
        Having trouble? Contact your Rafeeq administrator.
      </p>
    </div>
  );
}

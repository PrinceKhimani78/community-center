"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

interface LoginFormProps {
  className?: string;
  hideCardBorderOnMobile?: boolean;
}

const emptySubscribe = () => () => {};

export default function LoginForm({ className = "", hideCardBorderOnMobile = true }: LoginFormProps) {
  const router = useRouter();
  const userIdInputRef = useRef<HTMLInputElement>(null);

  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);
  const [errors, setErrors] = useState<{ userId?: string; password?: string }>({});

  useEffect(() => {
    // Autofocus user ID field on desktop (>= 1024px)
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      userIdInputRef.current?.focus();
    }
  }, []);

  const validate = () => {
    const nextErrors: { userId?: string; password?: string } = {};
    if (!userId.trim()) {
      nextErrors.userId = "Please enter your user ID";
    }
    if (!password) {
      nextErrors.password = "Please enter your password";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordNotice(false);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId.trim(),
          password,
          keepMeSignedIn,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Red alert box at top: "User ID or password is incorrect." Never say which one was wrong.
        setAuthError("User ID or password is incorrect.");
        setIsLoading(false);
        return;
      }

      // Successful demo login redirect to /dashboard
      router.push("/dashboard");
    } catch {
      setAuthError("User ID or password is incorrect.");
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFEFA",
        borderColor: "#EFE4CC",
        borderWidth: "1px",
        borderRadius: "24px",
        boxShadow: "0 20px 50px -10px rgba(11, 42, 91, 0.09), 0 4px 16px rgba(201, 151, 28, 0.05)",
      }}
      className={`w-full max-w-[420px] mx-auto p-7 sm:p-9 ${className}`}
      suppressHydrationWarning
    >
      <form onSubmit={handleSubmit} noValidate suppressHydrationWarning className="flex flex-col gap-4">
        {/* Header */}
        <div>
          <h2
            style={{ color: "#0B224E" }}
            className="text-[28px] sm:text-[31px] font-bold leading-tight tracking-tight font-poppins"
          >
            Welcome back
          </h2>
          <p
            style={{ color: "#64748B" }}
            className="text-[13.5px] mt-1.5 font-normal leading-relaxed max-w-[340px]"
          >
            Sign in to continue to the Community Centre Management System.
          </p>
        </div>

        {/* Generic Auth Error Alert */}
        {authError && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-3.5 rounded-[12px] bg-red-50 border border-error/30 text-error text-[13px] font-medium flex items-center gap-2.5 animate-fadeIn"
          >
            <div className="w-2 h-2 rounded-full bg-error shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Forgot Password Notice */}
        {forgotPasswordNotice && (
          <div
            role="status"
            className="p-3.5 rounded-[12px] bg-[#FBF6EC] border border-light-gold text-navy text-[13px] font-medium flex items-center justify-between gap-2 animate-fadeIn"
          >
            <span>Please contact the Admin to reset your password.</span>
            <button
              type="button"
              onClick={() => setForgotPasswordNotice(false)}
              className="text-muted hover:text-navy text-xs font-semibold px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-light-gold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* User ID Field */}
        <div>
          <label
            htmlFor="userId"
            style={{ color: "#0B224E" }}
            className="block text-[13.5px] font-semibold mb-1.5"
          >
            User ID
          </label>
          <div className="relative flex items-center" suppressHydrationWarning>
            <span className="absolute left-3.5 text-[#64748B] pointer-events-none flex items-center">
              <User className="w-[18px] h-[18px]" aria-hidden="true" strokeWidth={1.8} />
            </span>
            <input
              ref={userIdInputRef}
              id="userId"
              name="userId"
              type="text"
              autoComplete="username"
              suppressHydrationWarning
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (errors.userId) {
                  setErrors((prev) => ({ ...prev, userId: undefined }));
                }
                if (authError) setAuthError(null);
              }}
              placeholder="Enter your user ID"
              aria-invalid={!!errors.userId}
              aria-describedby={errors.userId ? "userId-error" : undefined}
              style={{
                height: "48px",
                borderRadius: "11px",
                borderColor: errors.userId ? "#C62828" : "#DFCFA8",
                borderWidth: "1.2px",
                backgroundColor: "#FFFFFF",
              }}
              className="w-full pl-10 pr-4 text-[14px] text-ink transition-all placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-light-gold focus:border-transparent hover:border-light-gold"
            />
          </div>
          {errors.userId && (
            <p id="userId-error" className="mt-1.5 text-[12px] text-error font-medium">
              {errors.userId}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            style={{ color: "#0B224E" }}
            className="block text-[13.5px] font-semibold mb-1.5"
          >
            Password
          </label>
          <div className="relative flex items-center" suppressHydrationWarning>
            <span className="absolute left-3.5 text-[#64748B] pointer-events-none flex items-center">
              <Lock className="w-[18px] h-[18px]" aria-hidden="true" strokeWidth={1.8} />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              suppressHydrationWarning
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
                if (authError) setAuthError(null);
              }}
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              style={{
                height: "48px",
                borderRadius: "11px",
                borderColor: errors.password ? "#C62828" : "#DFCFA8",
                borderWidth: "1.2px",
                backgroundColor: "#FFFFFF",
              }}
              className="w-full pl-10 pr-11 text-[14px] text-ink transition-all placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-light-gold focus:border-transparent hover:border-light-gold"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 w-[44px] h-[44px] flex items-center justify-center text-[#64748B] hover:text-navy focus:outline-none focus:ring-2 focus:ring-light-gold rounded-lg transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" aria-hidden="true" strokeWidth={1.8} />
              ) : (
                <Eye className="w-[18px] h-[18px]" aria-hidden="true" strokeWidth={1.8} />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1.5 text-[12px] text-error font-medium">
              {errors.password}
            </p>
          )}
        </div>

        {/* Row: Checkbox "Remember Me" & link "Forgot password?" */}
        <div className="flex items-center justify-between select-none pt-0.5">
          <label className="flex items-center gap-2.5 cursor-pointer min-h-[44px] group">
            <div
              onClick={() => setKeepMeSignedIn(!keepMeSignedIn)}
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "4px",
                backgroundColor: keepMeSignedIn ? "#0B224E" : "#FFFFFF",
                borderColor: keepMeSignedIn ? "#0B224E" : "#CBD5E1",
                borderWidth: "1.5px",
                borderStyle: "solid",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {keepMeSignedIn && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path
                    d="M1.5 4.5L4 7L9.5 1.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span
              style={{ color: "#334155" }}
              className="text-[13px] font-medium whitespace-nowrap"
            >
              Remember Me
            </span>
          </label>
          <button
            type="button"
            onClick={() => setForgotPasswordNotice(true)}
            style={{ color: "#2563EB" }}
            className="text-[13px] font-normal hover:underline focus:outline-none focus:ring-2 focus:ring-light-gold rounded px-1 py-2 min-h-[44px] flex items-center transition-colors cursor-pointer whitespace-nowrap"
          >
            Forgot password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            height: "50px",
            backgroundColor: "#08204D",
            borderRadius: "11px",
            color: "#FFFFFF",
          }}
          className="w-full text-[15.5px] font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-[#0B2A5B] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-light-gold focus:ring-offset-2 transition-all disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer mt-1"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Signing in…</span>
            </div>
          ) : (
            <>
              <span>Login</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {/* Subtle Horizontal Divider as in Mockup */}
        <div style={{ height: "1px", backgroundColor: "#EDE5D6", margin: "14px 0 6px" }} />

        {/* Footer line inside card */}
        <div
          style={{ color: "#64748B" }}
          className="flex items-center justify-center gap-1.5 text-[12.5px] font-normal"
        >
          <ShieldCheck
            style={{ color: "#16A34A" }}
            className="w-4 h-4 shrink-0"
            aria-hidden="true"
          />
          <span>Secure session · Role-based access</span>
        </div>

        {/* Quick Demo Helper Hint */}
        <div className="mt-0.5 text-center">
          <p style={{ color: "#94A3B8", fontSize: "11px" }}>
            Demo: <strong style={{ color: "#0B224E" }}>manager</strong> / manager123 &bull; <strong style={{ color: "#0B224E" }}>admin</strong> / admin123
          </p>
        </div>
      </form>
    </div>
  );
}

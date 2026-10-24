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

  if (!isMounted) {
    return (
      <div
        className={`w-full max-w-[420px] mx-auto ${
          hideCardBorderOnMobile
            ? "lg:bg-white lg:border lg:border-card-border lg:rounded-[20px] lg:p-[36px] lg:shadow-[0_10px_30px_rgba(11,42,91,0.08)] p-0"
            : "bg-white border border-card-border rounded-[20px] p-[36px] shadow-[0_10px_30px_rgba(11,42,91,0.08)]"
        } ${className}`}
        suppressHydrationWarning
      >
        <div className="flex flex-col gap-[18px]" suppressHydrationWarning>
          <div>
            <h2 className="text-[26px] font-bold text-navy leading-tight tracking-tight">Sign in</h2>
            <p className="text-muted text-[14px] mt-1 font-normal leading-normal">
              Use the user ID given by your administrator.
            </p>
          </div>

          <div>
            <div className="block text-[13px] font-semibold text-navy mb-1.5">User ID</div>
            <div className="w-full h-[52px] rounded-[12px] border-[1.5px] border-field-border bg-white" />
          </div>

          <div>
            <div className="block text-[13px] font-semibold text-navy mb-1.5">Password</div>
            <div className="w-full h-[52px] rounded-[12px] border-[1.5px] border-field-border bg-white" />
          </div>

          <div className="flex items-center justify-between select-none min-h-[44px]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-field-border bg-navy/10" />
              <span className="text-[12.5px] sm:text-[13px] text-muted font-medium">Keep me signed in</span>
            </div>
            <span className="text-[12.5px] sm:text-[13px] font-semibold text-navy">Forgot password?</span>
          </div>

          <div className="w-full h-[54px] rounded-[14px] bg-navy text-white text-[16px] font-semibold flex items-center justify-center gap-2">
            <span>Login</span>
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="hidden lg:flex items-center justify-center gap-1.5 text-muted text-[12px] font-medium pt-1">
            <ShieldCheck className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
            <span>Secure session · Role-based access</span>
          </div>

          <div className="mt-1 pt-3 border-t border-field-border/40 text-center">
            <p className="text-[11px] text-muted/70">
              Demo access: <span className="font-semibold text-navy">manager</span> / <span className="font-mono text-navy">manager123</span> &bull; <span className="font-semibold text-navy">admin</span> / <span className="font-mono text-navy">admin123</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-[420px] mx-auto ${
        hideCardBorderOnMobile
          ? "lg:bg-white lg:border lg:border-card-border lg:rounded-[20px] lg:p-[36px] lg:shadow-[0_10px_30px_rgba(11,42,91,0.08)] p-0"
          : "bg-white border border-card-border rounded-[20px] p-[36px] shadow-[0_10px_30px_rgba(11,42,91,0.08)]"
      } ${className}`}
      suppressHydrationWarning
    >
      <form onSubmit={handleSubmit} noValidate suppressHydrationWarning className="flex flex-col gap-[18px]">
        {/* Header */}
        <div>
          <h2 className="text-[26px] font-bold text-navy leading-tight tracking-tight">Sign in</h2>
          <p className="text-muted text-[14px] mt-1 font-normal leading-normal">
            Use the user ID given by your administrator.
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
          <label htmlFor="userId" className="block text-[13px] font-semibold text-navy mb-1.5">
            User ID
          </label>
          <div className="relative flex items-center" suppressHydrationWarning>
            <span className="absolute left-4 text-muted pointer-events-none flex items-center">
              <User className="w-5 h-5 text-muted" aria-hidden="true" />
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
              className={`w-full h-[52px] pl-11 pr-4 text-[14px] text-ink bg-white rounded-[12px] border-[1.5px] transition-all placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-light-gold focus:border-transparent ${
                errors.userId
                  ? "border-error focus:ring-error"
                  : "border-field-border hover:border-light-gold/80"
              }`}
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
          <label htmlFor="password" className="block text-[13px] font-semibold text-navy mb-1.5">
            Password
          </label>
          <div className="relative flex items-center" suppressHydrationWarning>
            <span className="absolute left-4 text-muted pointer-events-none flex items-center">
              <Lock className="w-5 h-5 text-muted" aria-hidden="true" />
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
              className={`w-full h-[52px] pl-11 pr-12 text-[14px] text-ink bg-white rounded-[12px] border-[1.5px] transition-all placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-light-gold focus:border-transparent ${
                errors.password
                  ? "border-error focus:ring-error"
                  : "border-field-border hover:border-light-gold/80"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 w-[44px] h-[44px] flex items-center justify-center text-muted hover:text-navy focus:outline-none focus:ring-2 focus:ring-light-gold rounded-lg transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-muted" aria-hidden="true" />
              ) : (
                <Eye className="w-5 h-5 text-muted" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1.5 text-[12px] text-error font-medium">
              {errors.password}
            </p>
          )}
        </div>

        {/* Row: Checkbox "Keep me signed in" & link "Forgot password?" */}
        <div className="flex items-center justify-between select-none">
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px] group">
            <input
              type="checkbox"
              checked={keepMeSignedIn}
              onChange={(e) => setKeepMeSignedIn(e.target.checked)}
              className="w-4 h-4 rounded border-field-border text-navy accent-navy focus:outline-none focus:ring-2 focus:ring-light-gold cursor-pointer"
            />
            <span className="text-[12.5px] sm:text-[13px] text-muted group-hover:text-ink transition-colors font-medium whitespace-nowrap">
              Keep me signed in
            </span>
          </label>
          <button
            type="button"
            onClick={() => setForgotPasswordNotice(true)}
            className="text-[12.5px] sm:text-[13px] font-semibold text-navy hover:text-deep-gold focus:outline-none focus:ring-2 focus:ring-light-gold rounded px-1 py-2 min-h-[44px] flex items-center transition-colors cursor-pointer whitespace-nowrap"
          >
            Forgot password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[54px] rounded-[14px] bg-navy text-white text-[16px] font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-[#071f43] active:bg-[#051630] focus:outline-none focus:ring-2 focus:ring-light-gold focus:ring-offset-2 transition-all disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer"
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
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {/* Footer line on desktop card */}
        <div className="hidden lg:flex items-center justify-center gap-1.5 text-muted text-[12px] font-medium pt-1">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
          <span>Secure session · Role-based access</span>
        </div>

        {/* Quick Demo Helper Hint */}
        <div className="mt-1 pt-3 border-t border-field-border/40 text-center">
          <p className="text-[11px] text-muted/70">
            Demo access: <span className="font-semibold text-navy">manager</span> / <span className="font-mono text-navy">manager123</span> &bull; <span className="font-semibold text-navy">admin</span> / <span className="font-mono text-navy">admin123</span>
          </p>
        </div>
      </form>
    </div>
  );
}

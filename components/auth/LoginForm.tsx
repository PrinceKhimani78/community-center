"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

interface LoginFormProps {
  className?: string;
}


export default function LoginForm({ className = "" }: LoginFormProps) {
  const router = useRouter();
  const userIdInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"none" | "forgot" | "register">("none");
  const [forgotUserId, setForgotUserId] = useState("");
  const [forgotNote, setForgotNote] = useState("");
  const [regName, setRegName] = useState("");
  const [regUserId, setRegUserId] = useState("");
  const [regRole, setRegRole] = useState<"Manager" | "Accountant" | "Staff">("Staff");
  const [regPassword, setRegPassword] = useState("");
  const [modalBusy, setModalBusy] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ userId?: string; password?: string }>({});

  useEffect(() => {
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
    setAuthSuccess(null);

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
        setAuthError(data.message || "User ID or password is incorrect.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setAuthError("Unable to reach server. Please try again.");
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotUserId.trim()) {
      setModalError("Please enter your User ID.");
      return;
    }
    setModalBusy(true);
    setModalError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: forgotUserId.trim(), note: forgotNote.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.message || "Failed to send request.");
      } else {
        setAuthSuccess(data.message || "Admin has been notified to reset your password.");
        setActiveModal("none");
        setForgotUserId("");
        setForgotNote("");
      }
    } catch {
      setModalError("Network error while contacting server.");
    } finally {
      setModalBusy(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regUserId.trim() || regPassword.length < 6) {
      setModalError("Full name, User ID, and password (min 6 chars) are required.");
      return;
    }
    setModalBusy(true);
    setModalError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          userId: regUserId.trim().toLowerCase(),
          role: regRole,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.message || "Failed to submit login request.");
      } else {
        setAuthSuccess(
          data.message || "Account request submitted. You can sign in after Admin approves it."
        );
        setActiveModal("none");
        setRegName("");
        setRegUserId("");
        setRegPassword("");
      }
    } catch {
      setModalError("Network error while contacting server.");
    } finally {
      setModalBusy(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#FAF5EC",
        border: "1.5px solid rgba(226, 181, 68, 0.32)",
        borderRadius: "26px",
        boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.13), 0 4px 20px rgba(226, 181, 68, 0.09)",
        width: "100%",
        maxWidth: "460px",
        padding: "44px 38px",
      }}
      className={`mx-auto animate-fade-up ${className}`}
      suppressHydrationWarning
    >
      <form onSubmit={handleSubmit} noValidate suppressHydrationWarning className="flex flex-col">
        {/* Header */}
        <div>
          <h2
            style={{
              color: "#061A3E",
              fontSize: "32px",
              fontWeight: 800,
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              letterSpacing: "-0.02em",
            }}
            className="leading-tight"
          >
            Welcome back
          </h2>
          <p
            style={{
              color: "#5B6B84",
              fontSize: "13.5px",
              marginTop: "8px",
              lineHeight: 1.45,
            }}
          >
            Sign in to continue to the Community<br />
            Centre Management System.
          </p>
        </div>

        {/* Generic Auth Error Alert */}
        {authError && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              marginTop: "16px",
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
              fontSize: "12.5px",
              fontWeight: 500,
            }}
            className="flex items-center gap-2 animate-fadeIn"
          >
            <div className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Success / Approval Notice */}
        {authSuccess && (
          <div
            role="status"
            style={{
              marginTop: "16px",
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor: "#ECFDF5",
              border: "1px solid #BBF7D0",
              color: "#15803D",
              fontSize: "12.5px",
              fontWeight: 500,
            }}
            className="flex items-center justify-between gap-2 animate-fadeIn"
          >
            <span>{authSuccess}</span>
            <button
              type="button"
              onClick={() => setAuthSuccess(null)}
              className="text-[#15803D] font-bold hover:underline text-[11px] cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* User ID Field */}
        <div style={{ marginTop: "24px" }}>
          <label
            htmlFor="userId"
            style={{ color: "#061A3E", fontSize: "13px", fontWeight: 700 }}
            className="block mb-1.5"
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
              style={{
                height: "48px",
                borderRadius: "10px",
                border: errors.userId ? "1.5px solid #DC2626" : "1.5px solid #D6C5A2",
                backgroundColor: "#FFFFFF",
                paddingLeft: "42px",
                paddingRight: "16px",
                fontSize: "13.5px",
                color: "#061A3E",
                width: "100%",
                transition: "all 0.15s ease",
              }}
              className="focus:outline-none focus:ring-2 focus:ring-[#E2B544] focus:border-transparent placeholder:text-[#94A3B8]"
            />
          </div>
          {errors.userId && (
            <p className="mt-1 text-[11.5px] text-red-600 font-medium">
              {errors.userId}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div style={{ marginTop: "16px" }}>
          <label
            htmlFor="password"
            style={{ color: "#061A3E", fontSize: "13px", fontWeight: 700 }}
            className="block mb-1.5"
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
              style={{
                height: "48px",
                borderRadius: "10px",
                border: errors.password ? "1.5px solid #DC2626" : "1.5px solid #D6C5A2",
                backgroundColor: "#FFFFFF",
                paddingLeft: "42px",
                paddingRight: "44px",
                fontSize: "13.5px",
                color: "#061A3E",
                width: "100%",
                transition: "all 0.15s ease",
              }}
              className="focus:outline-none focus:ring-2 focus:ring-[#E2B544] focus:border-transparent placeholder:text-[#94A3B8]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ width: "36px", height: "36px" }}
              className="absolute right-2 flex items-center justify-center text-[#64748B] hover:text-[#061A3E] rounded transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" aria-hidden="true" strokeWidth={1.8} />
              ) : (
                <Eye className="w-[18px] h-[18px]" aria-hidden="true" strokeWidth={1.8} />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-[11.5px] text-red-600 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        {/* Row: Checkbox "Remember Me" & link "Forgot password?" */}
        <div className="flex items-center justify-between select-none mt-3.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setKeepMeSignedIn(!keepMeSignedIn)}
              style={{
                width: "17px",
                height: "17px",
                borderRadius: "4px",
                backgroundColor: keepMeSignedIn ? "#061A3E" : "#FFFFFF",
                border: keepMeSignedIn ? "1.5px solid #061A3E" : "1.5px solid #CBD5E1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {keepMeSignedIn && (
                <svg width="10" height="8" viewBox="0 0 11 9" fill="none">
                  <path
                    d="M1.5 4.5L4 7L9.5 1.5"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span
              style={{ color: "#061A3E", fontSize: "13px", fontWeight: 600 }}
              className="whitespace-nowrap"
            >
              Remember Me
            </span>
          </label>

          <button
            type="button"
            onClick={() => {
              setModalError(null);
              setForgotUserId(userId);
              setActiveModal("forgot");
            }}
            style={{ color: "#2563EB", fontSize: "12.5px", fontWeight: 500 }}
            className="hover:underline transition-colors cursor-pointer whitespace-nowrap"
          >
            Forgot password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            height: "48px",
            backgroundColor: "#061A3E",
            borderRadius: "10px",
            color: "#FFFFFF",
            fontSize: "15px",
            fontWeight: 700,
            marginTop: "20px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 2px 4px rgba(6, 26, 62, 0.25)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          className="interactive-btn hover:bg-[#0B2A5B] active:scale-[0.98] disabled:opacity-75 cursor-pointer group"
        >
          {isLoading ? (
            <span>Signing in…</span>
          ) : (
            <>
              <span>Login</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {/* Request New Login Link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setModalError(null);
              setActiveModal("register");
            }}
            style={{ color: "#0B2A5B", fontSize: "12.5px", fontWeight: 600 }}
            className="hover:underline cursor-pointer"
          >
            New staff member? Request login access (Admin approval)
          </button>
        </div>

        {/* Footer line: Secure session · Role-based access */}
        <div
          style={{ color: "#64748B", fontSize: "12px", marginTop: "16px" }}
          className="flex items-center justify-center gap-1.5"
        >
          <ShieldCheck
            style={{ color: "#059669" }}
            className="w-4 h-4 shrink-0"
            aria-hidden="true"
          />
          <span>Secure session · Role-based access</span>
        </div>
      </form>

      {/* Forgot Password Modal */}
      {activeModal === "forgot" && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleForgotSubmit} className="w-full max-w-sm rounded-2xl bg-white border border-[#EFE4CC] p-5 shadow-2xl space-y-3.5">
            <h3 className="text-[16px] font-bold text-[#0B2A5B]">Request Password Reset</h3>
            <p className="text-[12.5px] text-[#5B6474]">
              Your request will be sent to Admin to assign a new password.
            </p>
            {modalError && (
              <p className="text-[12px] font-semibold text-[#C62828] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
                {modalError}
              </p>
            )}
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">User ID *</label>
              <input
                type="text"
                value={forgotUserId}
                onChange={(e) => setForgotUserId(e.target.value)}
                placeholder="Enter your user ID"
                className="w-full h-10 px-3 rounded-xl border border-[#D6C5A2] text-[13.5px] text-[#061A3E] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">Reason / Note (optional)</label>
              <input
                type="text"
                value={forgotNote}
                onChange={(e) => setForgotNote(e.target.value)}
                placeholder="e.g. Locked out on phone"
                className="w-full h-10 px-3 rounded-xl border border-[#D6C5A2] text-[13.5px] text-[#061A3E] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveModal("none")}
                className="px-4 py-2 rounded-xl border border-[#EFE4CC] text-[12.5px] font-bold text-[#5B6474] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalBusy}
                className="px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[12.5px] font-bold cursor-pointer disabled:opacity-60"
              >
                {modalBusy ? "Sending…" : "Notify Admin"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Request New Login Modal */}
      {activeModal === "register" && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleRegisterSubmit} className="w-full max-w-sm rounded-2xl bg-white border border-[#EFE4CC] p-5 shadow-2xl space-y-3">
            <h3 className="text-[16px] font-bold text-[#0B2A5B]">Request New Login Account</h3>
            <p className="text-[12.5px] text-[#5B6474]">
              New logins stay pending until reviewed and approved by Admin.
            </p>
            {modalError && (
              <p className="text-[12px] font-semibold text-[#C62828] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
                {modalError}
              </p>
            )}
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">Full Name *</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Yusuf Patel"
                className="w-full h-10 px-3 rounded-xl border border-[#D6C5A2] text-[13.5px] text-[#061A3E] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">Desired User ID *</label>
              <input
                type="text"
                value={regUserId}
                onChange={(e) => setRegUserId(e.target.value)}
                placeholder="e.g. yusuf"
                className="w-full h-10 px-3 rounded-xl border border-[#D6C5A2] text-[13.5px] text-[#061A3E] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">Role *</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as "Manager" | "Accountant" | "Staff")}
                className="w-full h-10 px-3 rounded-xl border border-[#D6C5A2] text-[13.5px] text-[#061A3E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              >
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">Password (min 6 chars) *</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-10 px-3 rounded-xl border border-[#D6C5A2] text-[13.5px] text-[#061A3E] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveModal("none")}
                className="px-4 py-2 rounded-xl border border-[#EFE4CC] text-[12.5px] font-bold text-[#5B6474] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalBusy}
                className="px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[12.5px] font-bold cursor-pointer disabled:opacity-60"
              >
                {modalBusy ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

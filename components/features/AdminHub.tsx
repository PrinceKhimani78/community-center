"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  BarChart3,
  Users,
  History,
  Settings,
  Check,
  X,
  Printer,
  Download,
  UserPlus,
  Trash2,
  ShieldAlert,
  MapPin,
  Wallet,
  Building2,
  RotateCcw,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Pencil,
  KeyRound,
} from "lucide-react";
import {
  useDashboard,
  type SystemSettingsState,
} from "@/lib/context/DashboardContext";
import type { SystemUser } from "@/lib/mock/dashboard";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";
import StatusBadge from "@/components/common/StatusBadge";

export type AdminTab = "settings" | "approvals" | "reports" | "users" | "audit";

const ROLE_OPTIONS: SystemUser["role"][] = ["Admin", "Manager", "Accountant", "Staff"];

const ROLE_BADGE_STYLES: Record<SystemUser["role"], string> = {
  Admin: "bg-[#0B2A5B] text-[#F4CF6A] border-[#0B2A5B]",
  Manager: "bg-[#ECFDF5] text-[#15803D] border-[#BBF7D0]",
  Accountant: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  Staff: "bg-[#FAF5EB] text-[#78350F] border-[#EFE4CC]",
};

function SettingsEditor({
  systemSettings,
  onSave,
  onReset,
}: {
  systemSettings: SystemSettingsState;
  onSave: (next: Partial<SystemSettingsState>) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<SystemSettingsState>(systemSettings);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
    setSavedNotice(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {savedNotice && (
        <div
          role="status"
          className="rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] px-4 py-3 text-[13px] font-bold text-[#15803D] flex items-center justify-between gap-2"
        >
          <span>Admin settings saved successfully.</span>
          <button
            type="button"
            onClick={() => setSavedNotice(false)}
            className="text-[#15803D] hover:opacity-75 cursor-pointer"
            aria-label="Dismiss saved notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Community Centre Profile */}
        <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-[#0B2A5B] font-bold text-[15.5px]">
            <Building2 className="w-4 h-4 text-[#C9971C]" />
            <h2>Community Centre Profile</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                Centre Name
              </label>
              <input
                type="text"
                value={draft.centreName}
                onChange={(e) => {
                  setSavedNotice(false);
                  setDraft((p) => ({ ...p, centreName: e.target.value }));
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                Location
              </label>
              <input
                type="text"
                value={draft.centreLocation}
                onChange={(e) => {
                  setSavedNotice(false);
                  setDraft((p) => ({ ...p, centreLocation: e.target.value }));
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
          </div>
        </section>

        {/* Geo-fence & Alerts Control */}
        <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-[#0B2A5B] font-bold text-[15.5px]">
            <MapPin className="w-4 h-4 text-[#C9971C]" />
            <h2>Geo-fence &amp; Attendance Alerts</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.0000001"
                value={draft.geofenceLatitude}
                onChange={(e) => {
                  setSavedNotice(false);
                  setDraft((p) => ({
                    ...p,
                    geofenceLatitude: Number(e.target.value) || 0,
                  }));
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0000001"
                value={draft.geofenceLongitude}
                onChange={(e) => {
                  setSavedNotice(false);
                  setDraft((p) => ({
                    ...p,
                    geofenceLongitude: Number(e.target.value) || 0,
                  }));
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                Radius (meters)
              </label>
              <input
                type="number"
                min={20}
                max={5000}
                value={draft.geofenceRadiusMeters}
                onChange={(e) => {
                  setSavedNotice(false);
                  setDraft((p) => ({
                    ...p,
                    geofenceRadiusMeters: Math.max(20, Number(e.target.value) || 200),
                  }));
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] font-bold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between gap-3 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] px-3.5 py-2.5 cursor-pointer">
              <span className="text-[13px] font-semibold text-[#14213D]">
                Require GPS check inside geo-fence for Check-In / Check-Out
              </span>
              <input
                type="checkbox"
                checked={draft.requireGpsForCheckIn}
                onChange={(e) => {
                  setSavedNotice(false);
                  setDraft((p) => ({ ...p, requireGpsForCheckIn: e.target.checked }));
                }}
                className="w-4 h-4 accent-[#0B2A5B]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] px-3.5 py-2.5 cursor-pointer">
              <span className="text-[13px] font-semibold text-[#14213D]">
                Route all attendance &amp; geo-fence alerts to Admin
              </span>
              <input
                type="checkbox"
                checked={draft.routeAllAlertsToAdmin}
                onChange={(e) => {
                  setSavedNotice(false);
                  setDraft((p) => ({ ...p, routeAllAlertsToAdmin: e.target.checked }));
                }}
                className="w-4 h-4 accent-[#0B2A5B]"
              />
            </label>
          </div>
        </section>

        {/* Hall Pricing & Booking Governance */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 text-[#0B2A5B] font-bold text-[15.5px]">
            <Wallet className="w-4 h-4 text-[#C9971C]" />
            <h2>Hall Pricing &amp; Booking Governance</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                Base Hall Rent / Floor (₹)
              </label>
              <input
                type="number"
                min={0}
                value={draft.baseRentPerFloor}
                onChange={(e) => {
                  setSavedNotice(false);
                  setDraft((p) => ({
                    ...p,
                    baseRentPerFloor: Math.max(0, Number(e.target.value) || 0),
                  }));
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] font-bold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                A.C. Charges / Floor (₹)
              </label>
              <input
                type="number"
                min={0}
                value={draft.acSurchargePerFloor}
                onChange={(e) => {
                  setSavedNotice(false);
                  setDraft((p) => ({
                    ...p,
                    acSurchargePerFloor: Math.max(0, Number(e.target.value) || 0),
                  }));
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] font-bold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                Default Security Deposit (₹)
              </label>
              <input
                type="number"
                min={0}
                value={draft.defaultSecurityDeposit}
                onChange={(e) => {
                  setSavedNotice(false);
                  setDraft((p) => ({
                    ...p,
                    defaultSecurityDeposit: Math.max(0, Number(e.target.value) || 0),
                  }));
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] font-bold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] px-3.5 py-2.5 cursor-pointer">
            <span className="text-[13px] font-semibold text-[#14213D]">
              Require Admin approval for Free Community / Trustee Use manual pricing bookings
            </span>
            <input
              type="checkbox"
              checked={draft.requireFreeUseAdminApproval}
              onChange={(e) => {
                setSavedNotice(false);
                setDraft((p) => ({
                  ...p,
                  requireFreeUseAdminApproval: e.target.checked,
                }));
              }}
              className="w-4 h-4 accent-[#0B2A5B]"
            />
          </label>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onReset}
          style={{ minHeight: "42px" }}
          className="interactive-btn px-4 py-2 rounded-xl bg-white border border-[#EFE4CC] text-[#5B6474] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer hover:border-[#E2B544] hover:text-[#0B2A5B]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Defaults</span>
        </button>

        <button
          type="submit"
          style={{ minHeight: "42px" }}
          className="interactive-btn px-5 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13.5px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#F4CF6A]" />
          <span>Save Settings</span>
        </button>
      </div>
    </form>
  );
}

export default function AdminHub({
  initialTab = "settings",
  title = "Admin Settings",
  subtitle = "Manage centre configuration, geo-fence limits, approvals, reports, and activity.",
}: {
  initialTab?: AdminTab;
  title?: string;
  subtitle?: string;
}) {
  const {
    role,
    approvals,
    decideApproval,
    bookings,
    payments,
    expenses,
    users,
    toggleUserActive,
    addUser,
    updateUser,
    removeUser,
    auditLogs,
    systemSettings,
    updateSystemSettings,
    resetSystemSettings,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [reportCategory, setReportCategory] = useState<"Bookings" | "Money">("Bookings");
  const [settingsVersion, setSettingsVersion] = useState(0);

  // Add / Filter / Edit / Remove User UI state
  const [roleFilter, setRoleFilter] = useState<"All" | SystemUser["role"]>("All");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUserId, setNewUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newRole, setNewRole] = useState<SystemUser["role"]>("Manager");
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [revealedPasswordIds, setRevealedPasswordIds] = useState<Record<string, boolean>>({});
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editUserId, setEditUserId] = useState("");
  const [editRole, setEditRole] = useState<SystemUser["role"]>("Manager");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editActive, setEditActive] = useState(true);
  const [editUserError, setEditUserError] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<SystemUser | null>(null);

  const visibleUsers = useMemo(() => {
    if (roleFilter === "All") return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  if (role !== "admin") {
    return (
      <PageShell title="Restricted Module" subtitle="Admin privileges required">
        <div className="bg-white rounded-2xl border border-[#EFE4CC] p-8 max-w-lg mx-auto text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#C62828] mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-[18px] font-bold text-[#0B2A5B]">Admin Access Only</h2>
            <p className="text-[13.5px] text-[#5B6474]">
              Users and Admin Settings modules are visible only when signed in as Admin.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="interactive-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2A5B] text-white text-[13.5px] font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </PageShell>
    );
  }

  const pendingApprovals = approvals.filter((a) => a.status === "Pending").length;
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const activeAdminsCount = users.filter((u) => u.role === "Admin").length;

  const tabs: TabItem<AdminTab>[] = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "users", label: "Users", icon: Users, count: users.length },
    { id: "approvals", label: "Approvals", icon: CheckSquare, count: pendingApprovals },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "audit", label: "Activity Log", icon: History, count: auditLogs.length },
  ];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newName.trim();
    const cleanId = newUserId.trim().toLowerCase().replace(/\s+/g, "");
    const cleanPassword = newPassword.trim();

      if (!cleanName || !cleanId || !cleanPassword) {
        setUserFormError("Please enter Name, User ID, and Password.");
        return;
      }
      if (cleanPassword.length < 6) {
        setUserFormError("Password must be at least 6 characters.");
        return;
      }
      if (users.some((u) => u.userId.toLowerCase() === cleanId)) {
        setUserFormError(`User ID "${cleanId}" already exists.`);
        return;
      }

      addUser({ name: cleanName, userId: cleanId, role: newRole, password: cleanPassword });
      setNewName("");
      setNewUserId("");
      setNewPassword("");
      setShowNewPassword(false);
      setNewRole("Manager");
      setUserFormError(null);
      setShowAddUser(false);
    };

    const openEditUserModal = (user: SystemUser) => {
      setEditingUser(user);
      setEditName(user.name);
      setEditUserId(user.userId);
      setEditRole(user.role);
      setEditPassword(user.password || "");
      setShowEditPassword(false);
      setEditActive(user.active);
      setEditUserError(null);
    };

    const handleSaveEditUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingUser) return;

      const cleanName = editName.trim();
      const cleanId = editUserId.trim().toLowerCase().replace(/\s+/g, "");
      const cleanPassword = editPassword.trim();

      if (!cleanName || !cleanId) {
        setEditUserError("Name and User ID are required.");
        return;
      }
      if (cleanPassword && cleanPassword.length < 6) {
        setEditUserError("Password must be at least 6 characters.");
        return;
      }
      if (users.some((u) => u.id !== editingUser.id && u.userId.toLowerCase() === cleanId)) {
        setEditUserError(`User ID "${cleanId}" is already used by another account.`);
        return;
      }

      updateUser(editingUser.id, {
        name: cleanName,
        userId: cleanId,
        role: editRole,
        active: editActive,
        ...(cleanPassword ? { password: cleanPassword } : {}),
      });
      setEditingUser(null);
    };

    const handleExportCSV = () => {
      const rows = [
        ["Receipt", "Event", "Applicant", "Hall", "Date", "Rent", "Paid", "Status"],
        ...bookings.map((b) => [
          b.receiptNo,
          b.eventTitle,
          b.applicantName,
          b.hall,
          b.dateLabel,
          String(b.rent),
          String(b.paid),
          b.status,
        ]),
      ];
      const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "community-centre-bookings.csv";
      link.click();
      URL.revokeObjectURL(url);
    };

    return (
      <PageShell title={title} subtitle={subtitle}>
        <div className="no-print">
          <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} ariaLabel="Admin tabs" />
        </div>

        <div key={activeTab} className="animate-tab-enter">
          {activeTab === "settings" && (
            <SettingsEditor
              key={settingsVersion}
              systemSettings={systemSettings}
              onSave={(next) => updateSystemSettings(next)}
              onReset={() => {
                resetSystemSettings();
                setSettingsVersion((v) => v + 1);
              }}
            />
          )}

          {activeTab === "approvals" && (
            <div className="space-y-3">
              {approvals.map((item) => (
                <div
                  key={item.id}
                  className="interactive-row bg-white rounded-2xl border border-[#EFE4CC] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5EB] border border-[#EFE4CC] text-[#0B2A5B]">
                        {item.type}
                      </span>
                      <h3 className="font-bold text-[#0B2A5B] text-[15.5px]">{item.title}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-[13px] text-[#5B6474]">{item.detail}</p>
                    <p className="text-[13px] font-bold text-[#0B2A5B]">
                      Amount: {item.amountLabel} · Requested by {item.requester}
                    </p>
                  </div>

                  {item.status === "Pending" && (
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => decideApproval(item.id, "Approved")}
                        style={{ minHeight: "42px" }}
                        className="interactive-btn px-4 py-2 rounded-xl bg-[#15803D] text-white text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => decideApproval(item.id, "Rejected")}
                        style={{ minHeight: "42px" }}
                        className="interactive-btn px-4 py-2 rounded-xl bg-white border border-red-300 text-[#C62828] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="interactive-card bg-white rounded-2xl border border-[#EFE4CC] p-5">
                  <div className="text-[12.5px] text-[#5B6474] font-semibold">Total Bookings</div>
                  <div className="text-[28px] font-extrabold text-[#0B2A5B] mt-1">
                    {bookings.length}
                  </div>
                </div>
                <div className="interactive-card bg-white rounded-2xl border border-[#EFE4CC] p-5">
                  <div className="text-[12.5px] text-[#5B6474] font-semibold">Money Collected</div>
                  <div className="text-[28px] font-extrabold text-[#15803D] mt-1">
                    ₹{totalCollected.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="interactive-card bg-white rounded-2xl border border-[#EFE4CC] p-5">
                  <div className="text-[12.5px] text-[#5B6474] font-semibold">Total Expenses</div>
                  <div className="text-[28px] font-extrabold text-[#C62828] mt-1">
                    ₹{totalExpenses.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {(["Bookings", "Money"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setReportCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-semibold cursor-pointer ${reportCategory === cat
                            ? "bg-[#0B2A5B] text-white"
                            : "bg-[#FAF5EB] text-[#0B2A5B] border border-[#EFE4CC]"
                          }`}
                      >
                        {cat} Summary
                      </button>
                    ))}
                  </div>

                  <div className="no-print flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{ minHeight: "40px" }}
                      className="interactive-btn px-3.5 py-2 rounded-xl bg-[#FAF5EB] border border-[#E2B544] text-[#0B2A5B] text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print / PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      style={{ minHeight: "40px" }}
                      className="interactive-btn px-3.5 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Excel CSV</span>
                    </button>
                  </div>
                </div>

                {reportCategory === "Bookings" ? (
                  <div className="space-y-2.5">
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] flex flex-wrap justify-between gap-2 text-[13.5px]"
                      >
                        <span>
                          <strong>#{b.receiptNo}</strong> · {b.eventTitle} ({b.applicantName})
                        </span>
                        <span className="font-bold text-[#0B2A5B]">
                          Paid ₹{b.paid.toLocaleString("en-IN")} / ₹
                          {(b.rent + b.deposit).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] flex flex-wrap justify-between gap-2 text-[13.5px]"
                      >
                        <span>
                          <strong>{p.receiptNo}</strong> · {p.applicantName} ({p.mode})
                        </span>
                        <span className="font-bold text-[#15803D]">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              {/* Users Toolbar: Role Filter + Add User CTA */}
              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["All", ...ROLE_OPTIONS] as const).map((r) => {
                    const active = roleFilter === r;
                    const count = r === "All" ? users.length : users.filter((u) => u.role === r).length;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRoleFilter(r)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold cursor-pointer border transition-all ${active
                            ? "bg-[#0B2A5B] text-white border-[#0B2A5B]"
                            : "bg-[#FAF7F2] text-[#14213D] border-[#EFE4CC] hover:border-[#E2B544]"
                          }`}
                      >
                        <span>{r}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10.5px] ${active ? "bg-[#E2B544] text-[#041535]" : "bg-white text-[#0B2A5B]"
                            }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUserFormError(null);
                    setShowAddUser((prev) => !prev);
                  }}
                  style={{ minHeight: "40px" }}
                  className="interactive-btn px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#F4CF6A]" />
                  <span>{showAddUser ? "Cancel" : "Add User"}</span>
                </button>
              </div>

              {/* Add User Form */}
              {showAddUser && (
                <form
                  onSubmit={handleAddUser}
                  className="bg-white rounded-2xl border-2 border-[#E2B544]/60 p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15.5px] font-bold text-[#0B2A5B]">Add New User</h3>
                    <span className="text-[11.5px] font-semibold text-[#5B6474]">
                      Admin &amp; Manager roles
                    </span>
                  </div>

                  {userFormError && (
                    <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-2 text-[12.5px] font-semibold text-[#C62828]">
                      {userFormError}
                    </div>
                  )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div>
                        <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Yusuf Patel"
                          className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] text-[#0B2A5B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                          User ID *
                        </label>
                        <input
                          type="text"
                          value={newUserId}
                          onChange={(e) => setNewUserId(e.target.value)}
                          placeholder="e.g. manager2"
                          className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] text-[#0B2A5B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                          Password *
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full h-10 pl-3 pr-9 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] text-[#0B2A5B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                            className="absolute right-2.5 text-[#5B6474] hover:text-[#0B2A5B] cursor-pointer"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                          Role *
                        </label>
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value as SystemUser["role"])}
                          aria-label="User role"
                          className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] text-[#0B2A5B] font-bold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddUser(false)}
                        className="px-4 py-2 rounded-xl border border-[#EFE4CC] text-[13px] font-bold text-[#5B6474] cursor-pointer hover:bg-[#FAF7F2]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="interactive-btn px-5 py-2 rounded-xl bg-[#15803D] text-white text-[13px] font-bold cursor-pointer"
                      >
                        Save User
                      </button>
                    </div>
                </form>
              )}

              {/* Users List (Admin, Name, Manager & Staff) */}
              <div className="space-y-3">
                {visibleUsers.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#EFE4CC] p-8 text-center text-[13.5px] text-[#5B6474]">
                    No users found for this role filter.
                  </div>
                ) : (
                  visibleUsers.map((u) => {
                    const isSoleAdmin = u.role === "Admin" && activeAdminsCount <= 1;
                    const isPasswordShown = !!revealedPasswordIds[u.id];
                    const userPassword = u.password || "Not set";
                    return (
                      <div
                        key={u.id}
                        className="interactive-row bg-white rounded-2xl border border-[#EFE4CC] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[#0B2A5B] text-[15.5px]">{u.name}</span>
                            <span
                              className={`text-[11.5px] font-bold px-2.5 py-0.5 rounded-full border ${ROLE_BADGE_STYLES[u.role]
                                }`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[#5B6474]">
                            <span>
                              User ID: <strong className="text-[#0B2A5B]">{u.userId}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 text-[#C9971C]" />
                              <span>Password:</span>
                              <strong className="notranslate text-[#0B2A5B]">
                                {isPasswordShown ? userPassword : "••••••••"}
                              </strong>
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedPasswordIds((prev) => ({
                                    ...prev,
                                    [u.id]: !prev[u.id],
                                  }))
                                }
                                aria-label={isPasswordShown ? "Hide password" : "Show password"}
                                className="text-[#5B6474] hover:text-[#0B2A5B] cursor-pointer"
                              >
                                {isPasswordShown ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </span>
                            <span>Last login: {u.lastLogin}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditUserModal(u)}
                            style={{ minHeight: "38px" }}
                            className="interactive-btn px-3.5 py-1.5 rounded-xl bg-[#FAF5EB] border border-[#E2B544] text-[#0B2A5B] text-[12.5px] font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#F3E7CC]"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleUserActive(u.id)}
                            style={{ minHeight: "38px" }}
                            className={`interactive-btn px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold cursor-pointer ${u.active
                                ? "bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]"
                                : "bg-[#FEE2E2] text-[#C62828] border border-[#FECACA]"
                              }`}
                          >
                            {u.active ? "Active" : "Disabled"}
                          </button>

                          <button
                            type="button"
                            disabled={isSoleAdmin}
                            title={
                              isSoleAdmin
                                ? "At least one Admin account is required"
                                : `Remove ${u.name}`
                            }
                            onClick={() => setPendingDeleteUser(u)}
                            style={{ minHeight: "38px" }}
                            className="interactive-btn px-3.5 py-1.5 rounded-xl bg-white border border-red-200 text-[#C62828] text-[12.5px] font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-red-50 disabled:opacity-45 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="interactive-row bg-white rounded-2xl border border-[#EFE4CC] p-4 flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-[#0B2A5B] text-[14.5px]">{log.action}</div>
                    <div className="text-[13px] text-[#5B6474]">{log.detail}</div>
                  </div>
                  <div className="text-right text-[12px] text-[#78716C]">
                    <div className="font-semibold text-[#0B2A5B]">{log.userLabel}</div>
                    <div>{log.timeLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit User & Password Dialog */}
        {editingUser && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-dialog-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <form
              onSubmit={handleSaveEditUser}
              className="w-full max-w-md rounded-2xl bg-white border border-[#EFE4CC] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="edit-user-dialog-title" className="text-[17px] font-bold text-[#0B2A5B]">
                    Edit User &amp; Password
                  </h2>
                  <p className="text-[12.5px] text-[#5B6474] mt-0.5">
                    Update profile details, role, active access, or password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  aria-label="Close dialog"
                  className="p-1.5 rounded-lg text-[#5B6474] hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {editUserError && (
                <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-2 text-[12.5px] font-semibold text-[#C62828]">
                  {editUserError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] text-[#0B2A5B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                      User ID *
                    </label>
                    <input
                      type="text"
                      value={editUserId}
                      onChange={(e) => setEditUserId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] text-[#0B2A5B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                      Role *
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as SystemUser["role"])}
                      aria-label="Edit user role"
                      className="w-full h-10 px-3 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] text-[#0B2A5B] font-bold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#5B6474] mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      className="w-full h-10 pl-3 pr-9 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] text-[#0B2A5B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword((prev) => !prev)}
                      aria-label={showEditPassword ? "Hide password" : "Show password"}
                      className="absolute right-2.5 text-[#5B6474] hover:text-[#0B2A5B] cursor-pointer"
                    >
                      {showEditPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex items-center justify-between gap-3 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] px-3.5 py-2.5 cursor-pointer">
                  <span className="text-[13px] font-semibold text-[#0B2A5B]">Account Active</span>
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="w-4 h-4 accent-[#0B2A5B]"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-[#EFE4CC] text-[13.5px] font-bold text-[#0B2A5B] cursor-pointer hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#071D44]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confirm Remove User Dialog */}
        {pendingDeleteUser && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-user-dialog-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <div className="w-full max-w-md rounded-2xl bg-white border border-[#EFE4CC] p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="remove-user-dialog-title" className="text-[17px] font-bold text-[#0B2A5B]">
                    Remove User Account?
                  </h2>
                  <p className="text-[13px] text-[#5B6474] mt-1">
                    <strong>{pendingDeleteUser.name}</strong> ({pendingDeleteUser.role} ·{" "}
                    {pendingDeleteUser.userId}) will be removed from the system users list.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDeleteUser(null)}
                  aria-label="Close dialog"
                  className="p-1.5 rounded-lg text-[#5B6474] hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingDeleteUser(null)}
                  className="px-4 py-2 rounded-xl border border-[#EFE4CC] text-[13.5px] font-bold text-[#0B2A5B] cursor-pointer hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeUser(pendingDeleteUser.id);
                    setPendingDeleteUser(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#C62828] text-white text-[13.5px] font-bold cursor-pointer hover:bg-red-700"
                >
                  Remove User
                </button>
              </div>
            </div>
          </div>
        )}
      </PageShell>
    );
  }

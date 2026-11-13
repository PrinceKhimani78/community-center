"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from "react";
import {
  CENTRE_COORDINATES,
  GEOFENCE_RADIUS_METERS,
  formatDistanceMeters,
} from "@/lib/utils/geofence";
import {
  BASE_RENT_PER_FLOOR,
  AC_SURCHARGE_PER_FLOOR,
  DEFAULT_SECURITY_DEPOSIT,
  getTodayISO,
} from "@/lib/utils/bookings";
import {
  ActionItem,
  ApplicantRecord,
  ApprovalItem,
  AuditLogEntry,
  BookingRecord,
  BookingStatus,
  DepositRefundRecord,
  ExpenseRecord,
  HallCheckItem,
  INITIAL_ACTION_ITEMS,
  INITIAL_APPLICANTS,
  INITIAL_APPROVALS,
  INITIAL_ATTENDANCE_LOGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BOOKINGS,
  INITIAL_DEPOSIT_REFUNDS,
  INITIAL_EXPENSES,
  INITIAL_HALL_CHECK_ITEMS,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_ROLE_PERMISSIONS,
  INITIAL_STAFF_ATTENDANCE,
  INITIAL_SYSTEM_USERS,
  MaintenanceTicket,
  NotificationRecord,
  PaymentMode,
  PaymentRecord,
  RolePermissionItem,
  StaffAttendanceLogEntry,
  StaffAttendanceRecord,
  SystemUser,
} from "@/lib/mock/dashboard";

interface CompletedRecord {
  item: ActionItem;
  message: string;
}

export interface MyAttendanceState {
  checkedIn: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  geoVerified?: boolean;
  distanceMeters?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface GeoCheckPayload {
  distanceMeters: number;
  latitude: number;
  longitude: number;
  withinFence: boolean;
}

export interface AdminAlertInput {
  category?: NotificationRecord["category"];
  title: string;
  detail: string;
  href?: string;
  auditAction?: string;
}

export interface SystemSettingsState {
  centreName: string;
  centreLocation: string;
  centrePhone: string;
  geofenceLatitude: number;
  geofenceLongitude: number;
  geofenceRadiusMeters: number;
  requireGpsForCheckIn: boolean;
  routeAllAlertsToAdmin: boolean;
  baseRentPerFloor: number;
  acSurchargePerFloor: number;
  defaultSecurityDeposit: number;
  maxUploadSizeMb: number;
  requireFreeUseAdminApproval: boolean;
  requireBookingAdminApproval: boolean;
  requireUserAdminApproval: boolean;
  requirePaymentAdminApproval: boolean;
  requireCustomerEditAdminApproval: boolean;
  requireExpenseAdminApproval: boolean;
  requireRefundAdminApproval: boolean;
  requireRepairAdminApproval: boolean;
  requireAttendanceOverrideAdminApproval: boolean;
}

interface DashboardContextType {
  role: "manager" | "admin";
  userId: string;
  actionItems: ActionItem[];
  actionCount: number;
  unreadAlertCount: number;
  lastCompleted: CompletedRecord | null;
  completeAction: (id: string) => void;
  undoAction: () => void;
  clearUndoNotice: () => void;
  isMobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;

  // Domain records
  bookings: BookingRecord[];
  applicants: ApplicantRecord[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  refunds: DepositRefundRecord[];
  tickets: MaintenanceTicket[];
  hallCheckMode: "Before Event" | "After Event";
  setHallCheckMode: (mode: "Before Event" | "After Event") => void;
  hallCheckItems: HallCheckItem[];
  staffAttendance: StaffAttendanceRecord[];
  staffAttendanceLogs: StaffAttendanceLogEntry[];
  myAttendance: MyAttendanceState;
  approvals: ApprovalItem[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogEntry[];
  users: SystemUser[];
  rolePermissions: RolePermissionItem[];
  systemSettings: SystemSettingsState;

  // Actions
  addBooking: (booking: Omit<BookingRecord, "id" | "receiptNo">) => Promise<BookingRecord>;
  updateBooking: (
    bookingId: string,
    updates: Partial<Omit<BookingRecord, "id" | "receiptNo">>
  ) => Promise<BookingRecord | null>;
  cancelBooking: (bookingId: string, reason?: string) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  addApplicant: (applicant: Omit<ApplicantRecord, "id">) => ApplicantRecord;
  updateApplicant: (
    applicantId: string,
    updates: Partial<Omit<ApplicantRecord, "id">>
  ) => void;
  recordPayment: (input: {
    bookingId: string;
    type: PaymentRecord["type"];
    amount: number;
    mode: PaymentMode;
    reference: string;
  }) => PaymentRecord | null;
  addExpense: (input: Omit<ExpenseRecord, "id" | "dateLabel" | "status">) => void;
  processRefund: (refundId: string, deductionAmount?: number, note?: string) => void;
  updateDepositRefund: (
    refundId: string,
    updates: Partial<Omit<DepositRefundRecord, "id">>
  ) => void;
  sendPaymentReminders: (count: number) => void;
  addMaintenanceTicket: (
    input: Omit<MaintenanceTicket, "id" | "ticketNo" | "raisedBy" | "dateLabel" | "status"> & {
      status?: MaintenanceTicket["status"];
    }
  ) => MaintenanceTicket;
  updateTicketStatus: (ticketId: string, status: MaintenanceTicket["status"]) => void;
  setHallCheckItemStatus: (itemId: string, status: "OK" | "Issue", issueCost?: number, note?: string) => void;
  saveInspectionToDepositRefund: (
    bookingReceiptNo: string,
    mode: "Before Event" | "After Event"
  ) => void;
  toggleMyCheckIn: (geo?: GeoCheckPayload, overrideReason?: string) => Promise<void>;
  addAdminAlert: (input: AdminAlertInput) => void;
  decideApproval: (approvalId: string, decision: "Approved" | "Rejected") => void;
  markAllNotificationsRead: () => void;
  toggleNotificationRead: (notificationId: string) => void;
  toggleUserActive: (userId: string) => void;
  addUser: (input: {
    name: string;
    userId: string;
    role: SystemUser["role"];
    password: string;
  }) => SystemUser;
  updateUser: (
    targetUserId: string,
    updates: Partial<Pick<SystemUser, "name" | "userId" | "role" | "password" | "active" | "approvalStatus">>
  ) => void;
  decideUserApproval: (targetUserId: string, decision: "Approved" | "Rejected") => void;
  removeUser: (targetUserId: string) => void;
  updateSystemSettings: (updates: Partial<SystemSettingsState>) => void;
  resetSystemSettings: () => void;
  updateRolePermission: (
    roleName: SystemUser["role"],
    moduleName: string,
    field: "canView" | "canCreate" | "canEdit" | "canApprove",
    value: boolean
  ) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
  initialRole?: "manager" | "admin";
  initialUserId?: string;
}

function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function createLocalStore<T>(storageKey: string, initialValue: T) {
  let memoryCache: T = initialValue;
  let initialized = false;
  const listeners = new Set<() => void>();

  const getSnapshot = (): T => {
    if (typeof window === "undefined") return initialValue;
    if (initialized) return memoryCache;
    initialized = true;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        memoryCache = JSON.parse(raw) as T;
      }
    } catch {
      memoryCache = initialValue;
    }
    return memoryCache;
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        initialized = false;
        getSnapshot();
        listeners.forEach((l) => l());
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      listeners.delete(listener);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  };

  const set = (updater: T | ((prev: T) => T)) => {
    const current = getSnapshot();
    const next = typeof updater === "function" ? (updater as (prev: T) => T)(current) : updater;
    memoryCache = next;
    initialized = true;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
    }
    listeners.forEach((l) => l());
  };

  return {
    getSnapshot,
    getServerSnapshot: () => initialValue,
    subscribe,
    set,
  };
}

const INITIAL_MY_ATTENDANCE: MyAttendanceState = {
  checkedIn: false,
  checkInTime: null,
  checkOutTime: null,
  geoVerified: false,
  distanceMeters: null,
  latitude: null,
  longitude: null,
};

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsState = {
  centreName: "Haji Mohamed Yunus Valibhoy Community Centre",
  centreLocation: "Dhari, Gujarat, India",
  centrePhone: "",
  geofenceLatitude: CENTRE_COORDINATES.latitude,
  geofenceLongitude: CENTRE_COORDINATES.longitude,
  geofenceRadiusMeters: GEOFENCE_RADIUS_METERS,
  requireGpsForCheckIn: true,
  routeAllAlertsToAdmin: true,
  baseRentPerFloor: BASE_RENT_PER_FLOOR,
  acSurchargePerFloor: AC_SURCHARGE_PER_FLOOR,
  defaultSecurityDeposit: DEFAULT_SECURITY_DEPOSIT,
  maxUploadSizeMb: 5,
  requireFreeUseAdminApproval: true,
  requireBookingAdminApproval: true,
  requireUserAdminApproval: true,
  requirePaymentAdminApproval: true,
  requireCustomerEditAdminApproval: true,
  requireExpenseAdminApproval: true,
  requireRefundAdminApproval: true,
  requireRepairAdminApproval: true,
  requireAttendanceOverrideAdminApproval: true,
};

const notificationsStore = createLocalStore<NotificationRecord[]>(
  "valibhoy_admin_notifications_v1",
  INITIAL_NOTIFICATIONS
);
const auditLogsStore = createLocalStore<AuditLogEntry[]>(
  "valibhoy_audit_logs_v1",
  INITIAL_AUDIT_LOGS
);
const myAttendanceStore = createLocalStore<MyAttendanceState>(
  "valibhoy_my_attendance_v1",
  INITIAL_MY_ATTENDANCE
);
const usersStore = createLocalStore<SystemUser[]>(
  "valibhoy_system_users_v1",
  INITIAL_SYSTEM_USERS
);
const settingsStore = createLocalStore<SystemSettingsState>(
  "valibhoy_system_settings_v1",
  DEFAULT_SYSTEM_SETTINGS
);
const rolePermissionsStore = createLocalStore<RolePermissionItem[]>(
  "valibhoy_role_permissions_v1",
  INITIAL_ROLE_PERMISSIONS
);

export function DashboardProvider({
  children,
  initialRole = "manager",
  initialUserId = "manager",
}: DashboardProviderProps) {
  const [role] = useState<"manager" | "admin">(initialRole);
  const [userId] = useState<string>(initialUserId);
  const [actionItems, setActionItems] = useState<ActionItem[]>(INITIAL_ACTION_ITEMS);
  const [lastCompleted, setLastCompleted] = useState<CompletedRecord | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);
  const [applicants, setApplicants] = useState<ApplicantRecord[]>(INITIAL_APPLICANTS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [refunds, setRefunds] = useState<DepositRefundRecord[]>(INITIAL_DEPOSIT_REFUNDS);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE_TICKETS);
  const [hallCheckMode, setHallCheckMode] = useState<"Before Event" | "After Event">("After Event");
  const [hallCheckItems, setHallCheckItems] = useState<HallCheckItem[]>(INITIAL_HALL_CHECK_ITEMS);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord[]>(INITIAL_STAFF_ATTENDANCE);
  const [staffAttendanceLogs, setStaffAttendanceLogs] = useState<StaffAttendanceLogEntry[]>(INITIAL_ATTENDANCE_LOGS);
  const myAttendance = useSyncExternalStore(
    myAttendanceStore.subscribe,
    myAttendanceStore.getSnapshot,
    myAttendanceStore.getServerSnapshot
  );
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const notifications = useSyncExternalStore(
    notificationsStore.subscribe,
    notificationsStore.getSnapshot,
    notificationsStore.getServerSnapshot
  );
  const auditLogs = useSyncExternalStore(
    auditLogsStore.subscribe,
    auditLogsStore.getSnapshot,
    auditLogsStore.getServerSnapshot
  );
  const users = useSyncExternalStore(
    usersStore.subscribe,
    usersStore.getSnapshot,
    usersStore.getServerSnapshot
  );
  const rolePermissions = useSyncExternalStore(
    rolePermissionsStore.subscribe,
    rolePermissionsStore.getSnapshot,
    rolePermissionsStore.getServerSnapshot
  );
  const systemSettings = useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getSnapshot,
    settingsStore.getServerSnapshot
  );

  // Module 1 & 2: Hydrate state from backend MariaDB via /api/bootstrap when BACKEND_API_URL is active
  const refreshBootstrap = useCallback(async () => {
    try {
      const res = await fetch("/api/bootstrap", { cache: "no-store" });
      if (!res.ok) return;
      const payload = await res.json();
      if (!payload?.data) return;
      const d = payload.data;
      if (Array.isArray(d.bookings)) setBookings(d.bookings);
      if (Array.isArray(d.applicants)) setApplicants(d.applicants);
      if (Array.isArray(d.payments)) setPayments(d.payments);
      if (Array.isArray(d.expenses)) setExpenses(d.expenses);
      if (Array.isArray(d.depositRefunds)) setRefunds(d.depositRefunds);
      if (Array.isArray(d.maintenanceTickets)) setTickets(d.maintenanceTickets);
      if (Array.isArray(d.hallCheckItems) && d.hallCheckItems.length > 0) {
        setHallCheckItems(d.hallCheckItems);
      }
      if (Array.isArray(d.staffAttendance) && d.staffAttendance.length > 0) {
        setStaffAttendance(d.staffAttendance);
      }
      if (Array.isArray(d.staffAttendanceLogs) && d.staffAttendanceLogs.length > 0) {
        setStaffAttendanceLogs(d.staffAttendanceLogs);
      }
      if (Array.isArray(d.approvals)) setApprovals(d.approvals);
      if (Array.isArray(d.actionItems)) setActionItems(d.actionItems);
      if (Array.isArray(d.notifications)) notificationsStore.set(d.notifications);
      if (Array.isArray(d.auditLogs)) auditLogsStore.set(d.auditLogs);
      if (d.systemSettings) settingsStore.set((prev) => ({ ...prev, ...d.systemSettings }));
      if (Array.isArray(d.rolePermissions) && d.rolePermissions.length > 0) {
        rolePermissionsStore.set(d.rolePermissions);
      }
      if (role === "admin" && Array.isArray(d.users) && d.users.length > 0) {
        usersStore.set(d.users);
      }
    } catch {
      // Fall back to local mock state when backend is unavailable
    }
  }, [role]);

  useEffect(() => {
    const triggerRefresh = () => {
      void refreshBootstrap();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        triggerRefresh();
      }
    };

    const timer = window.setTimeout(triggerRefresh, 0);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        triggerRefresh();
      }
    }, 10000);
    window.addEventListener("focus", triggerRefresh);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.removeEventListener("focus", triggerRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshBootstrap]);

  const unreadAlertCount = notifications.filter((n) => n.unread).length;

  const appendLog = useCallback(
    (module: AuditLogEntry["module"], action: string, detail: string) => {
      const actor = role === "admin" ? "Admin" : "Manager";
      auditLogsStore.set((prev) => [
        {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timeLabel: `Today · ${getCurrentTimeLabel()}`,
          userLabel: actor,
          module,
          action,
          detail,
        },
        ...prev,
      ]);
    },
    [role]
  );

  const addAdminAlert = useCallback(
    ({
      category = "Attendance",
      title,
      detail,
      href = "/attendance",
      auditAction,
    }: AdminAlertInput) => {
      const nowLabel = getCurrentTimeLabel();
      notificationsStore.set((prev) => [
        {
          id: `not-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          category,
          title,
          detail,
          timeLabel: `Today · ${nowLabel}`,
          unread: true,
          href,
          audience: "admin",
        },
        ...prev,
      ]);
      if (auditAction) {
        appendLog(category === "Attendance" ? "Attendance" : "Booking", auditAction, detail);
      }
    },
    [appendLog]
  );

  const completeAction = useCallback((id: string) => {
    setActionItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) return prev;
      setLastCompleted({
        item: target,
        message: target.successMessage,
      });
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const undoAction = useCallback(() => {
    if (!lastCompleted) return;
    setActionItems((prev) => [lastCompleted.item, ...prev]);
    setLastCompleted(null);
  }, [lastCompleted]);

  const clearUndoNotice = useCallback(() => {
    setLastCompleted(null);
  }, []);

  const openMobileSidebar = useCallback(() => setIsMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);
  const toggleMobileSidebar = useCallback(() => setIsMobileSidebarOpen((p) => !p), []);

  const addBooking = useCallback(
    async (input: Omit<BookingRecord, "id" | "receiptNo">): Promise<BookingRecord> => {
      const maxNo = bookings.reduce((max, b) => {
        const parsed = parseInt(b.receiptNo, 10);
        return Number.isFinite(parsed) && parsed > max ? parsed : max;
      }, 1055);
      const nextNo = String(maxNo + 1);
      const isAdmin = role === "admin";
      const actor = isAdmin ? "Admin" : "Manager";
      const requiresApproval =
        !isAdmin &&
        (systemSettings.requireBookingAdminApproval ||
          (input.isFreeUse && systemSettings.requireFreeUseAdminApproval));

      const enforcedStatus: BookingStatus = requiresApproval
        ? "Awaiting approval"
        : isAdmin
        ? input.status
        : input.status === "Confirmed"
        ? "Pending"
        : input.status;

      const localFallback: BookingRecord = {
        ...input,
        status: enforcedStatus,
        id: `bk-${nextNo}`,
        receiptNo: nextNo,
        createdAtLabel: `Just now`,
        createdBy: actor,
        depositStatus: input.isFreeUse || input.deposit <= 0 ? "N/A" : "Held",
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, receiptNo: nextNo, status: enforcedStatus }),
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(payload?.message || "Could not save booking.");
      }

      if (payload?.booking) {
        const serverBooking: BookingRecord = payload.booking;
        setBookings((prev) => [serverBooking, ...prev]);
        void refreshBootstrap();
        return serverBooking;
      }

      // Offline / non-backend mock fallback
      setBookings((prev) => [localFallback, ...prev]);
      if (input.paid > 0) {
        const payRec: PaymentRecord = {
          id: `pay-${Date.now()}`,
          receiptNo: `REC-2026-${nextNo}`,
          bookingId: localFallback.id,
          bookingReceiptNo: localFallback.receiptNo,
          applicantName: localFallback.applicantName,
          eventTitle: `${localFallback.eventTitle} (${localFallback.dateLabel})`,
          type: "Advance",
          amount: input.paid,
          mode: input.paymentMode || "Cash",
          reference: `ADV-${nextNo}`,
          dateLabel: localFallback.dateLabel,
        };
        setPayments((prev) => [payRec, ...prev]);
      }

      if (requiresApproval) {
        const totalCharges = Number(input.rent || 0) + Number(input.deposit || 0);
        setApprovals((prev) => [
          {
            id: `apr-${Date.now()}`,
            type: input.isFreeUse ? "Free Hall Use" : "Booking",
            title: `${input.isFreeUse ? "Free Hall Request" : "New Booking"} — ${localFallback.eventTitle}`,
            detail: `${localFallback.applicantName} (${localFallback.hall}) on ${localFallback.dateLabel} · ${localFallback.timing}`,
            amountLabel: input.isFreeUse ? "₹0 (Free Use)" : `₹${totalCharges.toLocaleString("en-IN")}`,
            requester: actor,
            referenceNo: nextNo,
            status: "Pending",
          },
          ...prev,
        ]);
      }

      appendLog(
        "Booking",
        `Created booking #${nextNo}`,
        `${localFallback.eventTitle} for ${localFallback.applicantName} on ${localFallback.dateLabel}${requiresApproval ? " (Awaiting Admin approval)" : ""}`
      );
      return localFallback;
    },
    [bookings, role, systemSettings.requireBookingAdminApproval, systemSettings.requireFreeUseAdminApproval, appendLog, refreshBootstrap]
  );

  const updateBooking = useCallback(
    async (
      bookingId: string,
      updates: Partial<Omit<BookingRecord, "id" | "receiptNo">>
    ): Promise<BookingRecord | null> => {
      const sanitizedUpdates = { ...updates };
      const existing = bookings.find((b) => b.id === bookingId || b.receiptNo === bookingId);
      if (sanitizedUpdates.status === "Confirmed" && role !== "admin" && existing?.status !== "Confirmed") {
        sanitizedUpdates.status = existing?.status || "Awaiting approval";
      }

      const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedUpdates),
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(payload?.message || "Could not update booking.");
      }

      if (payload?.booking) {
        const serverBooking: BookingRecord = payload.booking;
        setBookings((prev) =>
          prev.map((b) => (b.id === serverBooking.id || b.receiptNo === serverBooking.receiptNo ? serverBooking : b))
        );
        void refreshBootstrap();
        return serverBooking;
      }

      let updatedRecord: BookingRecord | null = null;
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId && b.receiptNo !== bookingId) return b;
          updatedRecord = { ...b, ...sanitizedUpdates, status: sanitizedUpdates.status ?? b.status };
          return updatedRecord;
        })
      );
      appendLog(
        "Booking",
        `Edited booking #${bookingId.replace(/^bk-/, "")}`,
        updates.eventTitle
          ? `${updates.eventTitle} · ${updates.dateLabel || ""}`.trim()
          : `Updated details for booking ${bookingId}`
      );
      return updatedRecord;
    },
    [bookings, role, appendLog, refreshBootstrap]
  );

  const cancelBooking = useCallback(
    (bookingId: string, reason?: string) => {
      const trimmedReason = reason?.trim() || "Cancelled by staff";
      if (role === "admin") {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId || b.receiptNo === bookingId
              ? {
                ...b,
                status: "Cancelled",
                cancellationReason: trimmedReason,
                depositStatus: b.paid > 0 ? "Refunded" : b.depositStatus,
              }
              : b
          )
        );
        appendLog(
          "Booking",
          `Cancelled booking #${bookingId.replace(/^bk-/, "")}`,
          reason?.trim() || "Booking cancelled"
        );
      } else {
        appendLog(
          "Booking",
          `Requested cancellation for #${bookingId.replace(/^bk-/, "")}`,
          trimmedReason
        );
      }

      fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled", cancellationReason: trimmedReason }),
      })
        .then((res) => {
          if (res.ok) refreshBootstrap();
        })
        .catch(() => {});
    },
    [role, appendLog, refreshBootstrap]
  );

  const updateBookingStatus = useCallback(
    (bookingId: string, status: BookingStatus) => {
      if (status === "Confirmed" && role !== "admin") {
        return;
      }
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId || b.receiptNo === bookingId ? { ...b, status } : b))
      );
      appendLog("Booking", `Updated booking status to ${status}`, `Booking ${bookingId}`);

      fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
        .then((res) => {
          if (res.ok) refreshBootstrap();
        })
        .catch(() => {});
    },
    [role, appendLog, refreshBootstrap]
  );

  const addApplicant = useCallback(
    (input: Omit<ApplicantRecord, "id">) => {
      const nextNum = 115 + applicants.length;
      const created: ApplicantRecord = {
        ...input,
        id: `app-${Date.now()}`,
        customerCode: input.customerCode || `CU-0${nextNum}`,
        memberSince: input.memberSince || "Oct 2026",
        preferences: input.preferences || [],
      };
      setApplicants((prev) => [created, ...prev]);
      appendLog("Booking", `Added customer ${created.name}`, created.phone);

      fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
        .then(async (res) => {
          const payload = await res.json().catch(() => null);
          if (res.ok && payload?.applicant) {
            setApplicants((prev) =>
              prev.map((a) => (a.id === created.id ? payload.applicant : a))
            );
          }
        })
        .catch(() => {});

      return created;
    },
    [applicants.length, appendLog]
  );

  const updateApplicant = useCallback(
    (applicantId: string, updates: Partial<Omit<ApplicantRecord, "id">>) => {
      const requiresEditApproval =
        role !== "admin" && systemSettings.requireCustomerEditAdminApproval;
      if (!requiresEditApproval) {
        setApplicants((prev) =>
          prev.map((a) => (a.id === applicantId ? { ...a, ...updates } : a))
        );
      }
      appendLog(
        "Booking",
        requiresEditApproval ? "Requested customer edit (Admin approval)" : "Updated customer profile",
        applicantId
      );

      fetch(`/api/applicants/${encodeURIComponent(applicantId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
        .then((res) => {
          if (res.ok) refreshBootstrap();
        })
        .catch(() => {});
    },
    [role, systemSettings.requireCustomerEditAdminApproval, appendLog, refreshBootstrap]
  );

  const recordPayment = useCallback(
    (input: {
      bookingId: string;
      type: PaymentRecord["type"];
      amount: number;
      mode: PaymentMode;
      reference: string;
    }) => {
      const target = bookings.find((b) => b.id === input.bookingId);
      if (!target || input.amount <= 0) return null;

      const nextReceiptNo = `REC-2026-${1060 + payments.length}`;
      const newPay: PaymentRecord = {
        id: `pay-${Date.now()}`,
        receiptNo: nextReceiptNo,
        bookingId: target.id,
        bookingReceiptNo: target.receiptNo,
        applicantName: target.applicantName,
        eventTitle: `${target.eventTitle} (${target.dateLabel})`,
        type: input.type,
        amount: input.amount,
        mode: input.mode,
        reference: input.reference || `${input.mode.toUpperCase()}-${target.receiptNo}`,
        dateLabel: "20 Oct 2026",
      };

      setPayments((prev) => [newPay, ...prev]);
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== target.id) return b;
          const updatedPaid = b.paid + input.amount;
          return {
            ...b,
            paid: updatedPaid,
          };
        })
      );

      appendLog(
        "Payment",
        `Collected ₹${input.amount.toLocaleString("en-IN")} (${input.mode})`,
        `Receipt ${nextReceiptNo} for ${target.applicantName}`
      );
      return newPay;
    },
    [bookings, payments.length, appendLog]
  );

  const addExpense = useCallback(
    (input: Omit<ExpenseRecord, "id" | "dateLabel" | "status">) => {
      const created: ExpenseRecord = {
        ...input,
        id: `exp-${Date.now()}`,
        dateLabel: "20 Oct 2026",
        status: role === "admin" ? "Approved" : "Pending",
      };
      setExpenses((prev) => [created, ...prev]);
      appendLog("Payment", `Added expense ₹${created.amount.toLocaleString("en-IN")}`, created.title);
    },
    [role, appendLog]
  );

  const processRefund = useCallback(
    (refundId: string, deductionAmount = 0, note = "") => {
      setRefunds((prev) =>
        prev.map((r) =>
          r.id === refundId
            ? {
              ...r,
              deductionAmount,
              deductionNote: note || r.deductionNote,
              status: role === "admin" ? "Refunded" : "Sent for Approval",
            }
            : r
        )
      );
      appendLog(
        "Approval",
        role === "admin" ? "Refunded security deposit" : "Sent deposit refund for approval",
        `Refund ID ${refundId}`
      );
    },
    [role, appendLog]
  );

  const updateDepositRefund = useCallback(
    (refundId: string, updates: Partial<Omit<DepositRefundRecord, "id">>) => {
      setRefunds((prev) =>
        prev.map((r) => (r.id === refundId ? { ...r, ...updates } : r))
      );
      if (updates.status) {
        appendLog(
          "Approval",
          `Deposit refund ${updates.status.toLowerCase()}`,
          `Refund ID ${refundId}`
        );
      }
    },
    [appendLog]
  );

  const sendPaymentReminders = useCallback(
    (count: number) => {
      appendLog(
        "Payment",
        `Sent in-app overdue reminders (${count})`,
        "Pending balance alerts logged (WhatsApp/SMS in Phase 2)"
      );
    },
    [appendLog]
  );

  const addMaintenanceTicket = useCallback(
    (
      input: Omit<MaintenanceTicket, "id" | "ticketNo" | "raisedBy" | "dateLabel" | "status"> & {
        status?: MaintenanceTicket["status"];
      }
    ) => {
      const maxNo = tickets.reduce((max, t) => {
        const num = parseInt(t.ticketNo.split("-").pop() || "0", 10);
        return Number.isFinite(num) && num > max ? num : max;
      }, 112);
      const nextNo = `MC-2026-${String(maxNo + 1).padStart(4, "0")}`;
      const actor = role === "admin" ? "Admin" : "Manager";
      const ticketStatus: MaintenanceTicket["status"] = input.status || "Pending";
      const created: MaintenanceTicket = {
        ...input,
        id: `mnt-${Date.now()}`,
        ticketNo: nextNo,
        raisedBy: actor,
        dateLabel: "20 Oct 2026",
        status: ticketStatus,
      };
      setTickets((prev) => [created, ...prev]);

      if (ticketStatus !== "Draft" && created.estimatedCost > 2000) {
        setApprovals((prev) => [
          {
            id: `apr-${Date.now()}`,
            type: "Repair Cost",
            title: created.title,
            detail: `${created.location} · ${created.category}`,
            amountLabel: `₹${created.estimatedCost.toLocaleString("en-IN")}`,
            requester: actor,
            referenceNo: nextNo,
            status: "Pending",
          },
          ...prev,
        ]);
      }

      appendLog(
        "Maintenance",
        ticketStatus === "Draft" ? `Saved draft ${nextNo}` : `Raised ticket ${nextNo}`,
        created.title
      );
      return created;
    },
    [tickets, role, appendLog]
  );

  const updateTicketStatus = useCallback(
    (ticketId: string, status: MaintenanceTicket["status"]) => {
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)));
      appendLog("Maintenance", `Updated repair ticket to ${status}`, ticketId);
    },
    [appendLog]
  );

  const setHallCheckItemStatus = useCallback(
    (itemId: string, status: "OK" | "Issue", issueCost = 0, note = "") => {
      setHallCheckItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
              ...item,
              status,
              issueCost: status === "OK" ? 0 : issueCost,
              note: status === "OK" ? "" : note,
            }
            : item
        )
      );
    },
    []
  );

  const saveInspectionToDepositRefund = useCallback(
    (bookingReceiptNo: string, mode: "Before Event" | "After Event") => {
      const issues = hallCheckItems.filter((i) => i.status === "Issue");
      const totalDeduction = issues.reduce((sum, i) => sum + (i.issueCost || 0), 0);
      const deductionItems = issues.map((i) => ({
        id: `ded-${i.id}`,
        item: i.note ? `${i.label} (${i.note})` : i.label,
        location: "Community Hall",
        photosCount: 1,
        amount: i.issueCost || 0,
      }));
      const deductionNote =
        issues.length > 0
          ? issues.map((i) => i.note || i.label).join(", ")
          : "Hall checked — zero damage";

      setBookings((prev) =>
        prev.map((b) =>
          b.receiptNo === bookingReceiptNo || b.id === bookingReceiptNo
            ? {
              ...b,
              preInspectionDone: mode === "Before Event" ? true : b.preInspectionDone,
              postInspectionDone: mode === "After Event" ? true : b.postInspectionDone,
              depositStatus:
                mode === "After Event" ? "Ready to Refund" : b.depositStatus,
            }
            : b
        )
      );

      if (mode === "After Event") {
        setRefunds((prev) => {
          const exists = prev.some((r) => r.bookingReceiptNo === bookingReceiptNo);
          if (exists) {
            return prev.map((r) =>
              r.bookingReceiptNo === bookingReceiptNo
                ? {
                  ...r,
                  deductionAmount: totalDeduction,
                  deductionNote,
                  deductionItems,
                  inspectionRef: `INS-2026-${bookingReceiptNo}-B · ${issues.length} ${issues.length === 1 ? "issue" : "issues"
                    }`,
                  status: r.status === "Refunded" ? "Refunded" : "Ready to Refund",
                }
                : r
            );
          }

          const targetBooking = bookings.find(
            (b) => b.receiptNo === bookingReceiptNo || b.id === bookingReceiptNo
          );
          if (!targetBooking) return prev;
          return [
            {
              id: `ref-${Date.now()}`,
              bookingReceiptNo: targetBooking.receiptNo,
              applicantName: targetBooking.applicantName,
              eventTitle: targetBooking.eventTitle,
              eventDate: targetBooking.dateLabel,
              heldAmount: targetBooking.deposit,
              deductionAmount: totalDeduction,
              deductionNote,
              refundMode: targetBooking.paymentMode || "UPI",
              status: "Ready to Refund",
              collectedLabel: `₹${targetBooking.deposit.toLocaleString("en-IN")} · ${targetBooking.paymentMode || "UPI"
                }`,
              inspectionRef: `INS-2026-${targetBooking.receiptNo}-B · ${issues.length} ${issues.length === 1 ? "issue" : "issues"
                }`,
              deductionItems,
            },
            ...prev,
          ];
        });
      }

      appendLog(
        "Maintenance",
        `Saved ${mode} inspection for #${bookingReceiptNo}`,
        `${issues.length} issue(s) · Total deduction ₹${totalDeduction.toLocaleString("en-IN")}`
      );
    },
    [hallCheckItems, bookings, appendLog]
  );

  const toggleMyCheckIn = useCallback(
    async (geo?: GeoCheckPayload, overrideReason?: string) => {
      const now = getCurrentTimeLabel();
      const userObj = users.find((u) => u.userId === userId);
      const actor = userObj?.name || (role === "admin" ? "Trustee / Admin" : "Centre Manager");
      const checkingIn = !myAttendance.checkedIn;
      const todayISO = getTodayISO();

      myAttendanceStore.set((prev) => {
        if (!prev.checkedIn) {
          return {
            checkedIn: true,
            checkInTime: now,
            checkOutTime: null,
            geoVerified: geo?.withinFence ?? false,
            distanceMeters: geo?.distanceMeters ?? null,
            latitude: geo?.latitude ?? null,
            longitude: geo?.longitude ?? null,
          };
        }
        return {
          checkedIn: false,
          checkInTime: prev.checkInTime,
          checkOutTime: now,
          geoVerified: geo?.withinFence ?? prev.geoVerified,
          distanceMeters: geo?.distanceMeters ?? prev.distanceMeters,
          latitude: geo?.latitude ?? prev.latitude,
          longitude: geo?.longitude ?? prev.longitude,
        };
      });

      // Update staffAttendance roster immediately in UI
      setStaffAttendance((prev) => {
        const idx = prev.findIndex(
          (s) => s.name.toLowerCase() === actor.toLowerCase() || s.id === `st-${userId}`
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            checkInTime: checkingIn ? now : updated[idx].checkInTime,
            checkOutTime: checkingIn ? "—" : now,
            geoVerified: geo?.withinFence ?? updated[idx].geoVerified,
            status: "Present",
          };
          return updated;
        }
        return [
          {
            id: `st-${userId || Date.now()}`,
            name: actor,
            roleTitle: role === "admin" ? "Trustee / Admin" : "Centre Manager",
            checkInTime: checkingIn ? now : "—",
            checkOutTime: checkingIn ? "—" : now,
            geoVerified: geo?.withinFence ?? false,
            status: "Present",
            presentDays: 1,
            lateDays: 0,
            absentDays: 0,
          },
          ...prev,
        ];
      });

      // Prepend to staffAttendanceLogs immediately so Admin calendar/logs table displays it
      if (checkingIn) {
        setStaffAttendanceLogs((prev) => [
          {
            id: `attlog-${Date.now()}`,
            staffId: `st-${userId}`,
            dateISO: todayISO,
            name: actor,
            roleTitle: role === "admin" ? "Trustee / Admin" : "Centre Manager",
            checkInTime: now,
            checkOutTime: "—",
            geoVerified: geo?.withinFence ?? false,
            status: "Present",
          },
          ...prev,
        ]);
      } else {
        setStaffAttendanceLogs((prev) =>
          prev.map((log) =>
            log.name.toLowerCase() === actor.toLowerCase() &&
            log.dateISO === todayISO &&
            log.checkOutTime === "—"
              ? { ...log, checkOutTime: now }
              : log
          )
        );
      }

      const distLabel =
        geo && typeof geo.distanceMeters === "number"
          ? `${formatDistanceMeters(geo.distanceMeters)} from centre`
          : "GPS verified";
      const coordLabel =
        geo && typeof geo.latitude === "number" && typeof geo.longitude === "number"
          ? ` (${geo.latitude.toFixed(5)}, ${geo.longitude.toFixed(5)})`
          : "";

      addAdminAlert({
        category: "Attendance",
        title: `${actor} ${checkingIn ? "checked in" : "checked out"} · ${distLabel}`,
        detail: `${actor} completed geo-verified ${checkingIn ? "check-in" : "check-out"} at ${now} (${distLabel}${coordLabel}).`,
        href: "/attendance",
        auditAction: `Geo-verified ${checkingIn ? "check-in" : "check-out"}`,
      });

      // Synchronize with backend API
      try {
        const endpoint = checkingIn ? "/api/attendance/check-in" : "/api/attendance/check-out";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: geo?.latitude,
            longitude: geo?.longitude,
            dateISO: todayISO,
            overrideReason,
          }),
        });
        if (res.ok) {
          void refreshBootstrap();
        }
      } catch (err) {
        console.error("Attendance API sync error:", err);
      }
    },
    [myAttendance.checkedIn, role, userId, users, addAdminAlert, refreshBootstrap]
  );

  const decideApproval = useCallback(
    (approvalId: string, decision: "Approved" | "Rejected") => {
      if (role !== "admin") return;
      const target = approvals.find((a) => a.id === approvalId);
      setApprovals((prev) =>
        prev.map((a) => (a.id === approvalId ? { ...a, status: decision } : a))
      );
      if (target) {
        if (target.type === "Booking" || target.type === "Free Hall Use") {
          const nextStatus: BookingStatus = decision === "Approved" ? "Confirmed" : "Cancelled";
          setBookings((prev) =>
            prev.map((b) =>
              b.receiptNo === target.referenceNo
                ? {
                    ...b,
                    status: nextStatus,
                    cancellationReason: decision === "Rejected" ? "Rejected by Admin" : b.cancellationReason,
                  }
                : b
            )
          );
        } else if (target.type === "Booking Cancellation" && decision === "Approved") {
          setBookings((prev) =>
            prev.map((b) =>
              b.receiptNo === target.referenceNo ? { ...b, status: "Cancelled" } : b
            )
          );
        }
      }
      appendLog("Approval", `${decision} request`, target?.title || approvalId);

      fetch(`/api/approvals/${encodeURIComponent(approvalId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision }),
      })
        .then((res) => {
          if (res.ok) refreshBootstrap();
        })
        .catch(() => {});
    },
    [role, approvals, appendLog, refreshBootstrap]
  );

  const markAllNotificationsRead = useCallback(() => {
    notificationsStore.set((prev) => prev.map((n) => ({ ...n, unread: false })));
    fetch("/api/notifications/read-all", { method: "PATCH" }).catch(() => {});
  }, []);

  const toggleNotificationRead = useCallback((notificationId: string) => {
    const current = notificationsStore.getSnapshot().find((n) => n.id === notificationId);
    const nextUnread = current ? !current.unread : false;
    notificationsStore.set((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, unread: nextUnread } : n))
    );
    fetch(`/api/notifications/${encodeURIComponent(notificationId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unread: nextUnread }),
    }).catch(() => {});
  }, []);

  const toggleUserActive = useCallback(
    (targetUserId: string) => {
      const target = usersStore.getSnapshot().find((u) => u.id === targetUserId);
      const nextActive = target ? !target.active : true;
      usersStore.set((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, active: nextActive } : u))
      );
      appendLog("User", "Changed user active status", targetUserId);

      fetch(`/api/users/${encodeURIComponent(targetUserId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      }).catch(() => {});
    },
    [appendLog]
  );

  const addUser = useCallback(
    (input: {
      name: string;
      userId: string;
      role: SystemUser["role"];
      password: string;
    }): SystemUser => {
      const created: SystemUser = {
        id: `u-${Date.now()}`,
        userId: input.userId.trim(),
        name: input.name.trim(),
        role: input.role,
        password: input.password,
        lastLogin: "Not signed in yet",
        active: true,
        approvalStatus: "Approved",
      };
      usersStore.set((prev) => [created, ...prev]);
      appendLog("User", `Added ${created.role} account`, `${created.name} (${created.userId})`);

      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((payload) => {
          if (payload?.user) {
            usersStore.set((prev) =>
              prev.map((u) => (u.id === created.id ? payload.user : u))
            );
          }
        })
        .catch(() => {});

      return created;
    },
    [appendLog]
  );

  const updateUser = useCallback(
    (
      targetUserId: string,
      updates: Partial<
        Pick<SystemUser, "name" | "userId" | "role" | "password" | "active" | "approvalStatus">
      >
    ) => {
      usersStore.set((prev) =>
        prev.map((u) => {
          if (u.id !== targetUserId) return u;
          return {
            ...u,
            ...updates,
            name: updates.name !== undefined ? updates.name.trim() : u.name,
            userId: updates.userId !== undefined ? updates.userId.trim() : u.userId,
          };
        })
      );
      const changedLabel = updates.password ? "Updated user & password" : "Updated user details";
      appendLog(
        "User",
        changedLabel,
        `${updates.name || targetUserId}${updates.role ? ` · ${updates.role}` : ""}`
      );

      fetch(`/api/users/${encodeURIComponent(targetUserId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).catch(() => {});
    },
    [appendLog]
  );

  const decideUserApproval = useCallback(
    (targetUserId: string, decision: "Approved" | "Rejected") => {
      const nextActive = decision === "Approved";
      usersStore.set((prev) =>
        prev.map((u) =>
          u.id === targetUserId ? { ...u, approvalStatus: decision, active: nextActive } : u
        )
      );
      appendLog("Approval", `${decision} user access`, targetUserId);

      fetch(`/api/users/${encodeURIComponent(targetUserId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus: decision, active: nextActive }),
      }).catch(() => {});
    },
    [appendLog]
  );

  const removeUser = useCallback(
    (targetUserId: string) => {
      const target = usersStore.getSnapshot().find((u) => u.id === targetUserId);
      usersStore.set((prev) => prev.filter((u) => u.id !== targetUserId));
      appendLog(
        "User",
        "Removed user account",
        target ? `${target.name} (${target.userId})` : targetUserId
      );

      fetch(`/api/users/${encodeURIComponent(targetUserId)}`, {
        method: "DELETE",
      }).catch(() => {});
    },
    [appendLog]
  );

  const updateSystemSettings = useCallback(
    (updates: Partial<SystemSettingsState>) => {
      const nextState = { ...settingsStore.getSnapshot(), ...updates };
      settingsStore.set(nextState);
      appendLog(
        "Settings",
        "Updated admin settings",
        `Geo-fence ${nextState.geofenceRadiusMeters} m`
      );

      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextState),
      }).catch(() => {});
    },
    [appendLog]
  );

  const resetSystemSettings = useCallback(() => {
    settingsStore.set(DEFAULT_SYSTEM_SETTINGS);
    appendLog("Settings", "Reset settings to defaults", "Restored centre & pricing defaults");

    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DEFAULT_SYSTEM_SETTINGS),
    }).catch(() => {});
  }, [appendLog]);

  const updateRolePermission = useCallback(
    (
      roleName: SystemUser["role"],
      moduleName: string,
      field: "canView" | "canCreate" | "canEdit" | "canApprove",
      value: boolean
    ) => {
      if (roleName === "Admin") return;
      let updatedSnapshot: RolePermissionItem[] = [];
      rolePermissionsStore.set((prev) => {
        const exists = prev.some((p) => p.role === roleName && p.module === moduleName);
        updatedSnapshot = exists
          ? prev.map((p) =>
              p.role === roleName && p.module === moduleName ? { ...p, [field]: value } : p
            )
          : [
              ...prev,
              {
                id: `rp-${roleName.toLowerCase()}-${moduleName.toLowerCase().replace(/\s+/g, "-")}`,
                role: roleName,
                module: moduleName,
                canView: field === "canView" ? value : false,
                canCreate: field === "canCreate" ? value : false,
                canEdit: field === "canEdit" ? value : false,
                canApprove: field === "canApprove" ? value : false,
              },
            ];
        return updatedSnapshot;
      });
      appendLog("Settings", `Updated ${roleName} permissions`, `${moduleName} (${field}=${value})`);

      fetch("/api/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: updatedSnapshot }),
      }).catch(() => {});
    },
    [appendLog]
  );

  return (
    <DashboardContext.Provider
      value={{
        role,
        userId,
        actionItems,
        actionCount: actionItems.length,
        unreadAlertCount,
        lastCompleted,
        completeAction,
        undoAction,
        clearUndoNotice,
        isMobileSidebarOpen,
        openMobileSidebar,
        closeMobileSidebar,
        toggleMobileSidebar,
        bookings,
        applicants,
        payments,
        expenses,
        refunds,
        tickets,
        hallCheckMode,
        setHallCheckMode,
        hallCheckItems,
        staffAttendance,
        staffAttendanceLogs,
        myAttendance,
        approvals,
        notifications,
        auditLogs,
        users,
        rolePermissions,
        systemSettings,
        addBooking,
        updateBooking,
        cancelBooking,
        updateBookingStatus,
        addApplicant,
        updateApplicant,
        recordPayment,
        addExpense,
        processRefund,
        updateDepositRefund,
        sendPaymentReminders,
        addMaintenanceTicket,
        updateTicketStatus,
        setHallCheckItemStatus,
        saveInspectionToDepositRefund,
        toggleMyCheckIn,
        addAdminAlert,
        decideApproval,
        markAllNotificationsRead,
        toggleNotificationRead,
        toggleUserActive,
        addUser,
        updateUser,
        decideUserApproval,
        removeUser,
        updateSystemSettings,
        resetSystemSettings,
        updateRolePermission,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

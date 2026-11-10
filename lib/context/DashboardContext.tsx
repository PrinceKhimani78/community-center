"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
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
  INITIAL_AUDIT_LOGS,
  INITIAL_BOOKINGS,
  INITIAL_DEPOSIT_REFUNDS,
  INITIAL_EXPENSES,
  INITIAL_HALL_CHECK_ITEMS,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_STAFF_ATTENDANCE,
  INITIAL_SYSTEM_USERS,
  MaintenanceTicket,
  NotificationRecord,
  PaymentMode,
  PaymentRecord,
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
}

interface DashboardContextType {
  role: "manager" | "admin";
  userId: string;
  actionItems: ActionItem[];
  actionCount: number;
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
  myAttendance: MyAttendanceState;
  approvals: ApprovalItem[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogEntry[];
  users: SystemUser[];

  // Actions
  addBooking: (booking: Omit<BookingRecord, "id" | "receiptNo">) => BookingRecord;
  updateBooking: (
    bookingId: string,
    updates: Partial<Omit<BookingRecord, "id" | "receiptNo">>
  ) => BookingRecord | null;
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
  toggleMyCheckIn: () => void;
  decideApproval: (approvalId: string, decision: "Approved" | "Rejected") => void;
  markAllNotificationsRead: () => void;
  toggleNotificationRead: (notificationId: string) => void;
  toggleUserActive: (userId: string) => void;
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
  const [staffAttendance] = useState<StaffAttendanceRecord[]>(INITIAL_STAFF_ATTENDANCE);
  const [myAttendance, setMyAttendance] = useState<MyAttendanceState>({
    checkedIn: false,
    checkInTime: null,
    checkOutTime: null,
  });
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [notifications, setNotifications] = useState<NotificationRecord[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_SYSTEM_USERS);

  const appendLog = useCallback(
    (module: AuditLogEntry["module"], action: string, detail: string) => {
      const actor = role === "admin" ? "Admin" : "Manager";
      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
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
    (input: Omit<BookingRecord, "id" | "receiptNo">) => {
      const maxNo = bookings.reduce((max, b) => {
        const parsed = parseInt(b.receiptNo, 10);
        return Number.isFinite(parsed) && parsed > max ? parsed : max;
      }, 1055);
      const nextNo = String(maxNo + 1);
      const actor = role === "admin" ? "Admin" : "Manager";
      const created: BookingRecord = {
        ...input,
        id: `bk-${nextNo}`,
        receiptNo: nextNo,
        createdAtLabel: `20 Oct 2026, ${getCurrentTimeLabel()}`,
        createdBy: actor,
        depositStatus: input.isFreeUse ? "N/A" : "Held",
      };
      setBookings((prev) => [created, ...prev]);

      if (input.paid > 0) {
        const payRec: PaymentRecord = {
          id: `pay-${Date.now()}`,
          receiptNo: `REC-2026-${nextNo}`,
          bookingId: created.id,
          bookingReceiptNo: created.receiptNo,
          applicantName: created.applicantName,
          eventTitle: `${created.eventTitle} (${created.dateLabel})`,
          type: "Advance",
          amount: input.paid,
          mode: input.paymentMode || "Cash",
          reference: `ADV-${nextNo}`,
          dateLabel: "20 Oct 2026",
        };
        setPayments((prev) => [payRec, ...prev]);
      }

      appendLog(
        "Booking",
        `Created booking #${nextNo}`,
        `${created.eventTitle} for ${created.applicantName} on ${created.dateLabel}`
      );
      return created;
    },
    [bookings, role, appendLog]
  );

  const updateBooking = useCallback(
    (bookingId: string, updates: Partial<Omit<BookingRecord, "id" | "receiptNo">>) => {
      let updatedRecord: BookingRecord | null = null;
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId && b.receiptNo !== bookingId) return b;
          updatedRecord = { ...b, ...updates };
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
    [appendLog]
  );

  const cancelBooking = useCallback(
    (bookingId: string, reason?: string) => {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId || b.receiptNo === bookingId
            ? {
                ...b,
                status: "Cancelled",
                cancellationReason: reason?.trim() || "Cancelled by staff",
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
    },
    [appendLog]
  );

  const updateBookingStatus = useCallback(
    (bookingId: string, status: BookingStatus) => {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId || b.receiptNo === bookingId ? { ...b, status } : b))
      );
      appendLog("Booking", `Updated booking status to ${status}`, `Booking ${bookingId}`);
    },
    [appendLog]
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
      return created;
    },
    [applicants.length, appendLog]
  );

  const updateApplicant = useCallback(
    (applicantId: string, updates: Partial<Omit<ApplicantRecord, "id">>) => {
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicantId ? { ...a, ...updates } : a))
      );
      appendLog("Booking", "Updated customer profile", applicantId);
    },
    [appendLog]
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
          const totalDue = b.rent + b.deposit;
          return {
            ...b,
            paid: updatedPaid,
            status: updatedPaid >= totalDue && b.status === "Pending" ? "Confirmed" : b.status,
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
                    inspectionRef: `INS-2026-${bookingReceiptNo}-B · ${issues.length} ${
                      issues.length === 1 ? "issue" : "issues"
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
              collectedLabel: `₹${targetBooking.deposit.toLocaleString("en-IN")} · ${
                targetBooking.paymentMode || "UPI"
              }`,
              inspectionRef: `INS-2026-${targetBooking.receiptNo}-B · ${issues.length} ${
                issues.length === 1 ? "issue" : "issues"
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

  const toggleMyCheckIn = useCallback(() => {
    const now = getCurrentTimeLabel();
    setMyAttendance((prev) => {
      if (!prev.checkedIn) {
        return { checkedIn: true, checkInTime: now, checkOutTime: null };
      }
      return { checkedIn: false, checkInTime: prev.checkInTime, checkOutTime: now };
    });
  }, []);

  const decideApproval = useCallback(
    (approvalId: string, decision: "Approved" | "Rejected") => {
      setApprovals((prev) =>
        prev.map((a) => (a.id === approvalId ? { ...a, status: decision } : a))
      );
      appendLog("Approval", `${decision} request`, approvalId);
    },
    [appendLog]
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const toggleNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, unread: !n.unread } : n))
    );
  }, []);

  const toggleUserActive = useCallback(
    (targetUserId: string) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, active: !u.active } : u))
      );
      appendLog("User", "Changed user active status", targetUserId);
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
        myAttendance,
        approvals,
        notifications,
        auditLogs,
        users,
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
        decideApproval,
        markAllNotificationsRead,
        toggleNotificationRead,
        toggleUserActive,
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

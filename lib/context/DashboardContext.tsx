"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ActionItem, INITIAL_ACTION_ITEMS } from "@/lib/mock/dashboard";

interface CompletedRecord {
  item: ActionItem;
  message: string;
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
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
  initialRole?: "manager" | "admin";
  initialUserId?: string;
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

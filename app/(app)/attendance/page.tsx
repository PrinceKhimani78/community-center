"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Crosshair,
  Download,
  ExternalLink,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { INITIAL_ATTENDANCE_LOGS, type StaffAttendanceLogEntry } from "@/lib/mock/dashboard";
import PageShell from "@/components/common/PageShell";
import StatusBadge from "@/components/common/StatusBadge";
import { formatShortDate, getTodayISO } from "@/lib/utils/bookings";
import {
  CENTRE_COORDINATES,
  GEOFENCE_RADIUS_METERS,
  calculateBearingRadians,
  calculateDistanceMeters,
  formatDistanceMeters,
  isWithinGeofence,
} from "@/lib/utils/geofence";

type AttendanceFilterMode = "date" | "month" | "range" | "all";
type StatusFilter = "All" | "Present" | "Late" | "Absent";
type AdminViewTab = "register" | "my";
type GeoStatus = "checking" | "verified" | "outside" | "denied" | "unavailable";

interface GeoReadingState {
  status: GeoStatus;
  distanceMeters: number | null;
  accuracyMeters: number | null;
  latitude: number | null;
  longitude: number | null;
  bearingRad: number;
  message: string;
}

interface GeoDialogState {
  title: string;
  message: string;
  detail?: string;
}

function readBrowserGeolocation(
  targetLat: number = CENTRE_COORDINATES.latitude,
  targetLon: number = CENTRE_COORDINATES.longitude,
  radiusMeters: number = GEOFENCE_RADIUS_METERS
): Promise<GeoReadingState> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      resolve({
        status: "unavailable",
        distanceMeters: null,
        accuracyMeters: null,
        latitude: null,
        longitude: null,
        bearingRad: 0.78,
        message: "Browser GPS is unavailable on this device.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const accuracyMeters = Number.isFinite(pos.coords.accuracy)
          ? Math.round(pos.coords.accuracy)
          : null;
        const distanceMeters = calculateDistanceMeters(lat, lon, targetLat, targetLon);
        const bearingRad = calculateBearingRadians(targetLat, targetLon, lat, lon);
        const verified = isWithinGeofence(distanceMeters, radiusMeters);
        resolve({
          status: verified ? "verified" : "outside",
          distanceMeters,
          accuracyMeters,
          latitude: lat,
          longitude: lon,
          bearingRad,
          message: verified
            ? `Location verified · ${formatDistanceMeters(distanceMeters)} from centre`
            : `Outside geo-fence · ${formatDistanceMeters(distanceMeters)} from centre (limit ${radiusMeters} m)`,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        resolve({
          status: denied ? "denied" : "unavailable",
          distanceMeters: null,
          accuracyMeters: null,
          latitude: null,
          longitude: null,
          bearingRad: 0.78,
          message: denied
            ? "Location permission denied — enable GPS to check in."
            : "Unable to get GPS fix — move outdoors and retry.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 8000,
      }
    );
  });
}

function exportAttendanceCsv(rows: StaffAttendanceLogEntry[]) {
  const csvRows = [
    ["Date", "Staff Name", "Role", "Check In", "Check Out", "Geo Verified", "Status"],
    ...rows.map((r) => [
      formatShortDate(r.dateISO),
      r.name,
      r.roleTitle,
      r.checkInTime,
      r.checkOutTime,
      r.geoVerified ? "Verified" : "No",
      r.status,
    ]),
  ];
  const csv = csvRows
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "attendance-export.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function AttendancePage() {
  const {
    role,
    myAttendance,
    toggleMyCheckIn,
    staffAttendance,
    staffAttendanceLogs,
    notifications,
    addAdminAlert,
    systemSettings,
  } = useDashboard();
  const isAdmin = role === "admin";
  const actorLabel = isAdmin ? "Admin" : "Manager";
  const targetLat = systemSettings.geofenceLatitude;
  const targetLon = systemSettings.geofenceLongitude;
  const radiusMeters = systemSettings.geofenceRadiusMeters;

  const todayISO = getTodayISO();
  const currentMonth = todayISO.slice(0, 7);

  const [clockText, setClockText] = useState("01:38 PM");
  const [adminTab, setAdminTab] = useState<AdminViewTab>("register");
  const [geoReading, setGeoReading] = useState<GeoReadingState>({
    status: "checking",
    distanceMeters: null,
    accuracyMeters: null,
    latitude: null,
    longitude: null,
    bearingRad: 0.78,
    message: "Checking live GPS location...",
  });
  const [isVerifyingAction, setIsVerifyingAction] = useState(false);
  const [geoDialog, setGeoDialog] = useState<GeoDialogState | null>(null);

  // Admin calendar & search filters
  const [filterMode, setFilterMode] = useState<AttendanceFilterMode>("date");
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [fromDate, setFromDate] = useState(todayISO);
  const [toDate, setToDate] = useState(todayISO);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const updateClock = () => {
      setClockText(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    const timer = setInterval(updateClock, 15000);
    const immediate = setTimeout(updateClock, 0);
    return () => {
      clearInterval(timer);
      clearTimeout(immediate);
    };
  }, []);

  useEffect(() => {
    let active = true;
    readBrowserGeolocation(targetLat, targetLon, radiusMeters).then((reading) => {
      if (active) setGeoReading(reading);
    });
    return () => {
      active = false;
    };
  }, [targetLat, targetLon, radiusMeters]);

  const handleRefreshGps = useCallback(async () => {
    setGeoReading((prev) => ({
      ...prev,
      status: "checking",
      message: "Refreshing GPS location...",
    }));
    const reading = await readBrowserGeolocation(targetLat, targetLon, radiusMeters);
    setGeoReading(reading);
  }, [targetLat, targetLon, radiusMeters]);

  const handleCheckInOut = useCallback(async () => {
    const actionVerb = myAttendance.checkedIn ? "check out" : "check in";
    setIsVerifyingAction(true);
    setGeoReading((prev) => ({
      ...prev,
      status: "checking",
      message: `Verifying GPS before ${actionVerb}...`,
    }));

    const reading = await readBrowserGeolocation(targetLat, targetLon, radiusMeters);
    setGeoReading(reading);
    setIsVerifyingAction(false);

    if (!systemSettings.requireGpsForCheckIn) {
      toggleMyCheckIn(
        reading.distanceMeters !== null && reading.latitude !== null && reading.longitude !== null
          ? {
              distanceMeters: reading.distanceMeters,
              latitude: reading.latitude,
              longitude: reading.longitude,
              withinFence: reading.status === "verified",
            }
          : undefined
      );
      return;
    }

    if (
      reading.status === "verified" &&
      reading.distanceMeters !== null &&
      reading.latitude !== null &&
      reading.longitude !== null
    ) {
      toggleMyCheckIn({
        distanceMeters: reading.distanceMeters,
        latitude: reading.latitude,
        longitude: reading.longitude,
        withinFence: true,
      });
      return;
    }

    if (
      reading.status === "outside" &&
      reading.distanceMeters !== null &&
      reading.latitude !== null &&
      reading.longitude !== null
    ) {
      const distText = formatDistanceMeters(reading.distanceMeters);
      addAdminAlert({
        category: "Attendance",
        title: `Geo-fence alert — ${actorLabel} outside ${radiusMeters} m radius`,
        detail: `${actorLabel} attempted to ${actionVerb} ${distText} away from centre (limit ${radiusMeters} m) · GPS ${reading.latitude.toFixed(5)}, ${reading.longitude.toFixed(5)}.`,
        href: "/attendance",
        auditAction: `Blocked out-of-fence ${actionVerb}`,
      });
      setGeoDialog({
        title: `Outside Geo-Fence (${radiusMeters} m Limit)`,
        message: `You are ${distText} from ${systemSettings.centreName}. Move within ${radiusMeters} m of the centre to ${actionVerb}.`,
        detail: "This blocked attempt has been alerted to Admin.",
      });
      return;
    }

    addAdminAlert({
      category: "Attendance",
      title: `GPS alert — ${actorLabel} ${actionVerb} blocked`,
      detail: `${actorLabel} attempted to ${actionVerb}, but ${reading.message}`,
      href: "/attendance",
      auditAction: `Blocked ${actionVerb} (${reading.status})`,
    });
    setGeoDialog({
      title: "GPS Location Required",
      message: reading.message,
      detail: "Please enable location permission on this device and retry. Admin has been alerted.",
    });
  }, [
    myAttendance.checkedIn,
    toggleMyCheckIn,
    addAdminAlert,
    actorLabel,
    targetLat,
    targetLon,
    radiusMeters,
    systemSettings.requireGpsForCheckIn,
    systemSettings.centreName,
  ]);

  // Merge live context updates on today's date with the October log dataset
  const allAttendanceLogs = useMemo<StaffAttendanceLogEntry[]>(() => {
    const combined = [...staffAttendanceLogs];
    const seenIds = new Set(combined.map((c) => c.id));
    for (const init of INITIAL_ATTENDANCE_LOGS) {
      if (!seenIds.has(init.id)) {
        combined.push(init);
      }
    }
    return combined;
  }, [staffAttendanceLogs]);

  // Date/Calendar + Search filtered logs for Admin
  const calendarFilteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allAttendanceLogs.filter((entry) => {
      let matchesDate = true;
      if (filterMode === "date") {
        matchesDate = !selectedDate || entry.dateISO === selectedDate;
      } else if (filterMode === "month") {
        matchesDate = !selectedMonth || entry.dateISO.startsWith(selectedMonth);
      } else if (filterMode === "range") {
        const afterFrom = !fromDate || entry.dateISO >= fromDate;
        const beforeTo = !toDate || entry.dateISO <= toDate;
        matchesDate = afterFrom && beforeTo;
      }

      const matchesQuery =
        !q ||
        entry.name.toLowerCase().includes(q) ||
        entry.roleTitle.toLowerCase().includes(q) ||
        formatShortDate(entry.dateISO).toLowerCase().includes(q);

      return matchesDate && matchesQuery;
    });
  }, [allAttendanceLogs, filterMode, selectedDate, selectedMonth, fromDate, toDate, searchQuery]);

  const adminStatusCounts = useMemo(() => {
    return {
      All: calendarFilteredLogs.length,
      Present: calendarFilteredLogs.filter((e) => e.status === "Present").length,
      Late: calendarFilteredLogs.filter((e) => e.status === "Late").length,
      Absent: calendarFilteredLogs.filter((e) => e.status === "Absent").length,
    };
  }, [calendarFilteredLogs]);

  const adminVisibleLogs = useMemo(() => {
    if (statusFilter === "All") return calendarFilteredLogs;
    return calendarFilteredLogs.filter((e) => e.status === statusFilter);
  }, [calendarFilteredLogs, statusFilter]);

  const adminMetrics = useMemo(() => {
    const uniqueDays = new Set(calendarFilteredLogs.map((e) => e.dateISO)).size;
    const totalRecords = calendarFilteredLogs.length;
    const attended = adminStatusCounts.Present + adminStatusCounts.Late;
    const avgPct = totalRecords > 0 ? Math.round((attended / totalRecords) * 100) : 0;
    return {
      workingDays: uniqueDays,
      avgPct,
      lateCount: adminStatusCounts.Late,
    };
  }, [calendarFilteredLogs, adminStatusCounts]);

  const attendanceAdminAlerts = useMemo(
    () => notifications.filter((n) => n.category === "Attendance"),
    [notifications]
  );

  const periodLabel = useMemo(() => {
    if (filterMode === "date" && selectedDate) return formatShortDate(selectedDate);
    if (filterMode === "month" && selectedMonth) {
      const [y, m] = selectedMonth.split("-");
      const dt = new Date(Number(y), Number(m) - 1, 1);
      return Number.isNaN(dt.getTime())
        ? selectedMonth
        : dt.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    }
    if (filterMode === "range") {
      if (fromDate && toDate) return `${formatShortDate(fromDate)} – ${formatShortDate(toDate)}`;
      if (fromDate) return `From ${formatShortDate(fromDate)}`;
      if (toDate) return `Until ${formatShortDate(toDate)}`;
    }
    return "All Recorded Days";
  }, [filterMode, selectedDate, selectedMonth, fromDate, toDate]);

  // Manager / Today's snapshot counts
  const todayCounts = useMemo(() => {
    const present = staffAttendance.filter((s) => s.status === "Present").length;
    const late = staffAttendance.filter((s) => s.status === "Late").length;
    const absent = staffAttendance.filter((s) => s.status === "Absent").length;
    const totalStaff = staffAttendance.length;
    const avgPct = totalStaff > 0 ? Math.round(((present + late) / totalStaff) * 100) : 0;
    const totalLateMonth = staffAttendance.reduce((sum, s) => sum + (s.lateDays || 0), 0);
    return { present, late, absent, avgPct, totalLateMonth };
  }, [staffAttendance]);

  // Visual dot position inside/outside the 64px radar radius
  const radarDotOffset = useMemo(() => {
    if (geoReading.distanceMeters === null) {
      return { x: 14, y: 14 };
    }
    const maxVisualRadius = 60;
    const fenceCircleRadius = 56;
    const normalized =
      geoReading.distanceMeters <= radiusMeters
        ? (geoReading.distanceMeters / Math.max(1, radiusMeters)) * (fenceCircleRadius - 12)
        : fenceCircleRadius +
          Math.min(
            maxVisualRadius - fenceCircleRadius + 16,
            8 + Math.log10(Math.max(1, geoReading.distanceMeters - radiusMeters)) * 6
          );
    return {
      x: Math.round(Math.sin(geoReading.bearingRad) * normalized),
      y: Math.round(-Math.cos(geoReading.bearingRad) * normalized),
    };
  }, [geoReading.distanceMeters, geoReading.bearingRad, radiusMeters]);

  const isGeoVerified = geoReading.status === "verified";
  const isGeoChecking = geoReading.status === "checking";

  const statusBannerStyle = isGeoVerified
    ? "bg-[#ECFDF5] border-[#BBF7D0] text-[#15803D]"
    : isGeoChecking
      ? "bg-[#FEF9C3]/70 border-[#FDE047] text-[#854D0E]"
      : "bg-[#FEF2F2] border-[#FECACA] text-[#C62828]";

  const myAttendanceCard = (
    <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 flex flex-col justify-between gap-4 shadow-2xs">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>My Attendance</h2>
          <span className="text-[12.5px] font-medium text-[#5B6474]">
            {radiusMeters} m Geo-fence
          </span>
        </div>

        <div className="notranslate text-[34px] font-extrabold text-[#0B2A5B] tracking-tight leading-none">
          {clockText}
        </div>

        {/* Live Geo-fence Radar Preview */}
        <div className="relative h-48 rounded-2xl bg-[#EEF2EB] border border-[#D5DEC8] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-2 pointer-events-none opacity-45">
            <div className="bg-white/80 rounded-lg" />
            <div className="bg-white/80 rounded-lg" />
            <div className="bg-white/80 rounded-lg" />
            <div className="bg-white/80 rounded-lg" />
            <div className="bg-white/80 rounded-lg" />
            <div className="bg-white/80 rounded-lg" />
            <div className="bg-white/80 rounded-lg" />
            <div className="bg-white/80 rounded-lg" />
            <div className="bg-white/80 rounded-lg" />
          </div>

          <a
            href={CENTRE_COORDINATES.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2.5 left-3 px-2 py-1 rounded-lg bg-white/95 border border-[#D5DEC8] text-[10.5px] font-semibold text-[#0B2A5B] inline-flex items-center gap-1 hover:border-[#E2B544] shadow-2xs z-10"
          >
            <Crosshair className="w-3 h-3 text-[#C9971C]" />
            <span>{CENTRE_COORDINATES.plusCode}</span>
            <ExternalLink className="w-2.5 h-2.5 text-[#5B6474]" />
          </a>

          <button
            type="button"
            onClick={handleRefreshGps}
            disabled={isGeoChecking || isVerifyingAction}
            className="absolute top-2.5 right-3 px-2.5 py-1 rounded-lg bg-white/95 border border-[#D5DEC8] text-[11px] font-bold text-[#0B2A5B] inline-flex items-center gap-1 hover:border-[#E2B544] cursor-pointer disabled:opacity-60 shadow-2xs z-10"
          >
            <RefreshCw className={`w-3 h-3 ${isGeoChecking ? "animate-spin" : ""}`} />
            <span>Refresh GPS</span>
          </button>

          <div
            className={`relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center transition-colors ${
              isGeoVerified
                ? "border-[#15803D] bg-[#15803D]/10"
                : isGeoChecking
                  ? "border-[#C9971C] bg-[#C9971C]/10"
                  : "border-[#C62828] bg-[#C62828]/10"
            }`}
          >
            <div
              title={CENTRE_COORDINATES.dmsLabel}
              className="w-9 h-6 rounded-md bg-[#0B2A5B] shadow-sm flex items-center justify-center text-[9px] font-bold text-[#F4CF6A]"
            >
              HALL
            </div>

            {geoReading.distanceMeters !== null && (
              <span
                style={{
                  transform: `translate(${radarDotOffset.x}px, ${radarDotOffset.y}px)`,
                }}
                className={`w-4 h-4 rounded-full border-2 border-white shadow-md absolute transition-transform duration-300 ${
                  isGeoVerified ? "bg-[#E2B544]" : "bg-[#C62828]"
                }`}
                title={geoReading.message}
              />
            )}
          </div>

          <div className="absolute bottom-2.5 left-3 px-2.5 py-1 rounded-lg bg-white/95 border border-[#D5DEC8] text-[11px] font-bold text-[#0B2A5B] shadow-2xs">
            Geo-fence: {radiusMeters} m around centre
          </div>

          {geoReading.accuracyMeters !== null && (
            <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-md bg-white/90 border border-[#D5DEC8] text-[10px] font-semibold text-[#5B6474]">
              GPS ±{geoReading.accuracyMeters} m
            </div>
          )}
        </div>

        <div
          className={`px-3.5 py-2.5 rounded-xl border text-[12.5px] font-bold flex items-center gap-2 ${statusBannerStyle}`}
        >
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="leading-snug">{geoReading.message}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC]">
            <div className="text-[11.5px] text-[#5B6474]">Check-in</div>
            <div className="notranslate text-[16px] font-bold text-[#0B2A5B] mt-0.5">
              {myAttendance.checkInTime || "Not yet"}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC]">
            <div className="text-[11.5px] text-[#5B6474]">Check-out</div>
            <div className="notranslate text-[16px] font-bold text-[#0B2A5B] mt-0.5">
              {myAttendance.checkOutTime || "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleCheckInOut}
          disabled={isVerifyingAction}
          style={{
            minHeight: "48px",
            background: myAttendance.checkedIn ? "#C62828" : "#0B2A5B",
            color: "#FFFFFF",
            borderRadius: "12px",
          }}
          className="interactive-btn w-full text-[14.5px] font-bold cursor-pointer disabled:opacity-70"
        >
          {isVerifyingAction
            ? "Verifying GPS location..."
            : myAttendance.checkedIn
              ? "Check Out"
              : "Check In"}
        </button>

        <p className="text-[11px] text-[#5B6474] text-center">
          Check-ins &amp; geo-fence alerts are sent directly to Admin.
        </p>
      </div>
    </section>
  );

  return (
    <PageShell hideHeader>
      <div className="space-y-5">
        {/* Heading + Admin View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium text-[#5B6474]">
              {isAdmin
                ? "Admin · Staff attendance register, calendar filters & reports"
                : "Facility · GPS check-in & check-out"}
            </div>
            <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>Attendance</h1>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-xl border border-[#EFE4CC] p-1 inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAdminTab("register")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-bold cursor-pointer transition-all ${
                  adminTab === "register"
                    ? "bg-[#0B2A5B] text-white shadow-xs"
                    : "text-[#14213D] hover:bg-[#FAF5EB]"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Attendance List</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminTab("my")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-bold cursor-pointer transition-all ${
                  adminTab === "my"
                    ? "bg-[#0B2A5B] text-white shadow-xs"
                    : "text-[#14213D] hover:bg-[#FAF5EB]"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>My Check-in</span>
              </button>
            </div>
          )}
        </div>

        {/* ADMIN FULL REGISTER VIEW (Desktop & Mobile) */}
        {isAdmin && adminTab === "register" ? (
          <div className="space-y-4">
            {/* Active Geo-fence Summary & Admin Geo-fence Alerts */}
            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#BBF7D0] text-[#15803D] text-[12px] font-bold">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Geo-fence Active: {radiusMeters} m</span>
                  </span>
                  <a
                    href={CENTRE_COORDINATES.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0B2A5B] hover:underline"
                  >
                    <span>
                      {CENTRE_COORDINATES.dmsLabel} · {CENTRE_COORDINATES.plusCode}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#C9971C]" />
                  </a>
                </div>

                <Link
                  href="/notifications"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF5EB] border border-[#EFE4CC] text-[12px] font-bold text-[#0B2A5B] hover:border-[#E2B544]"
                >
                  <Bell className="w-3.5 h-3.5 text-[#C9971C]" />
                  <span>All Admin Alerts</span>
                  {attendanceAdminAlerts.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#DC2626] text-white text-[10.5px]">
                      {attendanceAdminAlerts.filter((a) => a.unread).length || attendanceAdminAlerts.length}
                    </span>
                  )}
                </Link>
              </div>

              {attendanceAdminAlerts.length > 0 && (
                <div className="pt-2.5 border-t border-[#F1ECE1] space-y-2">
                  <div className="text-[11.5px] font-bold text-[#5B6474] uppercase tracking-wide">
                    Recent Geo-fence &amp; Check-in Alerts
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {attendanceAdminAlerts.slice(0, 4).map((alert) => (
                      <div
                        key={alert.id}
                        className={`rounded-xl border px-3 py-2 text-[12px] ${
                          alert.title.toLowerCase().includes("outside") ||
                          alert.title.toLowerCase().includes("blocked")
                            ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                            : "bg-[#FAF7F2] border-[#EFE4CC] text-[#14213D]"
                        }`}
                      >
                        <div className="font-bold">{alert.title}</div>
                        <div className="text-[11px] opacity-85 mt-0.5">{alert.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Calendar + Search Filter Bar */}
            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#0B2A5B] mr-1">
                    <Calendar className="w-4 h-4 text-[#C9971C]" />
                    <span>Calendar Filter:</span>
                  </span>
                  {(
                    [
                      { id: "date", label: "Date" },
                      { id: "month", label: "Month" },
                      { id: "range", label: "Range" },
                      { id: "all", label: "All Days" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFilterMode(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer border transition-all ${
                        filterMode === opt.id
                          ? "bg-[#0B2A5B] text-white border-[#0B2A5B]"
                          : "bg-[#FAF7F2] text-[#14213D] border-[#EFE4CC] hover:border-[#E2B544]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {filterMode !== "all" && (
                  <div className="flex flex-wrap items-center gap-2">
                    {filterMode === "date" && (
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        aria-label="Select attendance date"
                        className="h-9 rounded-lg border border-[#E5D9BF] bg-[#FAF7F2] px-2.5 text-[12.5px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                      />
                    )}
                    {filterMode === "month" && (
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        aria-label="Select attendance month"
                        className="h-9 rounded-lg border border-[#E5D9BF] bg-[#FAF7F2] px-2.5 text-[12.5px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                      />
                    )}
                    {filterMode === "range" && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          aria-label="Attendance from date"
                          className="h-9 rounded-lg border border-[#E5D9BF] bg-[#FAF7F2] px-2 text-[12.5px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                        />
                        <span className="text-[12px] text-[#5B6474]">–</span>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          aria-label="Attendance to date"
                          className="h-9 rounded-lg border border-[#E5D9BF] bg-[#FAF7F2] px-2 text-[12.5px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-[#F1ECE1]">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-[#5B6474] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search staff name, role or date..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E5D9BF] bg-[#FAF7F2] text-[13px] text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(["All", "Present", "Late", "Absent"] as const).map((status) => {
                    const active = statusFilter === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold cursor-pointer border transition-all ${
                          active
                            ? "bg-[#0B2A5B] text-white border-[#0B2A5B]"
                            : "bg-white text-[#14213D] border-[#EFE4CC] hover:border-[#E2B544]"
                        }`}
                      >
                        <span>{status}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10.5px] ${
                            active ? "bg-[#E2B544] text-[#041535]" : "bg-[#FAF5EB] text-[#0B2A5B]"
                          }`}
                        >
                          {adminStatusCounts[status]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Admin Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
                <div className="text-[12px] font-medium text-[#5B6474] truncate">
                  {periodLabel} · Working Days
                </div>
                <div className="text-[26px] font-extrabold text-[#0B2A5B] mt-1">
                  {adminMetrics.workingDays}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
                <div className="text-[12px] font-medium text-[#5B6474]">Average Attendance</div>
                <div className="text-[26px] font-extrabold text-[#15803D] mt-1">
                  {adminMetrics.avgPct}%
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
                <div className="text-[12px] font-medium text-[#5B6474]">Late Check-ins</div>
                <div className="text-[26px] font-extrabold text-[#8A6510] mt-1">
                  {adminMetrics.lateCount}
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(155deg, #071E47 0%, #0B2A5B 100%)",
                  borderRadius: "16px",
                  color: "#FFFFFF",
                }}
                className="p-4 sm:p-5 flex flex-col justify-between col-span-2 lg:col-span-1 shadow-md"
              >
                <div className="text-[12px] text-white/80 font-medium">
                  Attendance Summary Report
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => exportAttendanceCsv(adminVisibleLogs)}
                    className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#F4CF6A] hover:underline cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <Link
                    href="/reports"
                    className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-white/85 hover:text-[#F4CF6A]"
                  >
                    <span>Reports</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {adminVisibleLogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#EFE4CC] p-8 text-center text-[13.5px] text-[#5B6474]">
                  No attendance entries match this calendar filter.
                </div>
              ) : (
                adminVisibleLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl border border-[#EFE4CC] p-4 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-[#0B2A5B] text-[15px]">{entry.name}</div>
                        <div className="text-[12px] text-[#5B6474]">
                          {entry.roleTitle} · {formatShortDate(entry.dateISO)}
                        </div>
                      </div>
                      <StatusBadge status={entry.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F1ECE1] text-[12px]">
                      <div>
                        <div className="text-[#5B6474]">Check-in</div>
                        <div className="notranslate font-bold text-[#0B2A5B]">
                          {entry.checkInTime}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#5B6474]">Check-out</div>
                        <div className="notranslate font-semibold text-[#5B6474]">
                          {entry.checkOutTime}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#5B6474]">Geo</div>
                        <div
                          className={`font-semibold ${
                            entry.geoVerified ? "text-[#15803D]" : "text-[#5B6474]"
                          }`}
                        >
                          {entry.geoVerified ? "Verified" : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-[#EFE4CC] overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 border-b border-[#F1ECE1] flex items-center justify-between gap-2">
                <h2 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
                  Staff Attendance List · {periodLabel}
                </h2>
                <span className="text-[12px] font-semibold text-[#5B6474]">
                  {adminVisibleLogs.length} record(s)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px] text-[13.5px]">
                  <thead>
                    <tr className="border-b border-[#F1ECE1] bg-[#FAF7F2]/70 text-[12px] text-[#5B6474]">
                      <th className="py-3 px-5 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Staff</th>
                      <th className="py-3 px-4 font-semibold">Check-in</th>
                      <th className="py-3 px-4 font-semibold">Check-out</th>
                      <th className="py-3 px-4 font-semibold">Geo</th>
                      <th className="py-3 px-5 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1ECE1]">
                    {adminVisibleLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#5B6474]">
                          No attendance entries match this calendar filter.
                        </td>
                      </tr>
                    ) : (
                      adminVisibleLogs.map((entry) => (
                        <tr key={entry.id} className="hover:bg-[#FAF7F2]/70 transition-colors">
                          <td className="notranslate py-3 px-5 font-medium text-[#5B6474] whitespace-nowrap">
                            {formatShortDate(entry.dateISO)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0B2A5B]">{entry.name}</div>
                            <div className="text-[12px] text-[#5B6474]">{entry.roleTitle}</div>
                          </td>
                          <td className="notranslate py-3 px-4 text-[#14213D] font-medium">
                            {entry.checkInTime}
                          </td>
                          <td className="notranslate py-3 px-4 text-[#5B6474]">
                            {entry.checkOutTime}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {entry.geoVerified ? (
                              <span className="text-[#15803D]">Verified</span>
                            ) : (
                              <span className="text-[#5B6474]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-5 text-right">
                            <StatusBadge status={entry.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : isAdmin ? (
          <div className="max-w-lg">{myAttendanceCard}</div>
        ) : (
          /* MANAGER VIEW: My Attendance + Staff Today */
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-5">{myAttendanceCard}</div>

              <section className="lg:col-span-7 bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
                    Staff Today
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-[12px] font-bold">
                    <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D]">
                      {todayCounts.present} Present
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E]">
                      {todayCounts.late} Late
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#C62828]">
                      {todayCounts.absent} Absent
                    </span>
                  </div>
                </div>

                {/* Mobile Cards for Manager */}
                <div className="md:hidden space-y-2.5">
                  {staffAttendance.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-[#F1ECE1] bg-[#FAF7F2]/60 p-3 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-[#0B2A5B] text-[14px]">{s.name}</div>
                          <div className="text-[11.5px] text-[#5B6474]">{s.roleTitle}</div>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="flex items-center justify-between text-[12px] text-[#5B6474] pt-1">
                        <span className="notranslate">
                          In: <strong className="text-[#0B2A5B]">{s.checkInTime}</strong> · Out:{" "}
                          {s.checkOutTime}
                        </span>
                        <span className={s.geoVerified ? "font-semibold text-[#15803D]" : ""}>
                          {s.geoVerified ? "Geo Verified" : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table for Manager */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px] text-[13.5px]">
                    <thead>
                      <tr className="border-b border-[#F1ECE1] text-[12px] text-[#5B6474]">
                        <th className="py-2.5 pr-3 font-semibold">Staff</th>
                        <th className="py-2.5 px-3 font-semibold">Check-in</th>
                        <th className="py-2.5 px-3 font-semibold">Check-out</th>
                        <th className="py-2.5 px-3 font-semibold">Geo</th>
                        <th className="py-2.5 pl-3 text-right font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1ECE1]">
                      {staffAttendance.map((s) => (
                        <tr key={s.id}>
                          <td className="py-3 pr-3">
                            <div className="font-bold text-[#0B2A5B]">{s.name}</div>
                            <div className="text-[12px] text-[#5B6474]">{s.roleTitle}</div>
                          </td>
                          <td className="notranslate py-3 px-3 text-[#14213D] font-medium">
                            {s.checkInTime}
                          </td>
                          <td className="notranslate py-3 px-3 text-[#5B6474]">{s.checkOutTime}</td>
                          <td className="py-3 px-3 font-semibold">
                            {s.geoVerified ? (
                              <span className="text-[#15803D]">Verified</span>
                            ) : (
                              <span className="text-[#5B6474]">—</span>
                            )}
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <StatusBadge status={s.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Monthly Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
                <div className="text-[12px] font-medium text-[#5B6474]">
                  October · Working Days
                </div>
                <div className="text-[26px] font-extrabold text-[#0B2A5B] mt-1">17</div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
                <div className="text-[12px] font-medium text-[#5B6474]">Average Attendance</div>
                <div className="text-[26px] font-extrabold text-[#15803D] mt-1">
                  {todayCounts.avgPct}%
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
                <div className="text-[12px] font-medium text-[#5B6474]">Late Check-ins</div>
                <div className="text-[26px] font-extrabold text-[#8A6510] mt-1">
                  {todayCounts.totalLateMonth}
                </div>
              </div>

              <Link
                href="/reports"
                style={{
                  background: "linear-gradient(155deg, #071E47 0%, #0B2A5B 100%)",
                  borderRadius: "16px",
                  color: "#FFFFFF",
                }}
                className="interactive-card p-4 sm:p-5 flex flex-col justify-between col-span-2 lg:col-span-1 shadow-md"
              >
                <div className="text-[12px] text-white/80 font-medium">
                  Attendance Summary Report
                </div>
                <div className="text-[16px] font-bold text-[#F4CF6A] inline-flex items-center gap-1.5 mt-2">
                  <span>Export PDF / Excel</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </>
        )}
      </div>

      {geoDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="geofence-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#EFE4CC] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#C62828]" />
                </div>
                <div>
                  <h2 id="geofence-dialog-title" className="text-[17px] font-bold text-[#0B2A5B]">
                    {geoDialog.title}
                  </h2>
                  <p className="text-[12px] text-[#C62828] font-semibold">
                    Geo-fence limit: {radiusMeters} m around centre
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGeoDialog(null)}
                aria-label="Close dialog"
                className="p-1.5 rounded-lg text-[#5B6474] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-[13.5px] text-[#7F1D1D] space-y-1.5">
              <p className="font-medium leading-relaxed">{geoDialog.message}</p>
              {geoDialog.detail && <p className="text-[12px] font-bold">{geoDialog.detail}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setGeoDialog(null);
                  handleRefreshGps();
                }}
                className="px-4 py-2.5 rounded-xl border border-[#E2B544] bg-[#FAF5EB] text-[#0B2A5B] text-[13.5px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#F4EAD2]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry GPS</span>
              </button>
              <button
                type="button"
                onClick={() => setGeoDialog(null)}
                className="px-4 py-2.5 rounded-xl bg-[#0B2A5B] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#071D44]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

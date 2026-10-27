export type ActionTag = "PAY" | "INS" | "REF" | "BK" | "FIX";

export interface ActionItem {
  id: string;
  tag: ActionTag;
  title: string;
  detail: string;
  buttonLabel: string;
  successMessage: string;
  linkUrl?: string;
}

export type BookingStatus = "Confirmed" | "Pending" | "Awaiting approval";

export interface ComingUpBooking {
  id: string;
  receiptNo: string;
  day: string;
  month: string;
  title: string;
  applicant: string;
  hall: "Ground Floor" | "Ground + First Floor";
  isAC?: boolean;
  status: BookingStatus;
  balanceDue?: string;
  isFreeUse?: boolean;
}

export interface TodayHallInfo {
  event: string;
  applicant: string;
  hall: string;
  timing: string;
  status: "Confirmed";
  balance: string;
  receiptNo: string;
}

export interface MoneyToCollectInfo {
  amount: string;
  bookingCount: number;
  overdueCount: number;
}

export const INITIAL_TODAY_HALL: TodayHallInfo = {
  event: "Wedding",
  applicant: "Mr. Imran Patel",
  hall: "Ground + First Floor (A.C.)",
  timing: "10:00 AM – 10:00 PM",
  status: "Confirmed",
  balance: "₹9,500 balance",
  receiptNo: "1048",
};

export const INITIAL_MONEY_TO_COLLECT: MoneyToCollectInfo = {
  amount: "₹47,500",
  bookingCount: 6,
  overdueCount: 1,
};

export const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: "act-1",
    tag: "PAY",
    title: "Payment overdue · Mr. Faizan Ahmed",
    detail: "Engagement on 24 Oct · ₹4,000 balance was due 18 Oct",
    buttonLabel: "Record payment",
    successMessage: "Payment recorded · removed from your list",
    linkUrl: "/payments",
  },
  {
    id: "act-2",
    tag: "PAY",
    title: "Balance due tomorrow · Mrs. Rukhsana Patel",
    detail: "Walima, 21 Oct · ₹7,000 balance",
    buttonLabel: "Record payment",
    successMessage: "Payment recorded · removed from your list",
    linkUrl: "/payments",
  },
  {
    id: "act-3",
    tag: "INS",
    title: "Post-event check · Wedding, Mr. Imran Patel",
    detail: "Tomorrow 9:00 AM · Ground + First Floor",
    buttonLabel: "Start check",
    successMessage: "Check started · removed from your list",
    linkUrl: "/maintenance",
  },
  {
    id: "act-4",
    tag: "REF",
    title: "Refund deposit · Mr. Aslam Ghanchi",
    detail: "Wedding on 17 Oct · hall checked, no damage · ₹5,000",
    buttonLabel: "Refund ₹5,000",
    successMessage: "Deposit refunded · removed from your list",
    linkUrl: "/payments",
  },
  {
    id: "act-5",
    tag: "BK",
    title: "Confirm booking · Mr. Salim Shaikh",
    detail: "Birthday, 25 Oct · Ground Floor · ₹2,000 advance paid",
    buttonLabel: "Confirm",
    successMessage: "Booking confirmed · removed from your list",
    linkUrl: "/bookings/1054",
  },
  {
    id: "act-6",
    tag: "FIX",
    title: "Check repair · Water leakage in washroom",
    detail: "Vendor says work is complete · MC-2026-0110",
    buttonLabel: "Verify & close",
    successMessage: "Repair verified & closed · removed from your list",
    linkUrl: "/maintenance",
  },
];

export const UPCOMING_BOOKINGS: ComingUpBooking[] = [
  {
    id: "up-1",
    receiptNo: "1051",
    day: "21",
    month: "OCT",
    title: "Walima",
    applicant: "Mrs. Rukhsana Patel",
    hall: "Ground + First Floor",
    status: "Pending",
  },
  {
    id: "up-2",
    receiptNo: "1052",
    day: "22",
    month: "OCT",
    title: "Community Meeting (free use)",
    applicant: "Jamat Committee",
    hall: "Ground Floor",
    status: "Awaiting approval",
    isFreeUse: true,
  },
  {
    id: "up-3",
    receiptNo: "1053",
    day: "24",
    month: "OCT",
    title: "Engagement",
    applicant: "Mr. Faizan Ahmed",
    hall: "Ground Floor",
    status: "Confirmed",
  },
  {
    id: "up-4",
    receiptNo: "1054",
    day: "25",
    month: "OCT",
    title: "Birthday",
    applicant: "Mr. Salim Shaikh",
    hall: "Ground Floor",
    status: "Pending",
  },
  {
    id: "up-5",
    receiptNo: "1055",
    day: "28",
    month: "OCT",
    title: "Nikah (2 days)",
    applicant: "Mr. Arif Valibhoy",
    hall: "Ground + First Floor",
    status: "Confirmed",
  },
];

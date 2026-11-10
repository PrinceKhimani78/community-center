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

export type BookingStatus = "Confirmed" | "Pending" | "Awaiting approval" | "Completed" | "Cancelled";

export interface ComingUpBooking {
  id: string;
  receiptNo: string;
  day: string;
  month: string;
  title: string;
  applicant: string;
  hall: "Ground Floor" | "Ground + First Floor" | "Garden Lawn";
  isAC?: boolean;
  status: "Confirmed" | "Pending" | "Awaiting approval";
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

export type HallName = "Ground Floor" | "Ground + First Floor" | "Garden Lawn";

export interface BookingRecord {
  id: string;
  receiptNo: string;
  eventTitle: string;
  eventType: string;
  applicantId: string;
  applicantName: string;
  phone: string;
  hall: HallName;
  isAC: boolean;
  dateISO: string; // YYYY-MM-DD
  endDateISO?: string;
  dateLabel: string;
  timing: string;
  guests: number;
  rent: number;
  deposit: number;
  paid: number;
  status: BookingStatus;
  isFreeUse?: boolean;
  notes?: string;
  paymentMode?: PaymentMode;
  createdAtLabel?: string;
  createdBy?: string;
  preInspectionDone?: boolean;
  postInspectionDone?: boolean;
  depositStatus?: "Held" | "Awaiting inspection" | "Refunded" | "N/A";
  cancellationReason?: string;
}

export interface ApplicantRecord {
  id: string;
  name: string;
  phone: string;
  address: string;
  idProofMasked: string;
  notes: string;
}

export type PaymentMode = "Cash" | "UPI" | "Bank Transfer" | "Cheque";

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  bookingId: string;
  bookingReceiptNo: string;
  applicantName: string;
  eventTitle: string;
  type: "Advance" | "Rent Balance" | "Security Deposit";
  amount: number;
  mode: PaymentMode;
  reference: string;
  dateLabel: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: "Cleaning" | "Electricity" | "Water" | "Repair" | "Supplies";
  amount: number;
  paidTo: string;
  dateLabel: string;
  status: "Approved" | "Pending";
}

export interface DepositRefundRecord {
  id: string;
  bookingReceiptNo: string;
  applicantName: string;
  eventTitle: string;
  eventDate: string;
  heldAmount: number;
  deductionAmount: number;
  deductionNote: string;
  refundMode: PaymentMode;
  status: "Ready to Refund" | "Sent for Approval" | "Refunded";
}

export interface MaintenanceTicket {
  id: string;
  ticketNo: string;
  title: string;
  category: "Plumbing" | "Electrical" | "AC / Fans" | "Furniture" | "Cleaning";
  location: string;
  priority: "Normal" | "Urgent";
  estimatedCost: number;
  raisedBy: string;
  dateLabel: string;
  status: "Pending" | "In Progress" | "Completed";
  blockHall?: boolean;
  blockDateISO?: string;
}

export interface HallCheckItem {
  id: string;
  label: string;
  helper: string;
  status: "OK" | "Issue";
  issueCost: number;
  note: string;
}

export interface StaffAttendanceRecord {
  id: string;
  name: string;
  roleTitle: string;
  checkInTime: string;
  checkOutTime: string;
  geoVerified: boolean;
  status: "Present" | "Late" | "Absent";
}

export interface ApprovalItem {
  id: string;
  type: "Free Hall Use" | "Deposit Refund" | "Expense" | "Repair Cost";
  title: string;
  detail: string;
  amountLabel: string;
  requester: string;
  referenceNo: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface NotificationRecord {
  id: string;
  category: "Money" | "Bookings" | "Repairs" | "Approvals";
  title: string;
  detail: string;
  timeLabel: string;
  unread: boolean;
  href: string;
}

export interface AuditLogEntry {
  id: string;
  timeLabel: string;
  userLabel: string;
  module: "Booking" | "Payment" | "Maintenance" | "Approval" | "User";
  action: string;
  detail: string;
}

export interface SystemUser {
  id: string;
  userId: string;
  name: string;
  role: "Admin" | "Manager" | "Accountant" | "Staff";
  lastLogin: string;
  active: boolean;
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
    linkUrl: "/maintenance?tab=check",
  },
  {
    id: "act-4",
    tag: "REF",
    title: "Refund deposit · Mr. Aslam Ghanchi",
    detail: "Wedding on 17 Oct · hall checked, no damage · ₹5,000",
    buttonLabel: "Refund ₹5,000",
    successMessage: "Deposit refunded · removed from your list",
    linkUrl: "/payments?tab=refunds",
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

export const INITIAL_APPLICANTS: ApplicantRecord[] = [
  {
    id: "app-1",
    name: "Mr. Imran Patel",
    phone: "+91 98250 11223",
    address: "Station Road, Dhari, Amreli",
    idProofMasked: "XXXX-XXXX-4821",
    notes: "Needs extra 100 chairs on Ground Floor.",
  },
  {
    id: "app-2",
    name: "Mrs. Rukhsana Patel",
    phone: "+91 98791 44556",
    address: "Vora Bazaar, Dhari",
    idProofMasked: "XXXX-XXXX-9104",
    notes: "Prefer UPI receipts on WhatsApp later.",
  },
  {
    id: "app-3",
    name: "Jamat Committee",
    phone: "+91 94262 77889",
    address: "Main Masjid Street, Dhari",
    idProofMasked: "TRUST-REG-2019",
    notes: "Community gathering — trustee free-use approval required.",
  },
  {
    id: "app-4",
    name: "Mr. Faizan Ahmed",
    phone: "+91 99099 22334",
    address: "Gondal Road, Dhari",
    idProofMasked: "XXXX-XXXX-3319",
    notes: "Balance reminder requested before event.",
  },
  {
    id: "app-5",
    name: "Mr. Salim Shaikh",
    phone: "+91 97240 66778",
    address: "Amreli Naka, Dhari",
    idProofMasked: "XXXX-XXXX-6670",
    notes: "Evening family function.",
  },
  {
    id: "app-6",
    name: "Mr. Arif Valibhoy",
    phone: "+91 98242 55441",
    address: "Bagasara Road, Dhari",
    idProofMasked: "XXXX-XXXX-7732",
    notes: "2-day Nikah booking with A.C. hall.",
  },
  {
    id: "app-7",
    name: "Mr. Aslam Ghanchi",
    phone: "+91 94277 88990",
    address: "Patel Chowk, Dhari",
    idProofMasked: "XXXX-XXXX-5518",
    notes: "Hall left clean after 17 Oct wedding.",
  },
  {
    id: "app-8",
    name: "Ms. Nazia Kureshi",
    phone: "+91 96620 44120",
    address: "Station Road, Dhari",
    idProofMasked: "XXXX-XXXX-2204",
    notes: "Cancelled 06 Oct booking due to family travel.",
  },
];

export const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: "bk-1048",
    receiptNo: "1048",
    eventTitle: "Wedding",
    eventType: "Wedding",
    applicantId: "app-1",
    applicantName: "Mr. Imran Patel",
    phone: "+91 98250 11223",
    hall: "Ground + First Floor",
    isAC: true,
    dateISO: "2026-10-20",
    dateLabel: "20 Oct 2026",
    timing: "10:00 AM – 10:00 PM",
    guests: 450,
    rent: 22000,
    deposit: 5000,
    paid: 17500,
    status: "Confirmed",
    notes: "Full A.C. and kitchen setup included. Stage decoration by family's vendor.",
    paymentMode: "UPI",
    createdAtLabel: "05 Oct 2026, 11:20 AM",
    createdBy: "Manager",
    preInspectionDone: true,
    postInspectionDone: false,
    depositStatus: "Awaiting inspection",
  },
  {
    id: "bk-1051",
    receiptNo: "1051",
    eventTitle: "Walima",
    eventType: "Walima",
    applicantId: "app-2",
    applicantName: "Mrs. Rukhsana Patel",
    phone: "+91 98791 44556",
    hall: "Ground + First Floor",
    isAC: true,
    dateISO: "2026-10-21",
    dateLabel: "21 Oct 2026",
    timing: "11:00 AM – 9:00 PM",
    guests: 380,
    rent: 20000,
    deposit: 5000,
    paid: 18000,
    status: "Pending",
    notes: "₹7,000 remaining balance due before event.",
    paymentMode: "Bank Transfer",
    createdAtLabel: "08 Oct 2026, 02:15 PM",
    createdBy: "Manager",
    preInspectionDone: false,
    postInspectionDone: false,
    depositStatus: "Held",
  },
  {
    id: "bk-1052",
    receiptNo: "1052",
    eventTitle: "Community Meeting (free use)",
    eventType: "Community Meeting",
    applicantId: "app-3",
    applicantName: "Jamat Committee",
    phone: "+91 94262 77889",
    hall: "Ground Floor",
    isAC: false,
    dateISO: "2026-10-22",
    dateLabel: "22 Oct 2026",
    timing: "4:00 PM – 8:00 PM",
    guests: 140,
    rent: 0,
    deposit: 0,
    paid: 0,
    status: "Awaiting approval",
    isFreeUse: true,
    notes: "Waiting for Admin / Trustee sign-off.",
    createdAtLabel: "10 Oct 2026, 10:05 AM",
    createdBy: "Manager",
    preInspectionDone: false,
    postInspectionDone: false,
    depositStatus: "N/A",
  },
  {
    id: "bk-1053",
    receiptNo: "1053",
    eventTitle: "Engagement",
    eventType: "Engagement",
    applicantId: "app-4",
    applicantName: "Mr. Faizan Ahmed",
    phone: "+91 99099 22334",
    hall: "Ground Floor",
    isAC: false,
    dateISO: "2026-10-24",
    dateLabel: "24 Oct 2026",
    timing: "10:00 AM – 6:00 PM",
    guests: 220,
    rent: 12000,
    deposit: 3000,
    paid: 11000,
    status: "Confirmed",
    notes: "₹4,000 balance overdue since 18 Oct.",
    paymentMode: "Cash",
    createdAtLabel: "09 Oct 2026, 04:30 PM",
    createdBy: "Manager",
    preInspectionDone: false,
    postInspectionDone: false,
    depositStatus: "Held",
  },
  {
    id: "bk-1054",
    receiptNo: "1054",
    eventTitle: "Birthday",
    eventType: "Birthday",
    applicantId: "app-5",
    applicantName: "Mr. Salim Shaikh",
    phone: "+91 97240 66778",
    hall: "Ground Floor",
    isAC: false,
    dateISO: "2026-10-25",
    dateLabel: "25 Oct 2026",
    timing: "5:00 PM – 10:00 PM",
    guests: 120,
    rent: 8000,
    deposit: 2000,
    paid: 2000,
    status: "Pending",
    notes: "Advance paid; confirm booking after remaining rent.",
    paymentMode: "UPI",
    createdAtLabel: "12 Oct 2026, 06:10 PM",
    createdBy: "Manager",
    preInspectionDone: false,
    postInspectionDone: false,
    depositStatus: "Held",
  },
  {
    id: "bk-1055",
    receiptNo: "1055",
    eventTitle: "Nikah (2 days)",
    eventType: "Nikah",
    applicantId: "app-6",
    applicantName: "Mr. Arif Valibhoy",
    phone: "+91 98242 55441",
    hall: "Ground + First Floor",
    isAC: true,
    dateISO: "2026-10-28",
    endDateISO: "2026-10-29",
    dateLabel: "28–29 Oct 2026",
    timing: "9:00 AM – 10:00 PM",
    guests: 500,
    rent: 36000,
    deposit: 10000,
    paid: 25000,
    status: "Confirmed",
    notes: "2-day full centre reservation.",
    paymentMode: "Cheque",
    createdAtLabel: "11 Oct 2026, 12:45 PM",
    createdBy: "Admin",
    preInspectionDone: false,
    postInspectionDone: false,
    depositStatus: "Held",
  },
  {
    id: "bk-1045",
    receiptNo: "1045",
    eventTitle: "Wedding",
    eventType: "Wedding",
    applicantId: "app-7",
    applicantName: "Mr. Aslam Ghanchi",
    phone: "+91 94277 88990",
    hall: "Ground + First Floor",
    isAC: true,
    dateISO: "2026-10-17",
    dateLabel: "17 Oct 2026",
    timing: "10:00 AM – 10:00 PM",
    guests: 400,
    rent: 22000,
    deposit: 5000,
    paid: 27000,
    status: "Completed",
    notes: "Post-event check passed with zero damage.",
    paymentMode: "Cash",
    createdAtLabel: "01 Oct 2026, 09:30 AM",
    createdBy: "Manager",
    preInspectionDone: true,
    postInspectionDone: true,
    depositStatus: "Awaiting inspection",
  },
  {
    id: "bk-1039",
    receiptNo: "1039",
    eventTitle: "Birthday Party",
    eventType: "Birthday",
    applicantId: "app-8",
    applicantName: "Ms. Nazia Kureshi",
    phone: "+91 96620 44120",
    hall: "Garden Lawn",
    isAC: false,
    dateISO: "2026-10-06",
    dateLabel: "06 Oct 2026",
    timing: "7:00 PM – 10:00 PM",
    guests: 90,
    rent: 10000,
    deposit: 2000,
    paid: 12000,
    status: "Cancelled",
    notes: "Cancelled prior to event; advance & deposit refunded.",
    paymentMode: "UPI",
    createdAtLabel: "25 Sep 2026, 04:00 PM",
    createdBy: "Manager",
    preInspectionDone: false,
    postInspectionDone: false,
    depositStatus: "Refunded",
    cancellationReason: "Family postponed function",
  },
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay-1",
    receiptNo: "REC-2026-1048",
    bookingId: "bk-1048",
    bookingReceiptNo: "1048",
    applicantName: "Mr. Imran Patel",
    eventTitle: "Wedding (20 Oct)",
    type: "Advance",
    amount: 17500,
    mode: "UPI",
    reference: "UPI-62849103",
    dateLabel: "15 Oct 2026",
  },
  {
    id: "pay-2",
    receiptNo: "REC-2026-1051",
    bookingId: "bk-1051",
    bookingReceiptNo: "1051",
    applicantName: "Mrs. Rukhsana Patel",
    eventTitle: "Walima (21 Oct)",
    type: "Advance",
    amount: 18000,
    mode: "Bank Transfer",
    reference: "NEFT-904412",
    dateLabel: "16 Oct 2026",
  },
  {
    id: "pay-3",
    receiptNo: "REC-2026-1053",
    bookingId: "bk-1053",
    bookingReceiptNo: "1053",
    applicantName: "Mr. Faizan Ahmed",
    eventTitle: "Engagement (24 Oct)",
    type: "Advance",
    amount: 11000,
    mode: "Cash",
    reference: "CASH-BOOK-1053",
    dateLabel: "14 Oct 2026",
  },
  {
    id: "pay-4",
    receiptNo: "REC-2026-1055",
    bookingId: "bk-1055",
    bookingReceiptNo: "1055",
    applicantName: "Mr. Arif Valibhoy",
    eventTitle: "Nikah 2 days (28 Oct)",
    type: "Advance",
    amount: 25000,
    mode: "Cheque",
    reference: "CHQ-441209",
    dateLabel: "18 Oct 2026",
  },
  {
    id: "pay-5",
    receiptNo: "REC-2026-1045",
    bookingId: "bk-1045",
    bookingReceiptNo: "1045",
    applicantName: "Mr. Aslam Ghanchi",
    eventTitle: "Wedding (17 Oct)",
    type: "Rent Balance",
    amount: 27000,
    mode: "Cash",
    reference: "CASH-BOOK-1045",
    dateLabel: "17 Oct 2026",
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: "exp-1",
    title: "Hall deep cleaning & floor polish",
    category: "Cleaning",
    amount: 2400,
    paidTo: "Shakti Cleaning Services",
    dateLabel: "19 Oct 2026",
    status: "Approved",
  },
  {
    id: "exp-2",
    title: "Washroom pipe & tap replacement",
    category: "Repair",
    amount: 1850,
    paidTo: "Ramesh Plumbing",
    dateLabel: "18 Oct 2026",
    status: "Pending",
  },
  {
    id: "exp-3",
    title: "Drinking water tankers (2 trips)",
    category: "Water",
    amount: 1200,
    paidTo: "Dhari Water Supply",
    dateLabel: "20 Oct 2026",
    status: "Approved",
  },
];

export const INITIAL_DEPOSIT_REFUNDS: DepositRefundRecord[] = [
  {
    id: "ref-1",
    bookingReceiptNo: "1045",
    applicantName: "Mr. Aslam Ghanchi",
    eventTitle: "Wedding",
    eventDate: "17 Oct 2026",
    heldAmount: 5000,
    deductionAmount: 0,
    deductionNote: "Hall checked — zero damage",
    refundMode: "Cash",
    status: "Ready to Refund",
  },
  {
    id: "ref-2",
    bookingReceiptNo: "1042",
    applicantName: "Mr. Yusuf Mansuri",
    eventTitle: "Engagement",
    eventDate: "12 Oct 2026",
    heldAmount: 3000,
    deductionAmount: 500,
    deductionNote: "2 plastic chairs broken",
    refundMode: "UPI",
    status: "Refunded",
  },
];

export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: "mnt-1",
    ticketNo: "MC-2026-0110",
    title: "Water leakage in Ground Floor washroom",
    category: "Plumbing",
    location: "Ground Floor Washroom",
    priority: "Urgent",
    estimatedCost: 1850,
    raisedBy: "Manager",
    dateLabel: "19 Oct 2026",
    status: "In Progress",
  },
  {
    id: "mnt-2",
    ticketNo: "MC-2026-0111",
    title: "First Floor A.C. unit #2 servicing",
    category: "AC / Fans",
    location: "First Floor Hall",
    priority: "Normal",
    estimatedCost: 2200,
    raisedBy: "Staff",
    dateLabel: "20 Oct 2026",
    status: "Pending",
    blockHall: true,
    blockDateISO: "2026-10-26",
  },
  {
    id: "mnt-3",
    ticketNo: "MC-2026-0108",
    title: "Stage LED spotlight bulb replaced",
    category: "Electrical",
    location: "Ground Floor Stage",
    priority: "Normal",
    estimatedCost: 650,
    raisedBy: "Manager",
    dateLabel: "16 Oct 2026",
    status: "Completed",
  },
];

export const INITIAL_HALL_CHECK_ITEMS: HallCheckItem[] = [
  { id: "chk-1", label: "Chairs & Tables", helper: "Counted & unbroken", status: "OK", issueCost: 0, note: "" },
  { id: "chk-2", label: "Lights & Switches", helper: "Stage + hall bulbs working", status: "OK", issueCost: 0, note: "" },
  { id: "chk-3", label: "Fans & A.C.", helper: "Cooling & remotes returned", status: "OK", issueCost: 0, note: "" },
  { id: "chk-4", label: "Sound & Mic", helper: "Speakers + wireless mics safe", status: "OK", issueCost: 0, note: "" },
  { id: "chk-5", label: "Washrooms", helper: "Clean & taps closed properly", status: "OK", issueCost: 0, note: "" },
  { id: "chk-6", label: "Kitchen Area", helper: "Gas, counters & sink clean", status: "OK", issueCost: 0, note: "" },
  { id: "chk-7", label: "Floors & Walls", helper: "No stains or wall tape marks", status: "OK", issueCost: 0, note: "" },
];

export const INITIAL_STAFF_ATTENDANCE: StaffAttendanceRecord[] = [
  { id: "st-1", name: "Irfanbhai Bloch", roleTitle: "Hall Caretaker", checkInTime: "08:55 AM", checkOutTime: "—", geoVerified: true, status: "Present" },
  { id: "st-2", name: "Rameshbhai Solanki", roleTitle: "Cleaner & Helper", checkInTime: "09:12 AM", checkOutTime: "—", geoVerified: true, status: "Late" },
  { id: "st-3", name: "Salimbhai Qureshi", roleTitle: "Night Security", checkInTime: "—", checkOutTime: "—", geoVerified: false, status: "Absent" },
  { id: "st-4", name: "NaziyaBen Saiyed", roleTitle: "Office Assistant", checkInTime: "09:00 AM", checkOutTime: "—", geoVerified: true, status: "Present" },
];

export const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: "apr-1",
    type: "Free Hall Use",
    title: "Community Meeting · Jamat Committee",
    detail: "22 Oct 2026 · Ground Floor (4:00 PM – 8:00 PM) · 140 guests",
    amountLabel: "₹0 (Free Use)",
    requester: "Manager",
    referenceNo: "BK-1052",
    status: "Pending",
  },
  {
    id: "apr-2",
    type: "Repair Cost",
    title: "First Floor A.C. unit #2 servicing",
    detail: "Cooling check + gas refill before 28 Oct Nikah booking",
    amountLabel: "₹2,200",
    requester: "Staff",
    referenceNo: "MC-2026-0111",
    status: "Pending",
  },
  {
    id: "apr-3",
    type: "Expense",
    title: "Washroom pipe & tap replacement",
    detail: "Ramesh Plumbing · Ground Floor washroom repair",
    amountLabel: "₹1,850",
    requester: "Manager",
    referenceNo: "EXP-102",
    status: "Pending",
  },
];

export const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "not-1",
    category: "Money",
    title: "Payment overdue — Mr. Faizan Ahmed",
    detail: "₹4,000 balance was due on 18 Oct for Engagement (24 Oct).",
    timeLabel: "1 hour ago",
    unread: true,
    href: "/payments",
  },
  {
    id: "not-2",
    category: "Money",
    title: "Balance due tomorrow — Mrs. Rukhsana Patel",
    detail: "Walima is tomorrow (21 Oct). ₹7,000 balance remaining.",
    timeLabel: "2 hours ago",
    unread: true,
    href: "/payments",
  },
  {
    id: "not-3",
    category: "Bookings",
    title: "Free-use approval needed — Jamat Committee",
    detail: "Community Meeting on 22 Oct is awaiting Admin approval.",
    timeLabel: "Yesterday",
    unread: true,
    href: "/bookings",
  },
  {
    id: "not-4",
    category: "Repairs",
    title: "Washroom leakage repair marked done by plumber",
    detail: "Please check and close ticket MC-2026-0110.",
    timeLabel: "Yesterday",
    unread: true,
    href: "/maintenance",
  },
  {
    id: "not-5",
    category: "Money",
    title: "Deposit ready to refund — Mr. Aslam Ghanchi",
    detail: "Post-event hall check passed cleanly. Refund ₹5,000.",
    timeLabel: "2 days ago",
    unread: false,
    href: "/payments?tab=refunds",
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    timeLabel: "20 Oct · 10:15 AM",
    userLabel: "Manager",
    module: "Booking",
    action: "Checked today's Wedding setup",
    detail: "Booking #1048 (Mr. Imran Patel) marked Ready for event.",
  },
  {
    id: "log-2",
    timeLabel: "19 Oct · 05:40 PM",
    userLabel: "Manager",
    module: "Maintenance",
    action: "Raised repair ticket MC-2026-0110",
    detail: "Ground Floor washroom leakage · Est. ₹1,850.",
  },
  {
    id: "log-3",
    timeLabel: "18 Oct · 03:10 PM",
    userLabel: "Accountant",
    module: "Payment",
    action: "Recorded advance ₹25,000",
    detail: "Receipt REC-2026-1055 issued to Mr. Arif Valibhoy (Cheque).",
  },
  {
    id: "log-4",
    timeLabel: "17 Oct · 11:20 PM",
    userLabel: "Admin",
    module: "Approval",
    action: "Approved cleaning expense ₹2,400",
    detail: "Paid to Shakti Cleaning Services.",
  },
];

export const INITIAL_SYSTEM_USERS: SystemUser[] = [
  { id: "u-1", userId: "admin", name: "Haji Valibhoy Trustee", role: "Admin", lastLogin: "Today, 9:40 AM", active: true },
  { id: "u-2", userId: "manager", name: "Centre Manager", role: "Manager", lastLogin: "Today, 9:05 AM", active: true },
  { id: "u-3", userId: "accounts", name: "Imtiyaz Accountant", role: "Accountant", lastLogin: "Yesterday, 6:15 PM", active: true },
  { id: "u-4", userId: "caretaker", name: "Irfanbhai Bloch", role: "Staff", lastLogin: "Today, 8:55 AM", active: true },
];

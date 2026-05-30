export type ShiftLabel = "Sáng" | "Chiều" | "Tối";

export type StaffProfile = {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  bankAccount: string;
  bankName: string;
  role: "staff" | "manager";
  hourlyRate: number;
  accumulatedHours: number;
  hireDate: string;
};

export type ShiftSlot = {
  id: string;
  date: string;       // "YYYY-MM-DD"
  label: ShiftLabel;
  startTime: string;  // "06:00"
  endTime: string;    // "14:00"
  requiredStaff: number;
  registeredCount: number;
};

export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ShiftRegistration = {
  id: string;
  staffId: string;
  shiftId: string;
  registeredAt: string;
  status: RegistrationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectNote?: string;
};

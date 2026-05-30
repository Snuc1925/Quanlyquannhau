import type { StaffProfile, ShiftSlot } from "../types";

export const mockProfiles: StaffProfile[] = [
  {
    id: "staff-1",
    username: "staff",
    fullName: "Nguyễn Văn Bình",
    phone: "0901 234 567",
    email: "binh.nv@quanbia.vn",
    bankAccount: "1234567890",
    bankName: "Vietcombank",
    role: "staff",
    hourlyRate: 35000,
    accumulatedHours: 124,
    hireDate: "2024-03-01",
  },
  {
    id: "staff-2",
    username: "tran.thi.lan",
    fullName: "Trần Thị Lan",
    phone: "0912 345 678",
    email: "lan.tt@quanbia.vn",
    bankAccount: "9876543210",
    bankName: "Techcombank",
    role: "staff",
    hourlyRate: 35000,
    accumulatedHours: 96,
    hireDate: "2024-05-15",
  },
  {
    id: "staff-3",
    username: "le.minh.duc",
    fullName: "Lê Minh Đức",
    phone: "0923 456 789",
    email: "duc.lm@quanbia.vn",
    bankAccount: "1122334455",
    bankName: "MB Bank",
    role: "staff",
    hourlyRate: 35000,
    accumulatedHours: 208,
    hireDate: "2023-11-01",
  },
  {
    id: "staff-4",
    username: "pham.thu.ha",
    fullName: "Phạm Thu Hà",
    phone: "0934 567 890",
    email: "ha.pt@quanbia.vn",
    bankAccount: "5566778899",
    bankName: "BIDV",
    role: "staff",
    hourlyRate: 35000,
    accumulatedHours: 56,
    hireDate: "2025-01-10",
  },
  {
    id: "mgr-1",
    username: "manager",
    fullName: "Hoàng Minh Quản",
    phone: "0945 678 901",
    email: "quan.hm@quanbia.vn",
    bankAccount: "6677889900",
    bankName: "Vietinbank",
    role: "manager",
    hourlyRate: 60000,
    accumulatedHours: 312,
    hireDate: "2022-06-01",
  },
];

// Generate shifts for current week (Mon–Sun)
function getWeekDates(): string[] {
  const today = new Date("2026-05-30");
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

type ShiftTemplate = {
  label: "Sáng" | "Chiều" | "Tối";
  startTime: string;
  endTime: string;
  requiredStaff: number;
};

const shiftTemplates: ShiftTemplate[] = [
  { label: "Sáng",  startTime: "06:00", endTime: "14:00", requiredStaff: 3 },
  { label: "Chiều", startTime: "14:00", endTime: "22:00", requiredStaff: 4 },
  { label: "Tối",   startTime: "18:00", endTime: "24:00", requiredStaff: 3 },
];

export const mockShifts: ShiftSlot[] = getWeekDates().flatMap((date, dayIdx) =>
  shiftTemplates.map((tpl, tplIdx) => ({
    id: `shift-${dayIdx}-${tplIdx}`,
    date,
    label: tpl.label,
    startTime: tpl.startTime,
    endTime: tpl.endTime,
    requiredStaff: tpl.requiredStaff,
    registeredCount: Math.floor(Math.random() * tpl.requiredStaff),
  }))
);

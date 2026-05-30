import { create } from "zustand";
import type {
  StaffProfile,
  ShiftSlot,
  ShiftRegistration,
  RegistrationStatus,
} from "../types";
import { mockProfiles, mockShifts } from "../data/mockData";

type StaffState = {
  profiles: StaffProfile[];
  shifts: ShiftSlot[];
  registrations: ShiftRegistration[];
};

type StaffActions = {
  getProfileByUsername: (username: string) => StaffProfile | undefined;
  updateProfile: (staffId: string, updates: Partial<StaffProfile>) => void;

  registerShift: (staffId: string, shiftId: string) => void;
  cancelRegistration: (registrationId: string) => void;
  approveRegistration: (registrationId: string, reviewedBy: string) => void;
  rejectRegistration: (
    registrationId: string,
    reviewedBy: string,
    note: string
  ) => void;

  getMyRegistrations: (staffId: string) => ShiftRegistration[];
  getPendingRegistrations: () => ShiftRegistration[];
  getShiftById: (shiftId: string) => ShiftSlot | undefined;
  getProfileById: (staffId: string) => StaffProfile | undefined;
  getRegistrationStatus: (
    staffId: string,
    shiftId: string
  ) => RegistrationStatus | null;
};

export const useStaffStore = create<StaffState & StaffActions>((set, get) => ({
  profiles: mockProfiles,
  shifts: mockShifts,
  registrations: [],

  getProfileByUsername: (username) =>
    get().profiles.find((p) => p.username === username),

  updateProfile: (staffId, updates) => {
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === staffId ? { ...p, ...updates } : p
      ),
    }));
  },

  registerShift: (staffId, shiftId) => {
    const { shifts, registrations } = get();

    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) throw new Error("Không tìm thấy ca làm việc");

    if (shift.registeredCount >= shift.requiredStaff) {
      throw new Error("Ca này đã đủ người");
    }

    const existing = registrations.find(
      (r) =>
        r.staffId === staffId &&
        r.shiftId === shiftId &&
        r.status !== "REJECTED"
    );
    if (existing) throw new Error("Bạn đã đăng ký ca này rồi");

    const newReg: ShiftRegistration = {
      id: `reg-${Date.now()}`,
      staffId,
      shiftId,
      registeredAt: new Date().toISOString(),
      status: "PENDING",
    };

    // Increment registeredCount
    const updatedShifts = shifts.map((s) =>
      s.id === shiftId ? { ...s, registeredCount: s.registeredCount + 1 } : s
    );

    set({
      registrations: [...registrations, newReg],
      shifts: updatedShifts,
    });
  },

  cancelRegistration: (registrationId) => {
    const { registrations, shifts } = get();
    const reg = registrations.find((r) => r.id === registrationId);
    if (!reg) return;

    // Decrement count only if it was pending/approved
    const updatedShifts =
      reg.status !== "REJECTED"
        ? shifts.map((s) =>
            s.id === reg.shiftId
              ? { ...s, registeredCount: Math.max(0, s.registeredCount - 1) }
              : s
          )
        : shifts;

    set({
      registrations: registrations.filter((r) => r.id !== registrationId),
      shifts: updatedShifts,
    });
  },

  approveRegistration: (registrationId, reviewedBy) => {
    set((state) => ({
      registrations: state.registrations.map((r) =>
        r.id === registrationId
          ? {
              ...r,
              status: "APPROVED",
              reviewedBy,
              reviewedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
    // Award hours to profile
    const reg = get().registrations.find((r) => r.id === registrationId);
    if (!reg) return;
    const shift = get().shifts.find((s) => s.id === reg.shiftId);
    if (!shift) return;
    const [sh, sm] = shift.startTime.split(":").map(Number);
    const [eh, em] = shift.endTime.split(":").map(Number);
    const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === reg.staffId
          ? { ...p, accumulatedHours: p.accumulatedHours + hours }
          : p
      ),
    }));
  },

  rejectRegistration: (registrationId, reviewedBy, note) => {
    const { registrations, shifts } = get();
    const reg = registrations.find((r) => r.id === registrationId);
    if (!reg) return;

    const updatedShifts = shifts.map((s) =>
      s.id === reg.shiftId
        ? { ...s, registeredCount: Math.max(0, s.registeredCount - 1) }
        : s
    );

    set({
      registrations: registrations.map((r) =>
        r.id === registrationId
          ? {
              ...r,
              status: "REJECTED",
              reviewedBy,
              reviewedAt: new Date().toISOString(),
              rejectNote: note,
            }
          : r
      ),
      shifts: updatedShifts,
    });
  },

  getMyRegistrations: (staffId) =>
    get().registrations.filter((r) => r.staffId === staffId),

  getPendingRegistrations: () =>
    get().registrations.filter((r) => r.status === "PENDING"),

  getShiftById: (shiftId) => get().shifts.find((s) => s.id === shiftId),

  getProfileById: (staffId) => get().profiles.find((p) => p.id === staffId),

  getRegistrationStatus: (staffId, shiftId) => {
    const reg = get().registrations.find(
      (r) => r.staffId === staffId && r.shiftId === shiftId && r.status !== "REJECTED"
    );
    return reg?.status ?? null;
  },
}));

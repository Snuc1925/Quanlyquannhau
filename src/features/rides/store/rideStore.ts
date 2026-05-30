import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RideRequest, RideStatus } from "../types";
import { mockRides } from "../data/mockRides";

let _nextId = mockRides.length + 1;
const genId = () => `r-${String(++_nextId).padStart(2, "0")}`;

type RideStore = {
  rides: RideRequest[];
  addRide: (data: Omit<RideRequest, "id" | "createdAt" | "status">) => RideRequest;
  updateStatus: (id: string, status: RideStatus) => void;
};

export const useRideStore = create<RideStore>()(
  persist(
    (set, get) => ({
      rides: mockRides,

      addRide: (data) => {
        const newRide: RideRequest = {
          ...data,
          id: genId(),
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ rides: [newRide, ...s.rides] }));
        return newRide;
      },

      updateStatus: (id, status) =>
        set((s) => ({
          rides: s.rides.map((r) => (r.id === id ? { ...r, status } : r)),
        })),
    }),
    { name: "ride-store" }
  )
);

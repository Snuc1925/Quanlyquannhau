import { create } from "zustand";
import {
  mockMenuItems,
  mockReservations,
  mockTables
} from "@/features/reservations/data/mockData";
import type {
  DiningTable,
  PaymentMethod,
  PreOrderItem,
  Reservation,
  ReservationContact,
  TableHold
} from "@/features/reservations/types";

type ReservationSearch = {
  bookingDateTime: string;
  guestCount: number;
};

type ReservationState = {
  tables: DiningTable[];
  reservations: Reservation[];
  menuItems: typeof mockMenuItems;
  search: ReservationSearch;
  availableTableIds: string[];
  selectedTableId: string | null;
  hold: TableHold | null;
  contact: ReservationContact;
  paymentMethod: PaymentMethod;
  preOrders: PreOrderItem[];
  searchError: string | null;
  actionError: string | null;
  updateSearch: (payload: Partial<ReservationSearch>) => void;
  runSearch: () => void;
  selectTable: (tableId: string) => void;
  updateContact: (payload: Partial<ReservationContact>) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  updatePreOrder: (menuItemId: string, quantity: number) => void;
  submitBooking: () => Reservation;
  cancelReservation: (reservationId: string, reason: string) => void;
  sweepExpiries: () => void;
};

const FIVE_MINUTES = 5 * 60 * 1000;
const CHECK_IN_GRACE = 30 * 60 * 1000;

const emptyContact: ReservationContact = {
  fullName: "",
  phone: "",
  note: ""
};

function nextTableStatus(tableId: string, reservations: Reservation[]) {
  const hasFutureReservation = reservations.some(
    (reservation) =>
      reservation.tableId === tableId && reservation.status === "CONFIRMED"
  );
  return hasFutureReservation ? "BOOKED" : "EMPTY";
}

export const useReservationStore = create<ReservationState>((set, get) => ({
  tables: mockTables,
  reservations: mockReservations,
  menuItems: mockMenuItems,
  search: {
    bookingDateTime: "",
    guestCount: 2
  },
  availableTableIds: [],
  selectedTableId: null,
  hold: null,
  contact: emptyContact,
  paymentMethod: "cash",
  preOrders: [],
  searchError: null,
  actionError: null,

  updateSearch: (payload) => {
    set((state) => ({
      search: {
        ...state.search,
        ...payload
      }
    }));
  },

  runSearch: () => {
    const state = get();
    const { bookingDateTime, guestCount } = state.search;

    if (!bookingDateTime) {
      set({ searchError: "Vui lòng chọn ngày giờ đặt bàn", availableTableIds: [] });
      return;
    }

    const selectedTime = new Date(bookingDateTime).getTime();
    if (Number.isNaN(selectedTime) || selectedTime < Date.now()) {
      set({
        searchError: "Ngày giờ phải lớn hơn thời điểm hiện tại",
        availableTableIds: []
      });
      return;
    }

    const unavailableTableIds = new Set<string>(
      state.reservations
        .filter((reservation) => reservation.status === "CONFIRMED")
        .filter((reservation) => {
          const bookingTime = new Date(reservation.bookingDateTime).getTime();
          return Math.abs(bookingTime - selectedTime) < 90 * 60 * 1000;
        })
        .map((reservation) => reservation.tableId)
    );

    const available = state.tables
      .filter((table) => table.capacity >= guestCount)
      .filter((table) => table.status === "EMPTY")
      .filter((table) => !unavailableTableIds.has(table.id))
      .map((table) => table.id);

    if (available.length === 0) {
      set({
        searchError:
          "Hiện không còn bàn phù hợp cho khung giờ này. Vui lòng chọn giờ khác.",
        availableTableIds: []
      });
      return;
    }

    set({
      availableTableIds: available,
      searchError: null,
      actionError: null
    });
  },

  selectTable: (tableId) => {
    const state = get();
    const table = state.tables.find((item) => item.id === tableId);
    if (!table) {
      set({ actionError: "Bàn không tồn tại" });
      return;
    }

    if (!state.availableTableIds.includes(tableId) || table.status !== "EMPTY") {
      set({
        actionError:
          "Bàn vừa có người chọn hoặc không còn khả dụng. Vui lòng chọn bàn khác."
      });
      return;
    }

    set({
      selectedTableId: tableId,
      hold: {
        tableId,
        expiresAt: new Date(Date.now() + FIVE_MINUTES).toISOString()
      },
      tables: state.tables.map((item) =>
        item.id === tableId ? { ...item, status: "HELD" } : item
      ),
      actionError: null
    });
  },

  updateContact: (payload) => {
    set((state) => ({
      contact: {
        ...state.contact,
        ...payload
      }
    }));
  },

  setPaymentMethod: (method) => {
    set({ paymentMethod: method });
  },

  updatePreOrder: (menuItemId, quantity) => {
    set((state) => {
      const existing = state.preOrders.find((item) => item.menuItemId === menuItemId);
      const sanitized = Math.max(quantity, 0);

      if (!existing && sanitized > 0) {
        return {
          preOrders: [...state.preOrders, { menuItemId, quantity: sanitized }]
        };
      }

      if (existing && sanitized === 0) {
        return {
          preOrders: state.preOrders.filter((item) => item.menuItemId !== menuItemId)
        };
      }

      if (!existing) {
        return state;
      }

      return {
        preOrders: state.preOrders.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity: sanitized } : item
        )
      };
    });
  },

  submitBooking: () => {
    const state = get();

    if (!state.selectedTableId || !state.hold) {
      throw new Error("Vui lòng chọn bàn trước khi xác nhận");
    }

    if (new Date(state.hold.expiresAt).getTime() < Date.now()) {
      throw new Error("Giữ bàn đã hết hạn, vui lòng chọn lại bàn");
    }

    if (!state.contact.fullName.trim() || !state.contact.phone.trim()) {
      throw new Error("Vui lòng điền đầy đủ thông tin liên hệ");
    }

    const reservation: Reservation = {
      id: crypto.randomUUID(),
      tableId: state.selectedTableId,
      bookingDateTime: new Date(state.search.bookingDateTime).toISOString(),
      guestCount: state.search.guestCount,
      contact: state.contact,
      status: "CONFIRMED",
      preOrders: state.preOrders,
      paymentMethod: state.paymentMethod,
      createdAt: new Date().toISOString(),
      checkInDeadline: new Date(
        new Date(state.search.bookingDateTime).getTime() + CHECK_IN_GRACE
      ).toISOString()
    };

    set({
      reservations: [...state.reservations, reservation],
      tables: state.tables.map((table) =>
        table.id === reservation.tableId ? { ...table, status: "BOOKED" } : table
      ),
      selectedTableId: null,
      hold: null,
      contact: emptyContact,
      preOrders: [],
      actionError: null
    });

    return reservation;
  },

  cancelReservation: (reservationId, reason) => {
    const state = get();
    const target = state.reservations.find((item) => item.id === reservationId);
    if (!target || target.status !== "CONFIRMED") {
      return;
    }

    const nextReservations = state.reservations.map((item) =>
      item.id === reservationId
        ? { ...item, status: "CANCELLED", cancelReason: reason }
        : item
    );

    set({
      reservations: nextReservations,
      tables: state.tables.map((table) =>
        table.id === target.tableId
          ? { ...table, status: nextTableStatus(table.id, nextReservations) }
          : table
      )
    });
  },

  sweepExpiries: () => {
    const state = get();
    let nextTables = state.tables;
    let nextReservations = state.reservations;
    let nextHold = state.hold;
    let nextSelectedTableId = state.selectedTableId;
    let nextActionError: string | null = state.actionError;
    const now = Date.now();

    if (state.hold && new Date(state.hold.expiresAt).getTime() < now) {
      nextTables = state.tables.map((table) =>
        table.id === state.hold?.tableId ? { ...table, status: "EMPTY" } : table
      );
      nextHold = null;
      nextSelectedTableId = null;
      nextActionError = "Giữ bàn đã hết hạn sau 5 phút. Vui lòng chọn lại bàn.";
    }

    const expiredReservationIds = nextReservations
      .filter((reservation) => reservation.status === "CONFIRMED")
      .filter((reservation) => new Date(reservation.checkInDeadline).getTime() < now)
      .map((reservation) => reservation.id);

    if (expiredReservationIds.length > 0) {
      nextReservations = state.reservations.map((reservation) =>
        expiredReservationIds.includes(reservation.id)
          ? {
              ...reservation,
              status: "EXPIRED",
              cancelReason: "Quá 30 phút chưa check-in"
            }
          : reservation
      );
      nextTables = nextTables.map((table) => ({
        ...table,
        status: nextTableStatus(table.id, nextReservations)
      }));
    }

    if (
      nextHold !== state.hold ||
      nextSelectedTableId !== state.selectedTableId ||
      nextActionError !== state.actionError ||
      nextReservations !== state.reservations
    ) {
      set({
        hold: nextHold,
        selectedTableId: nextSelectedTableId,
        actionError: nextActionError,
        reservations: nextReservations,
        tables: nextTables
      });
    }
  }
}));

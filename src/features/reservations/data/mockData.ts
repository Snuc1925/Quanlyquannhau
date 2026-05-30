import type { DiningTable, MenuItem, Reservation } from "@/features/reservations/types";

export const mockTables: DiningTable[] = [
  { id: "t1", code: "B01", capacity: 2, status: "EMPTY" },
  { id: "t2", code: "B02", capacity: 4, status: "EMPTY" },
  { id: "t3", code: "B03", capacity: 4, status: "IN_USE" },
  { id: "t4", code: "B04", capacity: 6, status: "EMPTY" },
  { id: "t5", code: "B05", capacity: 8, status: "BOOKED" },
  { id: "t6", code: "B06", capacity: 6, status: "EMPTY" },
  { id: "t7", code: "B07", capacity: 2, status: "EMPTY" },
  { id: "t8", code: "B08", capacity: 10, status: "EMPTY" }
];

export const mockMenuItems: MenuItem[] = [
  { id: "m1", name: "Bia hơi Hà Nội", price: 18000, status: "AVAILABLE" },
  { id: "m2", name: "Lạc rang húng lìu", price: 35000, status: "AVAILABLE" },
  { id: "m3", name: "Mực nướng sa tế", price: 129000, status: "AVAILABLE" },
  { id: "m4", name: "Nem chua rán", price: 59000, status: "AVAILABLE" },
  { id: "m5", name: "Đậu phụ chiên", price: 42000, status: "OUT_OF_STOCK" },
  { id: "m6", name: "Khoai tây lắc", price: 49000, status: "AVAILABLE" }
];

export const mockReservations: Reservation[] = [
  {
    id: "r-seeded-01",
    tableId: "t5",
    bookingDateTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    guestCount: 6,
    contact: {
      fullName: "Nguyễn Văn A",
      phone: "0900000000"
    },
    status: "CONFIRMED",
    preOrders: [],
    paymentMethod: "bank",
    createdAt: new Date().toISOString(),
    checkInDeadline: new Date(Date.now() + 75 * 60 * 1000).toISOString()
  }
];

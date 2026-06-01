export type TableStatus = "EMPTY" | "HELD" | "BOOKED" | "IN_USE";
export type ReservationStatus =
  | "PENDING_DEPOSIT"
  | "PENDING_STAFF_CONFIRMATION"
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED";

export type PaymentMethod = "cash" | "bank" | "card" | "ewallet";

export type DiningTable = {
  id: string;
  code: string;
  capacity: number;
  status: TableStatus;
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  status: "AVAILABLE" | "OUT_OF_STOCK";
};

export type PreOrderItem = {
  menuItemId: string;
  quantity: number;
};

export type ReservationContact = {
  fullName: string;
  phone: string;
  note?: string;
};

export type Reservation = {
  id: string;
  tableId: string;
  bookingDateTime: string;
  guestCount: number;
  contact: ReservationContact;
  status: ReservationStatus;
  preOrders: PreOrderItem[];
  paymentMethod: PaymentMethod;
  createdAt: string;
  checkInDeadline: string;
  cancelReason?: string;
  requestedByRole?: "customer" | "staff" | "manager";
  confirmedBy?: string;
};

export type TableHold = {
  tableId: string;
  expiresAt: string;
};

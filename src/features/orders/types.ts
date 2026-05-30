import type { DiningTable } from "@/features/reservations/types";

export type { DiningTable };

export type OrderLine = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note: string;
  sentAt: string;
};

export type ActiveBill = {
  tableId: string;
  tableCode: string;
  openedAt: string;
  lines: OrderLine[];
};

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockTables } from "@/features/reservations/data/mockData";
import type { DiningTable } from "@/features/reservations/types";
import type { ActiveBill, OrderLine } from "../types";

let _lineId = 100;
const genLineId = () => `ol-${++_lineId}`;

type OrderStore = {
  tables: DiningTable[];
  bills: Record<string, ActiveBill>; // tableId → ActiveBill
  billHistory: (ActiveBill & { closedAt: string; total: number })[];

  openTable: (tableId: string) => void;
  sendOrder: (tableId: string, lines: Omit<OrderLine, "id" | "sentAt">[]) => void;
  removeOrderLine: (tableId: string, lineId: string) => void;
  closeTable: (tableId: string) => void;
};

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      tables: mockTables,
      bills: {},
      billHistory: [],

      openTable: (tableId) =>
        set((s) => {
          const table = s.tables.find((t) => t.id === tableId);
          if (!table) return s;
          // If already in_use, just re-select (handled in UI); if empty → open it
          const updatedTables =
            table.status === "EMPTY"
              ? s.tables.map((t) =>
                  t.id === tableId ? { ...t, status: "IN_USE" as const } : t
                )
              : s.tables;

          const bills = { ...s.bills };
          if (!bills[tableId]) {
            bills[tableId] = {
              tableId,
              tableCode: table.code,
              openedAt: new Date().toISOString(),
              lines: [],
            };
          }
          return { tables: updatedTables, bills };
        }),

      sendOrder: (tableId, newLines) =>
        set((s) => {
          const bill = s.bills[tableId];
          if (!bill) return s;
          const now = new Date().toISOString();
          const lines: OrderLine[] = newLines.map((l) => ({
            ...l,
            id: genLineId(),
            sentAt: now,
          }));
          return {
            bills: {
              ...s.bills,
              [tableId]: { ...bill, lines: [...bill.lines, ...lines] },
            },
          };
        }),

      removeOrderLine: (tableId, lineId) =>
        set((s) => {
          const bill = s.bills[tableId];
          if (!bill) return s;
          return {
            bills: {
              ...s.bills,
              [tableId]: {
                ...bill,
                lines: bill.lines.filter((l) => l.id !== lineId),
              },
            },
          };
        }),

      closeTable: (tableId) =>
        set((s) => {
          const bill = s.bills[tableId];
          const total = bill
            ? bill.lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
            : 0;
          const history = bill
            ? [
                ...s.billHistory,
                { ...bill, closedAt: new Date().toISOString(), total },
              ]
            : s.billHistory;
          const bills = { ...s.bills };
          delete bills[tableId];
          return {
            tables: s.tables.map((t) =>
              t.id === tableId ? { ...t, status: "EMPTY" as const } : t
            ),
            bills,
            billHistory: history,
          };
        }),
    }),
    { name: "order-store" }
  )
);

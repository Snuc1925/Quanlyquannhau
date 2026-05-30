import { create } from "zustand";
import type {
  Invoice,
  ClosingRecord,
  PaymentMethod,
  PaymentSummary,
  ReconciliationDraft,
} from "../types";
import { mockInvoices } from "../data/mockInvoices";

type RevenueState = {
  invoices: Invoice[];
  closings: ClosingRecord[];
  draft: ReconciliationDraft;
  hasOpenTables: boolean;
};

type RevenueActions = {
  updateDraft: (updates: Partial<ReconciliationDraft>) => void;
  clearDraft: () => void;
  checkOpenTables: () => boolean;
  calculateSystemSummary: () => PaymentSummary[];
  confirmClosing: (type: "SHIFT" | "DAY", closedBy: string) => ClosingRecord;
  getOpenInvoices: () => Invoice[];
  getClosedInvoices: () => Invoice[];
};

const initialDraft: ReconciliationDraft = {
  openingCashFund: 500000, // 500k VND default
  actualCash: 0,
  actualBank: 0,
  actualCard: 0,
  actualEwallet: 0,
  notes: "",
};

export const useRevenueStore = create<RevenueState & RevenueActions>(
  (set, get) => ({
    invoices: mockInvoices,
    closings: [],
    draft: initialDraft,
    hasOpenTables: false,

    updateDraft: (updates) => {
      set((state) => ({
        draft: { ...state.draft, ...updates },
      }));
    },

    clearDraft: () => {
      set({ draft: initialDraft });
    },

    checkOpenTables: () => {
      const { invoices } = get();
      const hasOpen = invoices.some((inv) => inv.status === "OPEN");
      set({ hasOpenTables: hasOpen });
      return hasOpen;
    },

    calculateSystemSummary: () => {
      const { invoices } = get();
      const openInvoices = invoices.filter((inv) => inv.status === "PAID");

      const methodTotals: Record<PaymentMethod, number> = {
        cash: 0,
        bank: 0,
        card: 0,
        ewallet: 0,
      };

      openInvoices.forEach((inv) => {
        methodTotals[inv.paymentMethod] += inv.grandTotal;
      });

      const { draft } = get();

      const summaries: PaymentSummary[] = [
        {
          method: "cash",
          systemAmount: methodTotals.cash,
          actualAmount: draft.actualCash,
          discrepancy: draft.actualCash - methodTotals.cash,
        },
        {
          method: "bank",
          systemAmount: methodTotals.bank,
          actualAmount: draft.actualBank,
          discrepancy: draft.actualBank - methodTotals.bank,
        },
        {
          method: "card",
          systemAmount: methodTotals.card,
          actualAmount: draft.actualCard,
          discrepancy: draft.actualCard - methodTotals.card,
        },
        {
          method: "ewallet",
          systemAmount: methodTotals.ewallet,
          actualAmount: draft.actualEwallet,
          discrepancy: draft.actualEwallet - methodTotals.ewallet,
        },
      ];

      return summaries;
    },

    confirmClosing: (type, closedBy) => {
      const { invoices, closings, draft } = get();

      const openInvoices = invoices.filter((inv) => inv.status === "PAID");
      if (openInvoices.length === 0) {
        throw new Error("Không có hóa đơn nào để chốt sổ");
      }

      const summaries = get().calculateSystemSummary();

      const grandTotal = summaries.reduce((sum, s) => sum + s.systemAmount, 0);
      const actualGrandTotal = summaries.reduce(
        (sum, s) => sum + s.actualAmount,
        0
      );
      const discrepancyTotal = actualGrandTotal - grandTotal;

      const closingId = `close-${Date.now()}`;
      const newClosing: ClosingRecord = {
        id: closingId,
        type,
        closedAt: new Date().toISOString(),
        closedBy,
        openingCashFund: draft.openingCashFund,
        invoiceCount: openInvoices.length,
        paymentSummaries: summaries,
        grandTotal,
        actualGrandTotal,
        discrepancyTotal,
        notes: draft.notes,
        status: "CONFIRMED",
      };

      // Lock all PAID invoices → CLOSED
      const updatedInvoices = invoices.map((inv) =>
        inv.status === "PAID"
          ? { ...inv, status: "CLOSED" as const, closingId }
          : inv
      );

      set({
        invoices: updatedInvoices,
        closings: [...closings, newClosing],
        draft: initialDraft,
        hasOpenTables: false,
      });

      return newClosing;
    },

    getOpenInvoices: () => {
      return get().invoices.filter((inv) => inv.status === "PAID");
    },

    getClosedInvoices: () => {
      return get().invoices.filter((inv) => inv.status === "CLOSED");
    },
  })
);

export type PaymentMethod = "cash" | "bank" | "card" | "ewallet";

export type Invoice = {
  id: string;
  tableCode: string;
  createdAt: string;
  closedAt: string | null;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  status: "OPEN" | "PAID" | "CLOSED";
  closingId: string | null;
};

export type PaymentSummary = {
  method: PaymentMethod;
  systemAmount: number;
  actualAmount: number;
  discrepancy: number;
};

export type ClosingRecord = {
  id: string;
  type: "SHIFT" | "DAY";
  closedAt: string;
  closedBy: string;
  openingCashFund: number;
  invoiceCount: number;
  paymentSummaries: PaymentSummary[];
  grandTotal: number;
  actualGrandTotal: number;
  discrepancyTotal: number;
  notes: string;
  status: "DRAFT" | "CONFIRMED" | "PENDING_APPROVAL" | "APPROVED";
  approvedBy?: string;
  approvedAt?: string;
};

export type ReconciliationDraft = {
  openingCashFund: number;
  actualCash: number;
  actualBank: number;
  actualCard: number;
  actualEwallet: number;
  notes: string;
};

import { useMemo } from "react";
import { Badge, Card, DataTable } from "@/components/ui";
import type { Invoice } from "../types";

type InvoiceListProps = {
  invoices: Invoice[];
  title: string;
  subtitle: string;
};

const paymentLabels: Record<string, string> = {
  cash: "💵 Tiền mặt",
  bank: "🏦 Chuyển khoản",
  card: "💳 Thẻ",
  ewallet: "📱 Ví điện tử",
};

export function InvoiceList({ invoices, title, subtitle }: InvoiceListProps) {
  const sorted = useMemo(
    () =>
      [...invoices].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [invoices]
  );

  const columns = [
    {
      key: "id",
      title: "Mã HĐ",
      render: (row: Invoice) => (
        <span style={{ fontFamily: "monospace", fontSize: "var(--fs-sm)" }}>
          {row.id}
        </span>
      ),
    },
    {
      key: "table",
      title: "Bàn",
      render: (row: Invoice) => (
        <strong style={{ color: "var(--c-primary-600)" }}>
          {row.tableCode}
        </strong>
      ),
    },
    {
      key: "createdAt",
      title: "Giờ tạo",
      render: (row: Invoice) =>
        new Date(row.createdAt).toLocaleTimeString("vi-VN", { hour12: false }),
    },
    {
      key: "closedAt",
      title: "Giờ thanh toán",
      render: (row: Invoice) =>
        row.closedAt
          ? new Date(row.closedAt).toLocaleTimeString("vi-VN", {
              hour12: false,
            })
          : "—",
    },
    {
      key: "payment",
      title: "Phương thức",
      render: (row: Invoice) => paymentLabels[row.paymentMethod],
    },
    {
      key: "total",
      title: "Tổng tiền (₫)",
      render: (row: Invoice) => (
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: "var(--fw-semi)",
            fontSize: "var(--fs-lg)",
          }}
        >
          {row.grandTotal.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (row: Invoice) => {
        if (row.status === "CLOSED") {
          return <Badge variant="default">🔒 Đã chốt</Badge>;
        }
        if (row.status === "PAID") {
          return <Badge variant="success">✓ Đã thanh toán</Badge>;
        }
        return <Badge variant="warning">⏳ Đang mở</Badge>;
      },
    },
  ];

  return (
    <Card title={title} subtitle={subtitle}>
      <DataTable
        data={sorted}
        columns={columns}
        emptyText="Không có hóa đơn nào"
      />
    </Card>
  );
}

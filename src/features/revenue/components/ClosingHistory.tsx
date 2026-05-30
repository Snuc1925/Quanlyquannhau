import { useMemo } from "react";
import { Badge, Card, DataTable } from "@/components/ui";
import type { ClosingRecord } from "../types";

type ClosingHistoryProps = {
  closings: ClosingRecord[];
};

export function ClosingHistory({ closings }: ClosingHistoryProps) {
  const sorted = useMemo(
    () =>
      [...closings].sort(
        (a, b) =>
          new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
      ),
    [closings]
  );

  const columns = [
    {
      key: "id",
      title: "Mã",
      render: (row: ClosingRecord) => (
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "var(--fs-sm)",
            color: "var(--c-gray-600)",
          }}
        >
          {row.id.slice(0, 12)}
        </span>
      ),
    },
    {
      key: "type",
      title: "Loại",
      render: (row: ClosingRecord) => (
        <Badge variant={row.type === "DAY" ? "info" : "default"}>
          {row.type === "DAY" ? "🌙 Chốt ngày" : "⏰ Chốt ca"}
        </Badge>
      ),
    },
    {
      key: "closedAt",
      title: "Thời gian",
      render: (row: ClosingRecord) =>
        new Date(row.closedAt).toLocaleString("vi-VN", { hour12: false }),
    },
    {
      key: "closedBy",
      title: "Người chốt",
      render: (row: ClosingRecord) => row.closedBy,
    },
    {
      key: "invoices",
      title: "Số HĐ",
      render: (row: ClosingRecord) => (
        <span style={{ fontWeight: "var(--fw-semi)" }}>
          {row.invoiceCount}
        </span>
      ),
    },
    {
      key: "grandTotal",
      title: "Doanh thu (₫)",
      render: (row: ClosingRecord) => (
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: "var(--fw-semi)",
            color: "var(--c-primary-600)",
          }}
        >
          {row.grandTotal.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "discrepancy",
      title: "Chênh lệch",
      render: (row: ClosingRecord) => {
        if (row.discrepancyTotal === 0) {
          return <Badge variant="success">✓ Khớp</Badge>;
        }
        const isOver = row.discrepancyTotal > 0;
        return (
          <Badge variant={isOver ? "info" : "warning"}>
            {isOver ? "+" : ""}
            {row.discrepancyTotal.toLocaleString("vi-VN")} ₫
          </Badge>
        );
      },
    },
  ];

  return (
    <Card
      title="📜 Lịch sử chốt sổ"
      subtitle="Danh sách các lần chốt ca/ngày · Dữ liệu đã khóa"
    >
      <DataTable
        data={sorted}
        columns={columns}
        emptyText="Chưa có lần chốt sổ nào"
      />
    </Card>
  );
}

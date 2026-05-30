import { useMemo } from "react";
import { Badge, Card, DataTable } from "@/components/ui";
import type { Ingredient } from "../types";

type StockTableProps = {
  ingredients: Ingredient[];
};

export function StockTable({ ingredients }: StockTableProps) {
  const sorted = useMemo(
    () => [...ingredients].sort((a, b) => a.name.localeCompare(b.name)),
    [ingredients]
  );

  const columns = [
    {
      key: "name",
      title: "Nguyên liệu",
      render: (row: Ingredient) => (
        <div>
          <div style={{ fontWeight: "var(--fw-semi)", color: "var(--c-gray-900)" }}>
            {row.name}
          </div>
          <div className="text-muted">
            Đơn vị: {row.unit} {row.hasExpiry ? "⏰" : ""}
          </div>
        </div>
      ),
    },
    {
      key: "stock",
      title: "Tồn kho",
      render: (row: Ingredient) => (
        <span style={{ fontWeight: "var(--fw-semi)", fontSize: "var(--fs-lg)" }}>
          {row.currentStock}
        </span>
      ),
    },
    {
      key: "minStock",
      title: "Mức tối thiểu",
      render: (row: Ingredient) => row.minStock,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (row: Ingredient) => {
        if (row.currentStock === 0) {
          return <Badge variant="danger">⛔️ Hết hàng</Badge>;
        }
        if (row.currentStock <= row.minStock) {
          return <Badge variant="warning">⚠️ Sắp hết</Badge>;
        }
        return <Badge variant="success">✅ Đủ hàng</Badge>;
      },
    },
  ];

  return (
    <Card title="📊 Tồn kho hiện tại" subtitle="Theo dõi số lượng và cảnh báo thiếu hàng">
      <DataTable
        data={sorted}
        columns={columns}
        emptyText="Chưa có nguyên liệu nào trong kho"
      />
    </Card>
  );
}

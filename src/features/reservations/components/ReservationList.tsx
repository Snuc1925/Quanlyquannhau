import { useMemo, useState } from "react";
import { Badge, Button, Card, DataTable, Modal } from "@/components/ui";
import type { DiningTable, Reservation } from "@/features/reservations/types";

type ReservationListProps = {
  reservations: Reservation[];
  tables: DiningTable[];
  onCancel: (reservationId: string, reason: string) => void;
};

const statusMap: Record<
  Reservation["status"],
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  PENDING_STAFF_CONFIRMATION: { label: "🕒 Chờ nhân viên xác nhận", variant: "info" },
  PENDING_DEPOSIT: { label: "⏳ Chờ cọc",  variant: "warning" },
  CONFIRMED:       { label: "✅ Đã đặt",   variant: "success" },
  CANCELLED:       { label: "❌ Đã hủy",   variant: "danger"  },
  EXPIRED:         { label: "⚠️ Quá hạn", variant: "warning" }
};

export function ReservationList({
  reservations,
  tables,
  onCancel
}: ReservationListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tableCodeMap = useMemo(
    () => new Map(tables.map((t) => [t.id, t.code])),
    [tables]
  );

  const sorted = useMemo(
    () =>
      [...reservations].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [reservations]
  );

  const columns = [
    {
      key: "contact",
      title: "Khách hàng",
      render: (row: Reservation) => (
        <div>
          <div style={{ fontWeight: "var(--fw-semi)", color: "var(--c-gray-900)" }}>
            {row.contact.fullName}
          </div>
          <div className="text-muted">{row.contact.phone}</div>
        </div>
      )
    },
    {
      key: "table",
      title: "Bàn",
      render: (row: Reservation) => (
        <span style={{ fontWeight: "var(--fw-semi)", color: "var(--c-primary-600)" }}>
          {tableCodeMap.get(row.tableId) ?? row.tableId}
        </span>
      )
    },
    {
      key: "bookingDateTime",
      title: "Giờ hẹn",
      render: (row: Reservation) =>
        new Date(row.bookingDateTime).toLocaleString("vi-VN", { hour12: false })
    },
    {
      key: "guests",
      title: "Khách",
      render: (row: Reservation) => `${row.guestCount} người`
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (row: Reservation) => (
        <Badge variant={statusMap[row.status].variant}>
          {statusMap[row.status].label}
        </Badge>
      )
    },
    {
      key: "action",
      title: "",
      render: (row: Reservation) =>
        row.status === "CONFIRMED" ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setSelectedId(row.id)}
          >
            Hủy
          </Button>
        ) : (
          <span className="text-muted" style={{ fontSize: "var(--fs-xs)" }}>
            {row.cancelReason ?? "—"}
          </span>
        )
    }
  ];

  return (
    <>
      <Card title="📋 Lịch đặt bàn" subtitle="Tất cả các lịch đặt · theo thứ tự mới nhất">
        <DataTable data={sorted} columns={columns} emptyText="Chưa có lịch đặt bàn nào" />
      </Card>

      <Modal
        open={Boolean(selectedId)}
        title="Xác nhận hủy đặt bàn"
        onClose={() => setSelectedId(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedId(null)}>
              Giữ nguyên
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selectedId) onCancel(selectedId, "Khách chủ động hủy bàn");
                setSelectedId(null);
              }}
            >
              Xác nhận hủy
            </Button>
          </>
        }
      >
        <p style={{ color: "var(--c-gray-600)", lineHeight: 1.7 }}>
          Bàn sẽ được trả về trạng thái{" "}
          <strong style={{ color: "var(--c-success)" }}>Trống</strong> và sẵn sàng phục vụ khách khác.
        </p>
      </Modal>
    </>
  );
}

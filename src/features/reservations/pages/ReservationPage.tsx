import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, StatusView } from "@/components/ui";
import { useToast } from "@/app/providers/ToastProvider";
import { TableMap } from "@/features/reservations/components/TableMap";
import { PreOrderMenu } from "@/features/reservations/components/PreOrderMenu";
import { ReservationList } from "@/features/reservations/components/ReservationList";
import { useReservationStore } from "@/features/reservations/store/reservationStore";
import type { PaymentMethod } from "@/features/reservations/types";

const paymentOptions: { label: string; value: PaymentMethod; icon: string }[] = [
  { label: "Tiền mặt",     value: "cash",    icon: "💵" },
  { label: "Chuyển khoản", value: "bank",    icon: "🏦" },
  { label: "Thẻ",          value: "card",    icon: "💳" },
  { label: "Ví điện tử",   value: "ewallet", icon: "📱" }
];

export function ReservationPage() {
  const {
    tables, reservations, menuItems, search,
    availableTableIds, selectedTableId, hold,
    contact, paymentMethod, preOrders,
    searchError, actionError,
    updateSearch, runSearch, selectTable,
    updateContact, setPaymentMethod, updatePreOrder,
    submitBooking, cancelReservation, sweepExpiries
  } = useReservationStore();

  const { pushToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTs(Date.now());
      sweepExpiries();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sweepExpiries]);

  const holdSecondsLeft = useMemo(() => {
    if (!hold) return 0;
    return Math.max(0, Math.floor((new Date(hold.expiresAt).getTime() - nowTs) / 1000));
  }, [hold, nowTs]);

  const holdLabel = useMemo(() => {
    const m = Math.floor(holdSecondsLeft / 60);
    const s = holdSecondsLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [holdSecondsLeft]);

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) ?? null,
    [selectedTableId, tables]
  );

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    try {
      await new Promise((r) => window.setTimeout(r, 700));
      const reservation = submitBooking();
      pushToast({
        kind: "success",
        title: "🎉 Đặt bàn thành công!",
        description: `Mã đặt bàn: ${reservation.id.slice(0, 8).toUpperCase()}`
      });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Không thể xác nhận",
        description: err instanceof Error ? err.message : "Lỗi không xác định"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>

      {/* ── STEP 1: Search ── */}
      <Card
        title="Tìm bàn khả dụng"
        subtitle="Chọn thời gian và số lượng khách để xem bàn trống"
        stepNumber={1}
        stepDone={availableTableIds.length > 0}
      >
        <div className="grid grid-3" style={{ alignItems: "end", gap: "var(--sp-4)" }}>
          <Input
            id="bookingDate"
            type="datetime-local"
            label="Ngày giờ đặt bàn"
            value={search.bookingDateTime}
            onChange={(e) => updateSearch({ bookingDateTime: e.target.value })}
          />
          <Input
            id="guestCount"
            type="number"
            min={1}
            max={20}
            label="Số lượng khách"
            value={search.guestCount}
            onChange={(e) => updateSearch({ guestCount: Number(e.target.value) || 1 })}
          />
          <Button onClick={runSearch} size="lg">
            🔍 Tìm bàn
          </Button>
        </div>

        {searchError ? (
          <div style={{ marginTop: "var(--sp-4)" }}>
            <StatusView kind="error" title="Không tìm thấy bàn phù hợp" description={searchError} />
          </div>
        ) : null}
      </Card>

      {/* ── STEP 2: Select Table ── */}
      <Card
        title="Chọn bàn"
        subtitle="Nhấn vào bàn trống để chọn · Bàn sẽ được giữ trong 5 phút"
        stepNumber={2}
        stepDone={Boolean(selectedTableId)}
        action={
          hold ? (
            <div className="countdown-chip">
              <span className="dot" />
              Giữ bàn còn {holdLabel}
            </div>
          ) : null
        }
      >
        {availableTableIds.length === 0 ? (
          <StatusView
            kind="empty"
            title="Chưa tìm bàn"
            description="Vui lòng hoàn thành bước 1 để xem bàn khả dụng."
          />
        ) : (
          <TableMap
            tables={tables}
            availableTableIds={availableTableIds}
            selectedTableId={selectedTableId}
            onSelect={selectTable}
          />
        )}

        {selectedTable ? (
          <div style={{
            marginTop: "var(--sp-4)",
            padding: "var(--sp-3) var(--sp-4)",
            background: "var(--c-primary-50)",
            border: "1px solid var(--c-primary-100)",
            borderRadius: "var(--r-sm)",
            fontSize: "var(--fs-sm)",
            color: "var(--c-primary-700)",
            fontWeight: "var(--fw-medium)"
          }}>
            🪑 Đã chọn bàn <strong>{selectedTable.code}</strong> — tối đa {selectedTable.capacity} khách
          </div>
        ) : null}

        {actionError ? (
          <div style={{ marginTop: "var(--sp-3)" }}>
            <StatusView kind="error" title="Cảnh báo" description={actionError} />
          </div>
        ) : null}
      </Card>

      {/* ── STEP 3: Pre-order ── */}
      <PreOrderMenu
        menuItems={menuItems}
        preOrders={preOrders}
        onChangeQuantity={updatePreOrder}
      />

      {/* ── STEP 4: Contact + Confirm ── */}
      <Card
        title="Thông tin liên hệ & Xác nhận"
        subtitle="Điền thông tin và chọn phương thức đặt cọc"
        stepNumber={4}
      >
        <div className="grid grid-2" style={{ marginBottom: "var(--sp-4)" }}>
          <Input
            id="fullName"
            label="Họ tên khách"
            value={contact.fullName}
            onChange={(e) => updateContact({ fullName: e.target.value })}
            placeholder="Nguyễn Văn A"
            required
          />
          <Input
            id="phone"
            label="Số điện thoại"
            type="tel"
            value={contact.phone}
            onChange={(e) => updateContact({ phone: e.target.value })}
            placeholder="09x xxx xxxx"
            required
          />
        </div>
        <Input
          id="note"
          label="Ghi chú (tuỳ chọn)"
          value={contact.note ?? ""}
          onChange={(e) => updateContact({ note: e.target.value })}
          placeholder="Không cay, ngồi ngoài trời, sinh nhật..."
        />

        <div className="divider" />

        {/* Payment picker */}
        <div className="field-label" style={{ marginBottom: "var(--sp-3)" }}>
          Phương thức đặt cọc
        </div>
        <div className="payment-grid">
          {paymentOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={`payment-option${paymentMethod === opt.value ? " selected" : ""}`}
              onClick={() => setPaymentMethod(opt.value)}
            >
              <span className="payment-icon">{opt.icon}</span>
              <span className="payment-label">{opt.label}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: "var(--sp-5)" }}>
          <Button
            size="lg"
            fullWidth
            disabled={submitting || !selectedTableId}
            onClick={handleSubmitBooking}
          >
            {submitting ? "⏳ Đang xác nhận..." : "✅ Xác nhận đặt bàn"}
          </Button>
          {!selectedTableId ? (
            <p style={{ textAlign: "center", fontSize: "var(--fs-sm)", color: "var(--c-gray-400)", marginTop: "var(--sp-2)" }}>
              Vui lòng chọn bàn ở bước 2 trước
            </p>
          ) : null}
        </div>
      </Card>

      {/* ── Reservation list ── */}
      <ReservationList
        reservations={reservations}
        tables={tables}
        onCancel={(id, reason) => {
          cancelReservation(id, reason);
          pushToast({ kind: "info", title: "Đã hủy đặt bàn", description: "Bàn đã được trả về trạng thái Trống." });
        }}
      />
    </div>
  );
}

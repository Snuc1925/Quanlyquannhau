import { useEffect, useMemo, useState } from "react";
import { Input, StatusView } from "@/components/ui";
import { useToast } from "@/app/providers/ToastProvider";
import { TableMap } from "@/features/reservations/components/TableMap";
import { PreOrderMenu } from "@/features/reservations/components/PreOrderMenu";
import { ReservationList } from "@/features/reservations/components/ReservationList";
import { useReservationStore } from "@/features/reservations/store/reservationStore";
import type { PaymentMethod } from "@/features/reservations/types";

/* ────────────────────────────────────────────────────────
   Constants
──────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Thời Gian" },
  { id: 2, label: "Chọn Bàn" },
  { id: 3, label: "Gọi Món" },
  { id: 4, label: "Xác Nhận" },
];

const paymentOptions: { label: string; value: PaymentMethod; icon: string }[] = [
  { label: "Tiền mặt",     value: "cash",    icon: "💵" },
  { label: "Chuyển khoản", value: "bank",    icon: "🏦" },
  { label: "Thẻ",          value: "card",    icon: "💳" },
  { label: "Ví điện tử",   value: "ewallet", icon: "📱" },
];

const DEPOSIT_RATE = 0.3;

/* ────────────────────────────────────────────────────────
   Component
──────────────────────────────────────────────────────── */
export function ReservationPage() {
  const {
    tables, reservations, menuItems, search,
    availableTableIds, selectedTableId, hold,
    contact, paymentMethod, preOrders,
    searchError, actionError,
    updateSearch, runSearch, selectTable,
    updateContact, setPaymentMethod, updatePreOrder,
    submitBooking, cancelReservation, sweepExpiries,
  } = useReservationStore();

  const { pushToast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [nowTs, setNowTs] = useState(Date.now());

  /* countdown timer */
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

  /* pre-order totals */
  const preOrderTotal = useMemo(() => {
    const itemMap = new Map(menuItems.map((m) => [m.id, m.price]));
    return preOrders.reduce(
      (sum, po) => sum + (itemMap.get(po.menuItemId) ?? 0) * po.quantity,
      0
    );
  }, [preOrders, menuItems]);

  const depositAmount = Math.round(preOrderTotal * DEPOSIT_RATE);

  /* step guards */
  const canGoStep2 = availableTableIds.length > 0;
  const canGoStep3 = Boolean(selectedTableId);
  const canGoStep4 = Boolean(selectedTableId);

  const handleNext = () => {
    if (step === 1) {
      if (!canGoStep2) { runSearch(); return; }
      setStep(2);
    } else if (step === 2) {
      if (!canGoStep3) {
        pushToast({ kind: "error", title: "Chưa chọn bàn", description: "Vui lòng chọn một bàn trước khi tiếp tục." });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!contact.fullName.trim() || !contact.phone.trim()) {
      pushToast({ kind: "error", title: "Thiếu thông tin", description: "Vui lòng nhập họ tên và số điện thoại." });
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => window.setTimeout(r, 700));
      const reservation = submitBooking();
      pushToast({
        kind: "success",
        title: "🎉 Đặt bàn thành công!",
        description: `Mã đặt bàn: ${reservation.id.slice(0, 8).toUpperCase()}`,
      });
      setStep(1);
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Không thể xác nhận",
        description: err instanceof Error ? err.message : "Lỗi không xác định",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── helpers ── */
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";
  const fmtDt = (dt: string) => {
    if (!dt) return "—";
    try {
      return new Date(dt).toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return dt; }
  };

  /* ── render ── */
  return (
    <div className="wizard-page">
      {/* ══ Top header ══════════════════════════════ */}
      <div className="wizard-page-header">
        <div>
          <h1 className="wizard-page-title">📅 Đặt Bàn Trước</h1>
          <p className="wizard-page-sub">Chọn bàn, gọi món và thanh toán đặt cọc để sử dụng</p>
        </div>
      </div>

      {/* ══ Stepper ══════════════════════════════════ */}
      <div className="wizard-stepper">
        {STEPS.map((s, idx) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className={`wizard-step${active ? " active" : ""}${done ? " done" : ""}`}>
              {idx > 0 && <div className={`wizard-connector${done || active ? " filled" : ""}`} />}
              <div className="wizard-step-circle">
                {done ? "✓" : s.id}
              </div>
              <span className="wizard-step-label">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* ══ Body: content + summary ══════════════════ */}
      <div className="wizard-body">

        {/* ── LEFT: step content ──────────────────── */}
        <div className="wizard-content">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="wizard-step-panel">
              <div className="wizard-step-heading">
                <span className="wizard-step-num">1</span>
                <span>Chọn Thời Gian &amp; Số Người</span>
              </div>
              <div className="wizard-fields-grid">
                <div className="field-group">
                  <label className="field-label">Ngày giờ <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="datetime-local"
                    className="field-input"
                    value={search.bookingDateTime}
                    onChange={(e) => updateSearch({ bookingDateTime: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Số lượng khách <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="number"
                    className="field-input"
                    min={1}
                    max={20}
                    value={search.guestCount}
                    onChange={(e) => updateSearch({ guestCount: Number(e.target.value) || 1 })}
                  />
                </div>
              </div>
              {searchError && (
                <div className="wizard-alert wizard-alert--error">
                  ⚠️ {searchError}
                </div>
              )}
              {canGoStep2 && (
                <div className="wizard-alert wizard-alert--success">
                  ✅ Tìm thấy {availableTableIds.length} bàn khả dụng — hãy chọn bàn ở bước tiếp theo
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="wizard-step-panel">
              <div className="wizard-step-heading">
                <span className="wizard-step-num">2</span>
                <span>Chọn vị trí bàn</span>
                {hold && (
                  <div className="countdown-chip" style={{ marginLeft: "auto" }}>
                    <span className="dot" />
                    Giữ bàn còn {holdLabel}
                  </div>
                )}
              </div>
              <TableMap
                tables={tables}
                availableTableIds={availableTableIds}
                selectedTableId={selectedTableId}
                onSelect={selectTable}
              />
              {actionError && (
                <div className="wizard-alert wizard-alert--error">
                  ⚠️ {actionError}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="wizard-step-panel">
              <div className="wizard-step-heading">
                <span className="wizard-step-num">3</span>
                <span>Gọi Món Trước (tuỳ chọn)</span>
              </div>
              <PreOrderMenu
                menuItems={menuItems}
                preOrders={preOrders}
                onChangeQuantity={updatePreOrder}
              />
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="wizard-step-panel">
              <div className="wizard-step-heading">
                <span className="wizard-step-num">4</span>
                <span>Thông tin khách hàng</span>
              </div>
              <div className="wizard-fields-grid">
                <div className="field-group">
                  <label className="field-label">Họ và tên <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    className="field-input"
                    placeholder="Nguyễn Văn A"
                    value={contact.fullName}
                    onChange={(e) => updateContact({ fullName: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Số điện thoại <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    className="field-input"
                    type="tel"
                    placeholder="09x xxx xxxx"
                    value={contact.phone}
                    onChange={(e) => updateContact({ phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="field-group" style={{ marginTop: "var(--sp-3)" }}>
                <label className="field-label">Ghi chú đặc biệt</label>
                <textarea
                  className="field-input field-textarea"
                  rows={3}
                  placeholder="Ví dụ: không cay, có bé nhỏ, sinh nhật..."
                  value={contact.note ?? ""}
                  onChange={(e) => updateContact({ note: e.target.value })}
                />
              </div>

              {/* order detail */}
              {preOrders.length > 0 && (
                <div className="wizard-order-detail">
                  <div className="wizard-order-detail-header">
                    📋 Chi tiết món đã chọn
                    <button
                      className="wizard-link-btn"
                      onClick={() => setStep(3)}
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                  {preOrders
                    .filter((po) => po.quantity > 0)
                    .map((po) => {
                      const item = menuItems.find((m) => m.id === po.menuItemId);
                      if (!item) return null;
                      return (
                        <div key={po.menuItemId} className="wizard-order-line">
                          <span>#{item.name}</span>
                          <span>×{po.quantity}</span>
                          <span>{fmt(item.price * po.quantity)}</span>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* payment method */}
              <div style={{ marginTop: "var(--sp-5)" }}>
                <p className="field-label" style={{ marginBottom: "var(--sp-3)" }}>
                  Phương thức thanh toán cọc
                </p>
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
              </div>
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div className="wizard-nav">
            {step > 1 && (
              <button className="btn btn-outline wizard-back-btn" onClick={handleBack}>
                ← Quay lại
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step === 1 && !canGoStep2 && (
              <button className="btn btn-primary" onClick={() => { runSearch(); }}>
                🔍 Tìm bàn →
              </button>
            )}
            {step === 1 && canGoStep2 && (
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Tiếp theo →
              </button>
            )}
            {step === 2 && (
              <button
                className="btn btn-primary"
                disabled={!canGoStep3}
                onClick={handleNext}
              >
                Tiếp theo →
              </button>
            )}
            {step === 3 && (
              <button className="btn btn-primary" onClick={() => setStep(4)}>
                Tiếp theo →
              </button>
            )}
            {step === 4 && (
              <button
                className="btn btn-primary"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "⏳ Đang xử lý..." : "✅ Xác nhận đặt bàn"}
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: booking summary ──────────────── */}
        <div className="wizard-summary">
          <div className="wizard-summary-title">📋 Thông Tin Đặt Bàn</div>

          <div className="wizard-summary-rows">
            <div className="wizard-summary-row">
              <span className="ws-label">Ngày &amp; giờ</span>
              <span className="ws-value">{search.bookingDateTime ? fmtDt(search.bookingDateTime) : "—"}</span>
            </div>
            <div className="wizard-summary-row">
              <span className="ws-label">Số khách</span>
              <span className="ws-value">{search.guestCount} người</span>
            </div>
            <div className="wizard-summary-row">
              <span className="ws-label">Bàn đã chọn</span>
              <span className="ws-value">
                {selectedTable
                  ? <span className="ws-badge">{selectedTable.code}</span>
                  : <span className="ws-placeholder">Chưa chọn</span>}
              </span>
            </div>
            <div className="wizard-summary-row">
              <span className="ws-label">Món đã chọn</span>
              <span className="ws-value">
                {preOrders.filter((p) => p.quantity > 0).length > 0
                  ? `${preOrders.filter((p) => p.quantity > 0).length} loại`
                  : <span className="ws-placeholder">Chưa có món</span>}
              </span>
            </div>
          </div>

          <div className="wizard-summary-divider" />

          <div className="wizard-summary-totals">
            <div className="wizard-total-row">
              <span>Tiền bàn</span>
              <span>0₫</span>
            </div>
            <div className="wizard-total-row">
              <span>Tiền món ăn</span>
              <span>{fmt(preOrderTotal)}</span>
            </div>
            <div className="wizard-total-row wizard-total-grand">
              <span>Tổng cộng</span>
              <span>{fmt(preOrderTotal)}</span>
            </div>
          </div>

          <div className="wizard-deposit-box">
            <span className="ws-label">Tiền cọc (30%)</span>
            <span className="wizard-deposit-amount">
              {depositAmount > 0 ? fmt(depositAmount) : "0₫"}
            </span>
          </div>
        </div>
      </div>

      {/* ══ Reservation list (below wizard) ══════════ */}
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

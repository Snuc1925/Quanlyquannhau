import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import { useAuthStore } from "@/features/auth/store/authStore";
import { TableMap } from "@/features/reservations/components/TableMap";
import { PreOrderMenu } from "@/features/reservations/components/PreOrderMenu";
import { useReservationStore } from "@/features/reservations/store/reservationStore";
import type { PaymentMethod, Reservation } from "@/features/reservations/types";

const paymentOptions: { label: string; value: PaymentMethod; icon: string }[] = [
  { label: "Tiền mặt", value: "cash", icon: "💵" },
  { label: "Chuyển khoản", value: "bank", icon: "🏦" },
  { label: "Thẻ", value: "card", icon: "💳" },
  { label: "Ví điện tử", value: "ewallet", icon: "📱" }
];

const statusMeta: Record<Reservation["status"], { label: string; className: string }> = {
  CONFIRMED: { label: "✅ Đã đặt", className: "resv-badge-confirmed" },
  PENDING_STAFF_CONFIRMATION: { label: "🕒 Chờ nhân viên xác nhận", className: "resv-badge-staff-pending" },
  PENDING_DEPOSIT: { label: "⏳ Chờ cọc", className: "resv-badge-pending" },
  CANCELLED: { label: "❌ Đã hủy", className: "resv-badge-cancelled" },
  EXPIRED: { label: "⚠️ Quá hạn", className: "resv-badge-expired" }
};

const DEPOSIT_RATE = 0.3;

export function ReservationPage() {
  const {
    tables,
    reservations,
    menuItems,
    search,
    availableTableIds,
    selectedTableId,
    hold,
    contact,
    paymentMethod,
    preOrders,
    searchError,
    actionError,
    updateSearch,
    runSearch,
    selectTable,
    updateContact,
    setPaymentMethod,
    updatePreOrder,
    resetDraft,
    submitBooking,
    approveReservation,
    cancelReservation,
    sweepExpiries
  } = useReservationStore();
  const session = useAuthStore((state) => state.session);

  const { pushToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [nowTs, setNowTs] = useState(Date.now());
  const [listQuery, setListQuery] = useState("");
  const role = session?.role ?? "customer";
  const isCustomer = role === "customer";
  const canApproveRequests = role === "staff" || role === "manager";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTs(Date.now());
      sweepExpiries();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sweepExpiries]);

  const tableCodeMap = useMemo(
    () => new Map(tables.map((table) => [table.id, table.code])),
    [tables]
  );

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [tables, selectedTableId]
  );

  const preOrderTotal = useMemo(() => {
    const priceMap = new Map(menuItems.map((item) => [item.id, item.price]));
    return preOrders.reduce(
      (sum, po) => sum + (priceMap.get(po.menuItemId) ?? 0) * po.quantity,
      0
    );
  }, [menuItems, preOrders]);

  const sortedReservations = useMemo(
    () =>
      [...reservations].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [reservations]
  );

  const filteredReservations = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    if (!q) return sortedReservations;
    return sortedReservations.filter((reservation) => {
      const tableCode = tableCodeMap.get(reservation.tableId) ?? reservation.tableId;
      return (
        reservation.contact.fullName.toLowerCase().includes(q) ||
        reservation.contact.phone.toLowerCase().includes(q) ||
        tableCode.toLowerCase().includes(q)
      );
    });
  }, [listQuery, sortedReservations, tableCodeMap]);

  const pendingCustomerRequests = useMemo(
    () =>
      reservations.filter(
        (reservation) => reservation.status === "PENDING_STAFF_CONFIRMATION"
      ),
    [reservations]
  );

  const holdSecondsLeft = useMemo(() => {
    if (!hold) return 0;
    return Math.max(
      0,
      Math.floor((new Date(hold.expiresAt).getTime() - nowTs) / 1000)
    );
  }, [hold, nowTs]);

  const holdLabel = useMemo(() => {
    const mins = Math.floor(holdSecondsLeft / 60);
    const secs = holdSecondsLeft % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [holdSecondsLeft]);

  const formatMoney = (amount: number) => `${amount.toLocaleString("vi-VN")}đ`;
  const formatDateTime = (dateTime: string) =>
    new Date(dateTime).toLocaleString("vi-VN", { hour12: false });

  const openCreateModal = () => {
    resetDraft();
    setStep(1);
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    setStep(1);
    resetDraft();
  };

  const handleNext = () => {
    if (step === 1 && !selectedTableId) {
      if (!availableTableIds.length) {
        runSearch();
      } else {
        pushToast({
          kind: "error",
          title: "Chưa chọn bàn",
          description: "Vui lòng chọn một bàn trước khi tiếp tục."
        });
      }
      return;
    }
    setStep((current) => Math.min(3, current + 1));
  };

  const handleBack = () => {
    setStep((current) => Math.max(1, current - 1));
  };

  const handleSubmit = async () => {
    if (!contact.fullName.trim() || !contact.phone.trim()) {
      pushToast({
        kind: "error",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập họ tên và số điện thoại."
      });
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      const reservation = submitBooking(role);
      pushToast({
        kind: "success",
        title: isCustomer ? "📨 Đã gửi yêu cầu đặt bàn" : "🎉 Đặt bàn thành công!",
        description: isCustomer
          ? "Nhân viên sẽ xác nhận trong màn hình quản lý đặt bàn."
          : `Mã đặt bàn: ${reservation.id.slice(0, 8).toUpperCase()}`
      });
      setIsModalOpen(false);
      setStep(1);
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Không thể xác nhận đặt bàn",
        description: err instanceof Error ? err.message : "Lỗi không xác định"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="resv-page">
      <div className="resv-page-header">
        <div>
          <h2 className="resv-title">{isCustomer ? "Đặt bàn" : "Danh sách đặt bàn"}</h2>
          <p className="resv-subtitle">
            {isCustomer
              ? "Tạo yêu cầu đặt bàn, nhân viên sẽ xác nhận để chốt bàn cho bạn"
              : "Quản lý lịch đặt bàn trước và xử lý yêu cầu đặt từ khách hàng"}
          </p>
        </div>
        <button type="button" className="resv-btn-primary" onClick={openCreateModal}>
          <span className="resv-btn-icon">＋</span>
          {isCustomer ? "Đặt bàn ngay" : "Tạo đơn đặt bàn mới"}
        </button>
      </div>

      {isCustomer ? (
        <div className="resv-customer-only">
          <p>Khách hàng chỉ tạo yêu cầu đặt bàn, danh sách đặt bàn sẽ do nhân viên quản lý và xác nhận.</p>
        </div>
      ) : (
        <>
          {canApproveRequests && pendingCustomerRequests.length > 0 ? (
            <div className="resv-pending-wrap">
              <div className="resv-pending-title">
                📨 Yêu cầu từ khách hàng chờ xác nhận ({pendingCustomerRequests.length})
              </div>
              <div className="resv-pending-list">
                {pendingCustomerRequests.map((reservation) => (
                  <div className="resv-pending-item" key={reservation.id}>
                    <div>
                      <div className="resv-customer-name">{reservation.contact.fullName}</div>
                      <div className="resv-customer-phone">
                        {reservation.contact.phone} · {tableCodeMap.get(reservation.tableId) ?? reservation.tableId} ·{" "}
                        {formatDateTime(reservation.bookingDateTime)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="resv-link-approve"
                      onClick={() => {
                        approveReservation(reservation.id, session?.username ?? "staff");
                        pushToast({
                          kind: "success",
                          title: "Đã xác nhận yêu cầu",
                          description: "Đơn đặt bàn đã chuyển sang trạng thái Đã đặt."
                        });
                      }}
                    >
                      Xác nhận
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="resv-table-wrap">
            <div className="resv-table-toolbar">
              <div className="resv-search-box">
                <span className="resv-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm theo khách hàng / số điện thoại / mã bàn..."
                  value={listQuery}
                  onChange={(e) => setListQuery(e.target.value)}
                />
              </div>
              <span className="resv-table-count">{filteredReservations.length} đơn</span>
            </div>
            <table className="resv-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Bàn</th>
                  <th>Giờ hẹn</th>
                  <th>Số khách</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>
                      <div className="resv-customer-name">{reservation.contact.fullName}</div>
                      <div className="resv-customer-phone">{reservation.contact.phone}</div>
                    </td>
                    <td className="resv-table-code">
                      {tableCodeMap.get(reservation.tableId) ?? reservation.tableId}
                    </td>
                    <td>{formatDateTime(reservation.bookingDateTime)}</td>
                    <td>{reservation.guestCount} người</td>
                    <td>
                      <span className={`resv-badge ${statusMeta[reservation.status].className}`}>
                        {statusMeta[reservation.status].label}
                      </span>
                    </td>
                    <td>
                      {reservation.status === "PENDING_STAFF_CONFIRMATION" && canApproveRequests ? (
                        <button
                          type="button"
                          className="resv-link-approve"
                          onClick={() => {
                            approveReservation(reservation.id, session?.username ?? "staff");
                            pushToast({
                              kind: "success",
                              title: "Đã xác nhận yêu cầu",
                              description: "Đơn đặt bàn đã chuyển sang trạng thái Đã đặt."
                            });
                          }}
                        >
                          Xác nhận
                        </button>
                      ) : reservation.status === "CONFIRMED" ? (
                        <button
                          type="button"
                          className="resv-link-cancel"
                          onClick={() => {
                            cancelReservation(reservation.id, "Khách chủ động hủy bàn");
                            pushToast({
                              kind: "info",
                              title: "Đã hủy đặt bàn",
                              description: "Bàn đã được trả về trạng thái Trống."
                            });
                          }}
                        >
                          Hủy bàn
                        </button>
                      ) : (
                        <span className="resv-cancel-reason">{reservation.cancelReason ?? "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td className="resv-empty-cell" colSpan={6}>
                      Chưa có lịch đặt bàn phù hợp
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div
        className={`resv-modal-backdrop${isModalOpen ? " open" : ""}`}
        onClick={closeCreateModal}
      >
        <div className="resv-modal" onClick={(e) => e.stopPropagation()}>
          <div className="resv-modal-stepper">
            <div className="resv-stepper-row">
              <div className="resv-step-item">
                <div className={`resv-step-circle${step === 1 ? " active" : ""}${step > 1 ? " done" : ""}`}>
                  {step > 1 ? "✓" : 1}
                </div>
              </div>
              <div className={`resv-step-connector${step > 1 ? " done" : ""}`} />
              <div className="resv-step-item">
                <div className={`resv-step-circle${step === 2 ? " active" : ""}${step > 2 ? " done" : ""}`}>
                  {step > 2 ? "✓" : 2}
                </div>
              </div>
              <div className={`resv-step-connector${step > 2 ? " done" : ""}`} />
              <div className="resv-step-item">
                <div className={`resv-step-circle${step === 3 ? " active" : ""}`}>3</div>
              </div>
            </div>
            <div className="resv-step-labels">
              <span className={`resv-step-label-item${step >= 1 ? " active" : ""}`}>Chọn bàn</span>
              <span className={`resv-step-label-item${step >= 2 ? " active" : ""}`}>Gọi món</span>
              <span className={`resv-step-label-item${step >= 3 ? " active" : ""}`}>Xác nhận</span>
            </div>
          </div>

          <div className="resv-modal-body">
            {step === 1 ? (
              <div className="resv-step-panel">
                <h3 className="resv-step-heading">Chọn thời gian và bàn</h3>
                <p className="resv-step-desc">
                  Nhập thời gian, số khách rồi bấm tìm bàn khả dụng
                </p>

                <div className="resv-fields-grid">
                  <div className="resv-form-group">
                    <label>Ngày giờ đặt bàn *</label>
                    <input
                      type="datetime-local"
                      value={search.bookingDateTime}
                      onChange={(e) => updateSearch({ bookingDateTime: e.target.value })}
                    />
                  </div>
                  <div className="resv-form-group">
                    <label>Số khách *</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={search.guestCount}
                      onChange={(e) => updateSearch({ guestCount: Number(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="resv-step-actions">
                  <button type="button" className="resv-btn-next" onClick={runSearch}>
                    🔍 Tìm bàn khả dụng
                  </button>
                  {hold ? (
                    <span className="resv-hold-chip">Giữ bàn còn {holdLabel}</span>
                  ) : null}
                </div>

                {searchError ? <div className="resv-alert resv-alert-error">{searchError}</div> : null}
                {actionError ? <div className="resv-alert resv-alert-error">{actionError}</div> : null}
                {!searchError && availableTableIds.length > 0 ? (
                  <div className="resv-alert resv-alert-success">
                    Tìm thấy {availableTableIds.length} bàn khả dụng
                  </div>
                ) : null}

                <TableMap
                  tables={tables}
                  availableTableIds={availableTableIds}
                  selectedTableId={selectedTableId}
                  onSelect={selectTable}
                />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="resv-step-panel">
                <h3 className="resv-step-heading">Gọi món trước (tuỳ chọn)</h3>
                <p className="resv-step-desc">
                  Chọn món trước để bếp chuẩn bị sớm hơn
                </p>
                <div className="resv-menu-wrap">
                  <PreOrderMenu
                    menuItems={menuItems}
                    preOrders={preOrders}
                    onChangeQuantity={updatePreOrder}
                  />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="resv-step-panel">
                <h3 className="resv-step-heading">Xác nhận thông tin</h3>
                <p className="resv-step-desc">
                  Nhập thông tin khách và chọn phương thức thanh toán cọc
                </p>

                <div className="resv-fields-grid">
                  <div className="resv-form-group">
                    <label>Họ và tên *</label>
                    <input
                      type="text"
                      value={contact.fullName}
                      placeholder="Nguyễn Văn A"
                      onChange={(e) => updateContact({ fullName: e.target.value })}
                    />
                  </div>
                  <div className="resv-form-group">
                    <label>Số điện thoại *</label>
                    <input
                      type="text"
                      value={contact.phone}
                      placeholder="09x xxx xxxx"
                      onChange={(e) => updateContact({ phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="resv-form-group">
                  <label>Ghi chú</label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Không cay, có bé nhỏ..."
                    value={contact.note ?? ""}
                    onChange={(e) => updateContact({ note: e.target.value })}
                  />
                </div>

                <p className="resv-payment-title">Phương thức thanh toán cọc</p>
                <div className="resv-payment-grid">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`resv-payment-option${paymentMethod === option.value ? " selected" : ""}`}
                      onClick={() => setPaymentMethod(option.value)}
                    >
                      <span className="resv-payment-icon">{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>

                <div className="resv-summary-box">
                  <div className="resv-summary-row">
                    <span>Bàn đã chọn</span>
                    <strong>{selectedTable?.code ?? "—"}</strong>
                  </div>
                  <div className="resv-summary-row">
                    <span>Tiền món ăn</span>
                    <strong>{formatMoney(preOrderTotal)}</strong>
                  </div>
                  <div className="resv-summary-row resv-summary-row-total">
                    <span>Tiền cọc (30%)</span>
                    <strong>{formatMoney(Math.round(preOrderTotal * DEPOSIT_RATE))}</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="resv-modal-footer">
            <span className="resv-step-count">Bước {step}/3</span>
            {step > 1 ? (
              <button type="button" className="resv-btn-back" onClick={handleBack}>
                ← Quay lại
              </button>
            ) : null}
            <button type="button" className="resv-btn-cancel" onClick={closeCreateModal}>
              Hủy
            </button>
            {step < 3 ? (
              <button
                type="button"
                className="resv-btn-next"
                onClick={handleNext}
              >
                Tiếp tục →
              </button>
            ) : (
              <button
                type="button"
                className="resv-btn-submit"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Đang xử lý..." : "✅ Xác nhận đặt bàn"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

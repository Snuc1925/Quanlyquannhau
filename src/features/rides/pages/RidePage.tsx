import { useMemo, useState } from "react";
import { useRideStore } from "../store/rideStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useToast } from "@/app/providers/ToastProvider";
import type { RideRequest } from "../types";
import { RIDE_APP_META, RIDE_STATUS_META } from "../types";

const EMPTY_FORM: Omit<RideRequest, "id" | "createdAt" | "status" | "staffName"> = {
  tableNo: "",
  customerName: "",
  customerPhone: "",
  destination: "",
  note: "",
  rideApp: "grab"
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function RidePage() {
  const { rides, addRide, updateStatus } = useRideStore();
  const { session } = useAuthStore();
  const { pushToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [filterStatus, setFilterStatus] = useState<"all" | RideRequest["status"]>("all");
  const [search, setSearch] = useState("");

  const setF = <K extends keyof typeof EMPTY_FORM>(
    key: K,
    value: (typeof EMPTY_FORM)[K]
  ) => setForm((state) => ({ ...state, [key]: value }));

  const validateStep1 = () => {
    const nextErrors: Partial<typeof EMPTY_FORM> = {};
    if (!form.tableNo.trim()) nextErrors.tableNo = "Nhập số bàn";
    if (!form.customerName.trim()) nextErrors.customerName = "Nhập tên khách";
    if (!form.customerPhone.trim()) nextErrors.customerPhone = "Nhập số điện thoại";
    if (!form.destination.trim()) nextErrors.destination = "Nhập điểm đến";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openCreateModal = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setStep(1);
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    setStep(1);
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((current) => Math.min(2, current + 1));
  };

  const handleBack = () => setStep((current) => Math.max(1, current - 1));

  const handleSubmit = () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    const created = addRide({
      ...form,
      staffName: session?.fullName ?? "Nhân viên"
    });
    pushToast({
      kind: "success",
      title: "Đặt xe thành công",
      description: `Đã tạo yêu cầu ${created.id.toUpperCase()} cho bàn ${created.tableNo}.`
    });
    setIsModalOpen(false);
    setStep(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rides.filter((ride) => {
      const statusMatch = filterStatus === "all" || ride.status === filterStatus;
      const searchMatch =
        !q ||
        ride.customerName.toLowerCase().includes(q) ||
        ride.customerPhone.includes(q) ||
        ride.tableNo.toLowerCase().includes(q) ||
        ride.destination.toLowerCase().includes(q);
      return statusMatch && searchMatch;
    });
  }, [rides, filterStatus, search]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: rides.length,
      today: rides.filter((ride) => ride.createdAt.startsWith(today)).length,
      pending: rides.filter((ride) => ride.status === "pending").length
    };
  }, [rides]);

  return (
    <div className="rides-page">
      <div className="rides-page-header">
        <div>
          <h2 className="rides-title">Lịch sử đặt xe</h2>
          <p className="rides-subtitle">
            Theo dõi các lượt gọi xe và tạo yêu cầu đặt xe mới cho khách hàng
          </p>
        </div>
        <button type="button" className="rides-btn-primary" onClick={openCreateModal}>
          <span className="rides-btn-icon">＋</span>
          Tạo đơn đặt xe mới
        </button>
      </div>

      <div className="rides-stats-bar">
        <div className="rides-stat-card">
          <div className="rides-stat-label">Tổng lượt đặt</div>
          <div className="rides-stat-value">{stats.total}</div>
          <div className="rides-stat-sub">toàn bộ lịch sử</div>
        </div>
        <div className="rides-stat-card">
          <div className="rides-stat-label">Hôm nay</div>
          <div className="rides-stat-value rides-amber">{stats.today}</div>
          <div className="rides-stat-sub">lượt phát sinh mới</div>
        </div>
        <div className="rides-stat-card">
          <div className="rides-stat-label">Chờ xe</div>
          <div className="rides-stat-value rides-red">{stats.pending}</div>
          <div className="rides-stat-sub">cần xử lý ngay</div>
        </div>
      </div>

      <div className="rides-table-wrap">
        <div className="rides-table-toolbar">
          <div className="rides-search-box">
            <span className="rides-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo tên khách, SĐT, bàn, điểm đến..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rides-status-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xe</option>
            <option value="dispatched">Đã gọi</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã huỷ</option>
          </select>
          <span className="rides-table-count">{filtered.length} lượt</span>
        </div>

        <table className="rides-table">
          <thead>
            <tr>
              <th>Bàn</th>
              <th>Khách hàng</th>
              <th>Điểm đến</th>
              <th>Ứng dụng</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ride) => {
              const status = RIDE_STATUS_META[ride.status];
              const app = RIDE_APP_META[ride.rideApp];
              return (
                <tr key={ride.id}>
                  <td>
                    <span className="rides-table-badge">{ride.tableNo}</span>
                  </td>
                  <td>
                    <div className="rides-customer-name">{ride.customerName}</div>
                    <div className="rides-customer-meta">{ride.customerPhone}</div>
                    {ride.note ? <div className="rides-customer-note">💬 {ride.note}</div> : null}
                  </td>
                  <td className="rides-destination">{ride.destination}</td>
                  <td>
                    <span className="rides-app-chip" style={{ color: app.color }}>
                      {app.icon} {app.label}
                    </span>
                  </td>
                  <td>
                    <span
                      className="rides-status-chip"
                      style={{ color: status.color, background: status.bg }}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="rides-time-cell">
                    <div>{formatTime(ride.createdAt)}</div>
                    <div className="rides-customer-meta">{ride.staffName}</div>
                  </td>
                  <td>
                    {ride.status === "pending" ? (
                      <div className="rides-action-group">
                        <button
                          type="button"
                          className="rides-btn-xs rides-btn-xs-primary"
                          onClick={() => updateStatus(ride.id, "dispatched")}
                        >
                          Đã gọi
                        </button>
                        <button
                          type="button"
                          className="rides-btn-xs rides-btn-xs-danger"
                          onClick={() => updateStatus(ride.id, "cancelled")}
                        >
                          Huỷ
                        </button>
                      </div>
                    ) : null}
                    {ride.status === "dispatched" ? (
                      <button
                        type="button"
                        className="rides-btn-xs rides-btn-xs-success"
                        onClick={() => updateStatus(ride.id, "completed")}
                      >
                        Hoàn thành
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="rides-empty-cell">
                  Chưa có dữ liệu phù hợp
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div
        className={`rides-modal-backdrop${isModalOpen ? " open" : ""}`}
        onClick={closeCreateModal}
      >
        <div className="rides-modal" onClick={(e) => e.stopPropagation()}>
          <div className="rides-modal-stepper">
            <div className="rides-stepper-row">
              <div className="rides-step-item">
                <div className={`rides-step-circle${step === 1 ? " active" : ""}${step > 1 ? " done" : ""}`}>
                  {step > 1 ? "✓" : 1}
                </div>
              </div>
              <div className={`rides-step-connector${step > 1 ? " done" : ""}`} />
              <div className="rides-step-item">
                <div className={`rides-step-circle${step === 2 ? " active" : ""}`}>2</div>
              </div>
            </div>
            <div className="rides-step-labels">
              <span className={`rides-step-label-item${step >= 1 ? " active" : ""}`}>Thông tin xe</span>
              <span className={`rides-step-label-item${step >= 2 ? " active" : ""}`}>Xác nhận</span>
            </div>
          </div>

          <div className="rides-modal-body">
            {step === 1 ? (
              <div className="rides-step-panel">
                <h3 className="rides-step-heading">Thông tin đặt xe</h3>
                <p className="rides-step-desc">
                  Nhập thông tin khách hàng và điểm đến để tạo yêu cầu gọi xe
                </p>

                <div className="rides-fields-grid">
                  <div className="rides-form-group">
                    <label>Số bàn *</label>
                    <input
                      type="text"
                      placeholder="VD: B04"
                      value={form.tableNo}
                      onChange={(e) => setF("tableNo", e.target.value)}
                    />
                    {errors.tableNo ? <p className="rides-field-error">{errors.tableNo}</p> : null}
                  </div>
                  <div className="rides-form-group">
                    <label>Tên khách *</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={form.customerName}
                      onChange={(e) => setF("customerName", e.target.value)}
                    />
                    {errors.customerName ? (
                      <p className="rides-field-error">{errors.customerName}</p>
                    ) : null}
                  </div>
                </div>

                <div className="rides-fields-grid">
                  <div className="rides-form-group">
                    <label>Số điện thoại *</label>
                    <input
                      type="text"
                      placeholder="0912 345 678"
                      value={form.customerPhone}
                      onChange={(e) => setF("customerPhone", e.target.value)}
                    />
                    {errors.customerPhone ? (
                      <p className="rides-field-error">{errors.customerPhone}</p>
                    ) : null}
                  </div>
                  <div className="rides-form-group">
                    <label>Ứng dụng gọi xe</label>
                    <div className="rides-app-grid">
                      {(Object.keys(RIDE_APP_META) as RideRequest["rideApp"][]).map((appKey) => {
                        const appMeta = RIDE_APP_META[appKey];
                        return (
                          <button
                            key={appKey}
                            type="button"
                            className={`rides-app-option${form.rideApp === appKey ? " selected" : ""}`}
                            style={
                              form.rideApp === appKey
                                ? { borderColor: appMeta.color, color: appMeta.color }
                                : undefined
                            }
                            onClick={() => setF("rideApp", appKey)}
                          >
                            {appMeta.icon} {appMeta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rides-form-group">
                  <label>Điểm đến *</label>
                  <input
                    type="text"
                    placeholder="Địa chỉ nhà hoặc điểm đến"
                    value={form.destination}
                    onChange={(e) => setF("destination", e.target.value)}
                  />
                  {errors.destination ? <p className="rides-field-error">{errors.destination}</p> : null}
                </div>

                <div className="rides-form-group">
                  <label>Ghi chú</label>
                  <textarea
                    rows={3}
                    placeholder="VD: Khách say, cần hỗ trợ lên xe..."
                    value={form.note}
                    onChange={(e) => setF("note", e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="rides-step-panel">
                <h3 className="rides-step-heading">Xác nhận yêu cầu đặt xe</h3>
                <p className="rides-step-desc">Kiểm tra lại thông tin trước khi lưu lịch sử</p>

                <div className="rides-summary-box">
                  <div className="rides-summary-row">
                    <span>Số bàn</span>
                    <strong>{form.tableNo}</strong>
                  </div>
                  <div className="rides-summary-row">
                    <span>Khách hàng</span>
                    <strong>{form.customerName}</strong>
                  </div>
                  <div className="rides-summary-row">
                    <span>Số điện thoại</span>
                    <strong>{form.customerPhone}</strong>
                  </div>
                  <div className="rides-summary-row">
                    <span>Điểm đến</span>
                    <strong>{form.destination}</strong>
                  </div>
                  <div className="rides-summary-row">
                    <span>Ứng dụng</span>
                    <strong>
                      {RIDE_APP_META[form.rideApp].icon} {RIDE_APP_META[form.rideApp].label}
                    </strong>
                  </div>
                  <div className="rides-summary-row">
                    <span>Ghi chú</span>
                    <strong>{form.note || "—"}</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rides-modal-footer">
            <span className="rides-step-count">Bước {step}/2</span>
            {step > 1 ? (
              <button type="button" className="rides-btn-back" onClick={handleBack}>
                ← Quay lại
              </button>
            ) : null}
            <button type="button" className="rides-btn-cancel" onClick={closeCreateModal}>
              Hủy
            </button>
            {step < 2 ? (
              <button type="button" className="rides-btn-next" onClick={handleNext}>
                Tiếp tục →
              </button>
            ) : (
              <button type="button" className="rides-btn-submit" onClick={handleSubmit}>
                ✅ Xác nhận đặt xe
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useRideStore } from "../store/rideStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { RideRequest } from "../types";
import { RIDE_APP_META, RIDE_STATUS_META } from "../types";

const EMPTY_FORM = {
  tableNo: "",
  customerName: "",
  customerPhone: "",
  destination: "",
  note: "",
  rideApp: "grab" as RideRequest["rideApp"],
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const RidePage: React.FC = () => {
  const { rides, addRide, updateStatus } = useRideStore();
  const { user } = useAuthStore();

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [success, setSuccess] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | RideRequest["status"]>("all");
  const [search, setSearch] = useState("");

  const setF = <K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Partial<typeof EMPTY_FORM> = {};
    if (!form.tableNo.trim()) e.tableNo = "Nhập số bàn";
    if (!form.customerName.trim()) e.customerName = "Nhập tên khách";
    if (!form.customerPhone.trim()) e.customerPhone = "Nhập số điện thoại";
    if (!form.destination.trim()) e.destination = "Nhập điểm đến";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    addRide({ ...form, staffName: user?.name ?? "Nhân viên" });
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const displayed = rides.filter((r) => {
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerPhone.includes(q) ||
      r.tableNo.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = rides.filter((r) => r.createdAt.startsWith(todayStr)).length;
  const pendingCount = rides.filter((r) => r.status === "pending").length;

  return (
    <div className="page-wrapper">
      {/* header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🚖 Quản lý đặt xe</h1>
          <p className="page-subtitle">Hỗ trợ gọi xe về cho khách sau khi sử dụng dịch vụ</p>
        </div>
      </div>

      {/* stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon">🗂️</span>
          <div>
            <p className="stat-value">{rides.length}</p>
            <p className="stat-label">Tổng lượt đặt</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <span className="stat-icon">📅</span>
          <div>
            <p className="stat-value">{todayCount}</p>
            <p className="stat-label">Hôm nay</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid #ef4444" }}>
          <span className="stat-icon">⏳</span>
          <div>
            <p className="stat-value">{pendingCount}</p>
            <p className="stat-label">Chờ xe</p>
          </div>
        </div>
      </div>

      <div className="ride-layout">
        {/* ── LEFT: booking form ─────────────────────── */}
        <div className="ride-form-panel">
          <div className="panel-header">
            <span className="panel-header__icon">🚕</span>
            <h2 className="panel-header__title">Đặt xe cho khách</h2>
          </div>

          {success && (
            <div className="alert alert--success">
              ✅ Đã ghi nhận đặt xe thành công!
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="ride-form">
            <div className="form-row-2">
              <div className="field-group">
                <label className="field-label">Số bàn *</label>
                <input
                  className={`field-input ${errors.tableNo ? "field-input--error" : ""}`}
                  placeholder="VD: B04"
                  value={form.tableNo}
                  onChange={(e) => setF("tableNo", e.target.value)}
                />
                {errors.tableNo && <p className="field-error">{errors.tableNo}</p>}
              </div>
              <div className="field-group">
                <label className="field-label">Ứng dụng gọi xe</label>
                <div className="ride-app-group">
                  {(Object.keys(RIDE_APP_META) as RideRequest["rideApp"][]).map((app) => {
                    const m = RIDE_APP_META[app];
                    return (
                      <label
                        key={app}
                        className={`ride-app-opt ${form.rideApp === app ? "ride-app-opt--active" : ""}`}
                        style={form.rideApp === app ? { borderColor: m.color, color: m.color } : undefined}
                      >
                        <input
                          type="radio"
                          name="rideApp"
                          value={app}
                          checked={form.rideApp === app}
                          onChange={() => setF("rideApp", app)}
                          style={{ display: "none" }}
                        />
                        {m.icon} {m.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="form-row-2">
              <div className="field-group">
                <label className="field-label">Tên khách *</label>
                <input
                  className={`field-input ${errors.customerName ? "field-input--error" : ""}`}
                  placeholder="Nguyễn Văn A"
                  value={form.customerName}
                  onChange={(e) => setF("customerName", e.target.value)}
                />
                {errors.customerName && <p className="field-error">{errors.customerName}</p>}
              </div>
              <div className="field-group">
                <label className="field-label">Số điện thoại *</label>
                <input
                  className={`field-input ${errors.customerPhone ? "field-input--error" : ""}`}
                  placeholder="0912 345 678"
                  value={form.customerPhone}
                  onChange={(e) => setF("customerPhone", e.target.value)}
                />
                {errors.customerPhone && <p className="field-error">{errors.customerPhone}</p>}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Điểm đến *</label>
              <input
                className={`field-input ${errors.destination ? "field-input--error" : ""}`}
                placeholder="Địa chỉ nhà hoặc điểm đến"
                value={form.destination}
                onChange={(e) => setF("destination", e.target.value)}
              />
              {errors.destination && <p className="field-error">{errors.destination}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">Ghi chú</label>
              <textarea
                className="field-input field-textarea"
                rows={3}
                placeholder="VD: Khách say, cần hỗ trợ lên xe; Đặt xe 7 chỗ…"
                value={form.note}
                onChange={(e) => setF("note", e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              🚖 Xác nhận đặt xe
            </button>
          </form>
        </div>

        {/* ── RIGHT: history table ───────────────────── */}
        <div className="ride-history-panel">
          <div className="panel-header">
            <span className="panel-header__icon">📋</span>
            <h2 className="panel-header__title">Lịch sử đặt xe</h2>
          </div>

          {/* filter + search */}
          <div className="ride-filter-bar">
            <div className="search-box" style={{ flex: 1 }}>
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Tìm tên, SĐT, số bàn…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch("")}>✕</button>
              )}
            </div>
            <select
              className="field-input ride-status-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xe</option>
              <option value="dispatched">Đã gọi</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã huỷ</option>
            </select>
          </div>

          {/* table */}
          {displayed.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state__icon">🚖</p>
              <p className="empty-state__title">Chưa có lịch sử đặt xe</p>
            </div>
          ) : (
            <div className="ride-table-wrap">
              <table className="data-table ride-table">
                <thead>
                  <tr>
                    <th>Bàn</th>
                    <th>Khách</th>
                    <th>Điểm đến</th>
                    <th>Ứng dụng</th>
                    <th>Trạng thái</th>
                    <th>Thời gian</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((r) => {
                    const sm = RIDE_STATUS_META[r.status];
                    const am = RIDE_APP_META[r.rideApp];
                    return (
                      <tr key={r.id}>
                        <td><span className="table-badge">{r.tableNo}</span></td>
                        <td>
                          <p style={{ fontWeight: 600 }}>{r.customerName}</p>
                          <p style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)" }}>
                            {r.customerPhone}
                          </p>
                          {r.note && (
                            <p style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)", fontStyle: "italic" }}>
                              💬 {r.note}
                            </p>
                          )}
                        </td>
                        <td style={{ maxWidth: 160, wordBreak: "break-word" }}>
                          {r.destination}
                        </td>
                        <td>
                          <span style={{ color: am.color, fontWeight: 600 }}>
                            {am.icon} {am.label}
                          </span>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ color: sm.color, background: sm.bg }}
                          >
                            {sm.label}
                          </span>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <p>{formatTime(r.createdAt)}</p>
                          <p style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)" }}>
                            {r.staffName}
                          </p>
                        </td>
                        <td>
                          {r.status === "pending" && (
                            <div className="ride-action-btns">
                              <button
                                className="btn-xs btn-xs--primary"
                                onClick={() => updateStatus(r.id, "dispatched")}
                              >
                                Đã gọi
                              </button>
                              <button
                                className="btn-xs btn-xs--danger"
                                onClick={() => updateStatus(r.id, "cancelled")}
                              >
                                Huỷ
                              </button>
                            </div>
                          )}
                          {r.status === "dispatched" && (
                            <button
                              className="btn-xs btn-xs--success"
                              onClick={() => updateStatus(r.id, "completed")}
                            >
                              Hoàn thành
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

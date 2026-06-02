import { useState, useMemo } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useRevenueStore } from "../store/revenueStore";
import type { ClosingRecord } from "../types";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green" | "amber" | "blue" | "gray";
}) {
  const colors: Record<string, { bg: string; border: string; val: string }> = {
    green: { bg: "#f0fdf4", border: "#bbf7d0", val: "#15803d" },
    amber: { bg: "#fffbeb", border: "#fde68a", val: "#b45309" },
    blue:  { bg: "#eff6ff", border: "#bfdbfe", val: "#1d4ed8" },
    gray:  { bg: "#f9fafb", border: "#e5e7eb", val: "#374151" },
  };
  const c = colors[accent ?? "gray"];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: c.val }}>{value}</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Badge({ status }: { status: ClosingRecord["status"] }) {
  const map: Record<string, { bg: string; color: string; text: string }> = {
    DRAFT:            { bg: "#f3f4f6", color: "#6b7280", text: "Bản nháp" },
    CONFIRMED:        { bg: "#dbeafe", color: "#1d4ed8", text: "Đã xác nhận" },
    PENDING_APPROVAL: { bg: "#fef3c7", color: "#b45309", text: "Chờ quản lý duyệt" },
    APPROVED:         { bg: "#dcfce7", color: "#15803d", text: "✓ Đã duyệt" },
  };
  const s = map[status] ?? map.DRAFT;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
      {s.text}
    </span>
  );
}

function PaymentMethodLabel({ method }: { method: string }) {
  const m: Record<string, string> = { cash: "Tiền mặt", bank: "Chuyển khoản", card: "Thẻ", ewallet: "Ví điện tử" };
  return <>{m[method] ?? method}</>;
}

export function RevenuePage() {
  const { session } = useAuthStore();
  const role = session?.role ?? "staff";
  const {
    draft, closings, updateDraft, checkOpenTables,
    calculateSystemSummary, confirmClosing, approveClosing,
    getOpenInvoices, getClosedInvoices,
  } = useRevenueStore();

  const { pushToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);

  const openInvoices = useMemo(() => getOpenInvoices(), [getOpenInvoices]);
  const closedInvoices = useMemo(() => getClosedInvoices(), [getClosedInvoices]);
  const summaries = useMemo(() => calculateSystemSummary(), [calculateSystemSummary, draft]);

  const totalRevenue = useMemo(
    () => [...openInvoices, ...closedInvoices].reduce((s, inv) => s + inv.grandTotal, 0),
    [openInvoices, closedInvoices]
  );

  const pendingClosings = closings.filter((c) => c.status === "PENDING_APPROVAL");
  const approvedClosings = closings.filter((c) => c.status === "APPROVED");

  const handleStartClose = () => {
    if (checkOpenTables()) {
      pushToast({ kind: "error", title: "Vẫn còn bàn đang mở", description: "Thanh toán tất cả bàn trước khi chốt sổ." });
      return;
    }
    if (openInvoices.length === 0) {
      pushToast({ kind: "warning", title: "Không có hóa đơn", description: "Chưa có hóa đơn nào để chốt sổ." });
      return;
    }
    setShowForm(true);
  };

  const handleConfirm = async (type: "SHIFT" | "DAY") => {
    if (!session) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const c = confirmClosing(type, session.username);
      pushToast({ kind: "success", title: "Chốt sổ thành công!", description: `${c.invoiceCount} hóa đơn đã khóa · ${c.grandTotal.toLocaleString("vi-VN")} ₫ · Đang chờ quản lý duyệt.` });
      setShowForm(false);
    } catch (err) {
      pushToast({ kind: "error", title: "Lỗi chốt sổ", description: err instanceof Error ? err.message : "Lỗi không xác định" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!session) return;
    setApproving(id);
    await new Promise((r) => setTimeout(r, 600));
    approveClosing(id, session.username);
    pushToast({ kind: "success", title: "Đã duyệt báo cáo!", description: "Báo cáo chốt sổ đã được phê duyệt." });
    setApproving(null);
  };

  const fmt = (n: number) => n.toLocaleString("vi-VN");

  return (
    <div className="rev-page">
      {/* Header */}
      <div className="rev-header">
        <div>
          <h1 className="rev-title">Quản lý doanh thu</h1>
          <p className="rev-subtitle">
            {role === "accountant" ? "Đối soát & chốt sổ theo ca / ngày" : "Xem báo cáo & phê duyệt chốt sổ"}
          </p>
        </div>
        {role === "accountant" && !showForm && (
          <button className="rev-cta-btn" onClick={handleStartClose}>
            <span>🔒</span> Chốt sổ
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="rev-stats">
        <StatCard label="Tổng doanh thu hôm nay" value={`${fmt(totalRevenue)} ₫`} accent="green" />
        <StatCard label="Hóa đơn chờ chốt" value={openInvoices.length} sub="Đã thanh toán, chưa khóa" accent="amber" />
        <StatCard label="Hóa đơn đã chốt" value={closedInvoices.length} sub="Dữ liệu đã khóa" accent="blue" />
        <StatCard label="Báo cáo chờ duyệt" value={pendingClosings.length} accent={pendingClosings.length > 0 ? "amber" : "gray"} />
      </div>

      {/* ====== ACCOUNTANT: Closing form ====== */}
      {role === "accountant" && showForm && (
        <div className="rev-card">
          <div className="rev-card-head">
            <div>
              <div className="rev-card-title">📋 Đối soát & chốt sổ</div>
              <div className="rev-card-sub">Kiểm tra số liệu hệ thống rồi nhập thực tế</div>
            </div>
            <button className="rev-cancel-btn" onClick={() => setShowForm(false)}>✕ Hủy</button>
          </div>

          {/* Reconciliation table */}
          <div className="rev-table-wrap">
            <table className="rev-table">
              <thead>
                <tr>
                  <th>Phương thức</th>
                  <th>Hệ thống (₫)</th>
                  <th>Thực tế (₫)</th>
                  <th>Chênh lệch</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr key={s.method}>
                    <td><PaymentMethodLabel method={s.method} /></td>
                    <td>{fmt(s.systemAmount)}</td>
                    <td>
                      <input
                        type="number"
                        className="rev-input"
                        value={
                          s.method === "cash" ? draft.actualCash :
                          s.method === "bank" ? draft.actualBank :
                          s.method === "card" ? draft.actualCard : draft.actualEwallet
                        }
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (s.method === "cash") updateDraft({ actualCash: v });
                          else if (s.method === "bank") updateDraft({ actualBank: v });
                          else if (s.method === "card") updateDraft({ actualCard: v });
                          else updateDraft({ actualEwallet: v });
                        }}
                        min={0}
                      />
                    </td>
                    <td>
                      <span style={{ color: s.discrepancy === 0 ? "#15803d" : s.discrepancy > 0 ? "#1d4ed8" : "#b91c1c", fontWeight: 600 }}>
                        {s.discrepancy === 0 ? "✓ Khớp" : `${s.discrepancy > 0 ? "+" : ""}${fmt(s.discrepancy)} ₫`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rev-form-row">
            <div className="rev-field">
              <label>Tiền quỹ đầu ca (₫)</label>
              <input className="rev-input" type="number" value={draft.openingCashFund} onChange={(e) => updateDraft({ openingCashFund: Number(e.target.value) })} min={0} />
            </div>
            <div className="rev-field" style={{ flex: 2 }}>
              <label>Ghi chú</label>
              <input className="rev-input" type="text" value={draft.notes} placeholder="Ghi chú thêm..." onChange={(e) => updateDraft({ notes: e.target.value })} />
            </div>
          </div>

          <div className="rev-action-row">
            <button className="rev-btn-outline" onClick={() => handleConfirm("SHIFT")} disabled={submitting}>
              {submitting ? "Đang xử lý..." : "⏰ Chốt ca"}
            </button>
            <button className="rev-cta-btn" onClick={() => handleConfirm("DAY")} disabled={submitting}>
              {submitting ? "Đang xử lý..." : "🌙 Chốt ngày"}
            </button>
          </div>
        </div>
      )}

      {/* ====== MANAGER: Pending approvals ====== */}
      {role === "manager" && pendingClosings.length > 0 && (
        <div className="rev-card">
          <div className="rev-card-head">
            <div>
              <div className="rev-card-title">⏳ Báo cáo chờ phê duyệt</div>
              <div className="rev-card-sub">Kế toán đã chốt sổ, cần quản lý xác nhận</div>
            </div>
            <span className="rev-badge-pending">{pendingClosings.length} chờ duyệt</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pendingClosings.map((c) => (
              <div key={c.id} className="rev-closing-row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {c.type === "DAY" ? "🌙 Chốt ngày" : "⏰ Chốt ca"} &nbsp;
                    <span style={{ fontFamily: "monospace", color: "#6b7280", fontSize: 12 }}>{c.id.slice(0, 16)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                    {new Date(c.closedAt).toLocaleString("vi-VN")} · Kế toán: {c.closedBy}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    {c.invoiceCount} hóa đơn · Doanh thu: <strong>{fmt(c.grandTotal)} ₫</strong>
                    {c.discrepancyTotal !== 0 && (
                      <span style={{ marginLeft: 8, color: "#b45309" }}>Chênh: {fmt(c.discrepancyTotal)} ₫</span>
                    )}
                  </div>
                </div>
                <button
                  className="rev-cta-btn"
                  onClick={() => handleApprove(c.id)}
                  disabled={approving === c.id}
                  style={{ minWidth: 120 }}
                >
                  {approving === c.id ? "Đang duyệt..." : "✓ Phê duyệt"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closing history */}
      <div className="rev-card">
        <div className="rev-card-head">
          <div>
            <div className="rev-card-title">📜 Lịch sử chốt sổ</div>
            <div className="rev-card-sub">Tất cả các lần chốt ca / chốt ngày</div>
          </div>
        </div>
        {closings.length === 0 ? (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0" }}>Chưa có lần chốt sổ nào</div>
        ) : (
          <div className="rev-table-wrap">
            <table className="rev-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Loại</th>
                  <th>Thời gian</th>
                  <th>Kế toán</th>
                  <th>Số HĐ</th>
                  <th>Doanh thu (₫)</th>
                  <th>Chênh lệch</th>
                  <th>Trạng thái</th>
                  {role === "manager" && <th>Người duyệt</th>}
                </tr>
              </thead>
              <tbody>
                {[...closings].sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()).map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>{c.id.slice(0, 14)}</td>
                    <td>{c.type === "DAY" ? "🌙 Chốt ngày" : "⏰ Chốt ca"}</td>
                    <td style={{ fontSize: 13 }}>{new Date(c.closedAt).toLocaleString("vi-VN", { hour12: false })}</td>
                    <td>{c.closedBy}</td>
                    <td style={{ textAlign: "center" }}>{c.invoiceCount}</td>
                    <td style={{ fontWeight: 600, color: "#15803d" }}>{fmt(c.grandTotal)}</td>
                    <td>
                      {c.discrepancyTotal === 0
                        ? <span style={{ color: "#15803d", fontWeight: 600 }}>✓ Khớp</span>
                        : <span style={{ color: "#b45309" }}>{c.discrepancyTotal > 0 ? "+" : ""}{fmt(c.discrepancyTotal)} ₫</span>
                      }
                    </td>
                    <td><Badge status={c.status} /></td>
                    {role === "manager" && <td style={{ fontSize: 13, color: "#6b7280" }}>{c.approvedBy ?? "—"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Open invoices */}
      {openInvoices.length > 0 && (
        <div className="rev-card">
          <div className="rev-card-head">
            <div>
              <div className="rev-card-title">✅ Hóa đơn chờ chốt ({openInvoices.length})</div>
              <div className="rev-card-sub">Đã thanh toán · Chưa khóa</div>
            </div>
          </div>
          <div className="rev-table-wrap">
            <table className="rev-table">
              <thead><tr><th>Mã HĐ</th><th>Bàn</th><th>Thời gian</th><th>Thanh toán</th><th>Tổng (₫)</th></tr></thead>
              <tbody>
                {openInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{inv.id}</td>
                    <td><strong>{inv.tableCode}</strong></td>
                    <td style={{ fontSize: 13 }}>{inv.closedAt ? new Date(inv.closedAt).toLocaleString("vi-VN", { hour12: false }) : "—"}</td>
                    <td>{{ cash: "Tiền mặt", bank: "Chuyển khoản", card: "Thẻ", ewallet: "Ví" }[inv.paymentMethod]}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(inv.grandTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

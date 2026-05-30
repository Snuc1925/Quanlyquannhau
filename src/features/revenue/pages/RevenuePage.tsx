import { useState, useMemo } from "react";
import { Button, Card, StatusView } from "@/components/ui";
import { useToast } from "@/app/providers/ToastProvider";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useRevenueStore } from "../store/revenueStore";
import { ReconciliationTable } from "../components/ReconciliationTable";
import { ClosingForm } from "../components/ClosingForm";
import { ClosingHistory } from "../components/ClosingHistory";
import { InvoiceList } from "../components/InvoiceList";

export function RevenuePage() {
  const { session } = useAuthStore();
  const {
    draft,
    closings,
    hasOpenTables,
    updateDraft,
    checkOpenTables,
    calculateSystemSummary,
    confirmClosing,
    getOpenInvoices,
    getClosedInvoices,
  } = useRevenueStore();

  const { pushToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);

  const openInvoices = useMemo(() => getOpenInvoices(), [getOpenInvoices]);
  const closedInvoices = useMemo(() => getClosedInvoices(), [getClosedInvoices]);

  const summaries = useMemo(
    () => calculateSystemSummary(),
    [calculateSystemSummary, draft]
  );

  const handleStartReconciliation = () => {
    const hasOpen = checkOpenTables();
    if (hasOpen) {
      pushToast({
        kind: "error",
        title: "❌ Không thể chốt sổ",
        description: "Vẫn còn bàn đang mở · Vui lòng thanh toán tất cả các bàn trước",
      });
      return;
    }

    if (openInvoices.length === 0) {
      pushToast({
        kind: "warning",
        title: "⚠️ Không có hóa đơn",
        description: "Chưa có hóa đơn nào để chốt sổ",
      });
      return;
    }

    setShowReconciliation(true);
  };

  const handleConfirm = async (type: "SHIFT" | "DAY") => {
    if (!session) return;

    setSubmitting(true);
    try {
      await new Promise((r) => window.setTimeout(r, 1000));
      const closing = confirmClosing(type, session.username);
      pushToast({
        kind: "success",
        title: `🎉 ${type === "DAY" ? "Chốt ngày" : "Chốt ca"} thành công!`,
        description: `${closing.invoiceCount} hóa đơn đã được khóa · Doanh thu: ${closing.grandTotal.toLocaleString()} ₫`,
      });
      setShowReconciliation(false);
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Không thể chốt sổ",
        description: err instanceof Error ? err.message : "Lỗi không xác định",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
      {/* Status overview */}
      <Card title="📊 Tổng quan doanh thu" subtitle="Theo dõi tình trạng hóa đơn và chốt sổ">
        <div className="grid grid-3" style={{ gap: "var(--sp-4)" }}>
          <div
            style={{
              padding: "var(--sp-4)",
              background: "var(--c-success-50)",
              border: "1px solid var(--c-success-200)",
              borderRadius: "var(--r-md)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "var(--fs-3xl)", fontWeight: "var(--fw-bold)", color: "var(--c-success-700)" }}>
              {openInvoices.length}
            </div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-gray-600)", marginTop: "var(--sp-1)" }}>
              ✅ Hóa đơn chờ chốt
            </div>
          </div>

          <div
            style={{
              padding: "var(--sp-4)",
              background: "var(--c-gray-50)",
              border: "1px solid var(--c-gray-200)",
              borderRadius: "var(--r-md)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "var(--fs-3xl)", fontWeight: "var(--fw-bold)", color: "var(--c-gray-700)" }}>
              {closedInvoices.length}
            </div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-gray-600)", marginTop: "var(--sp-1)" }}>
              🔒 Hóa đơn đã chốt
            </div>
          </div>

          <div
            style={{
              padding: "var(--sp-4)",
              background: "var(--c-primary-50)",
              border: "1px solid var(--c-primary-200)",
              borderRadius: "var(--r-md)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "var(--fs-3xl)", fontWeight: "var(--fw-bold)", color: "var(--c-primary-700)" }}>
              {closings.length}
            </div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-gray-600)", marginTop: "var(--sp-1)" }}>
              📜 Lần chốt sổ
            </div>
          </div>
        </div>

        {!showReconciliation ? (
          <div style={{ marginTop: "var(--sp-4)", textAlign: "center" }}>
            <Button size="lg" onClick={handleStartReconciliation}>
              🔒 Bắt đầu chốt sổ
            </Button>
          </div>
        ) : null}
      </Card>

      {/* Reconciliation flow */}
      {showReconciliation ? (
        <>
          <Card
            title="💰 Đối soát doanh thu"
            subtitle="So sánh số liệu hệ thống với thực tế đếm được"
            stepNumber={1}
          >
            <ReconciliationTable summaries={summaries} openingCashFund={draft.openingCashFund} />
          </Card>

          <Card
            title="📝 Nhập số liệu thực tế"
            subtitle="Kiểm đếm tiền mặt, sao kê ngân hàng và máy POS"
            stepNumber={2}
          >
            <ClosingForm
              draft={draft}
              onUpdate={updateDraft}
              onConfirm={handleConfirm}
              disabled={submitting}
            />
          </Card>
        </>
      ) : null}

      {/* Open invoices */}
      {openInvoices.length > 0 ? (
        <InvoiceList
          invoices={openInvoices}
          title="✅ Hóa đơn chờ chốt"
          subtitle="Các hóa đơn đã thanh toán · Chưa khóa"
        />
      ) : null}

      {/* Closed invoices */}
      {closedInvoices.length > 0 ? (
        <InvoiceList
          invoices={closedInvoices}
          title="🔒 Hóa đơn đã chốt"
          subtitle="Dữ liệu đã khóa · Không thể chỉnh sửa"
        />
      ) : null}

      {/* Closing history */}
      {closings.length > 0 ? <ClosingHistory closings={closings} /> : null}
    </div>
  );
}

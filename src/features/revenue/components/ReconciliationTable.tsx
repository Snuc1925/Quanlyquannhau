import { Badge } from "@/components/ui";
import type { PaymentSummary } from "../types";

type ReconciliationTableProps = {
  summaries: PaymentSummary[];
  openingCashFund: number;
};

const paymentLabels: Record<string, string> = {
  cash: "💵 Tiền mặt",
  bank: "🏦 Chuyển khoản",
  card: "💳 Thẻ",
  ewallet: "�� Ví điện tử",
};

export function ReconciliationTable({
  summaries,
  openingCashFund,
}: ReconciliationTableProps) {
  const grandSystemTotal = summaries.reduce((sum, s) => sum + s.systemAmount, 0);
  const grandActualTotal = summaries.reduce((sum, s) => sum + s.actualAmount, 0);
  const grandDiscrepancy = grandActualTotal - grandSystemTotal;

  // For cash: subtract opening fund to get actual revenue to deposit
  const cashSummary = summaries.find((s) => s.method === "cash");
  const netCashRevenue = cashSummary
    ? cashSummary.actualAmount - openingCashFund
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
      <div
        style={{
          overflowX: "auto",
          border: "1px solid var(--c-gray-200)",
          borderRadius: "var(--r-md)",
        }}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Phương thức</th>
              <th style={{ textAlign: "right" }}>Hệ thống (₫)</th>
              <th style={{ textAlign: "right" }}>Thực tế (₫)</th>
              <th style={{ textAlign: "right" }}>Chênh lệch</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => {
              const isMatch = summary.discrepancy === 0;
              const isOver = summary.discrepancy > 0;

              return (
                <tr key={summary.method}>
                  <td style={{ fontWeight: "var(--fw-medium)" }}>
                    {paymentLabels[summary.method]}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                    {summary.systemAmount.toLocaleString("vi-VN")}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                    {summary.actualAmount.toLocaleString("vi-VN")}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {isMatch ? (
                      <Badge variant="success">✓ Khớp</Badge>
                    ) : (
                      <Badge variant={isOver ? "info" : "warning"}>
                        {isOver ? "+" : ""}
                        {summary.discrepancy.toLocaleString("vi-VN")} ₫
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: "var(--fw-bold)", fontSize: "var(--fs-lg)" }}>
              <td>Tổng cộng</td>
              <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                {grandSystemTotal.toLocaleString("vi-VN")}
              </td>
              <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                {grandActualTotal.toLocaleString("vi-VN")}
              </td>
              <td style={{ textAlign: "right", color: grandDiscrepancy === 0 ? "var(--c-success)" : "var(--c-warning)" }}>
                {grandDiscrepancy === 0 ? "✓ Khớp" : `${grandDiscrepancy > 0 ? "+" : ""}${grandDiscrepancy.toLocaleString("vi-VN")} ₫`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {cashSummary && openingCashFund > 0 ? (
        <div
          style={{
            padding: "var(--sp-4)",
            background: "var(--c-primary-50)",
            border: "1px solid var(--c-primary-200)",
            borderRadius: "var(--r-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "var(--fs-sm)",
              color: "var(--c-gray-700)",
              marginBottom: "var(--sp-2)",
            }}
          >
            <span>💵 Tiền mặt thực tế:</span>
            <strong>{cashSummary.actualAmount.toLocaleString("vi-VN")} ₫</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "var(--fs-sm)",
              color: "var(--c-gray-700)",
              marginBottom: "var(--sp-2)",
            }}
          >
            <span>➖ Quỹ đầu ca (tiền lẻ):</span>
            <strong>-{openingCashFund.toLocaleString("vi-VN")} ₫</strong>
          </div>
          <div className="divider" style={{ margin: "var(--sp-2) 0" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "var(--fs-lg)",
              color: "var(--c-primary-700)",
              fontWeight: "var(--fw-bold)",
            }}
          >
            <span>💰 Doanh thu tiền mặt cần nộp:</span>
            <span>{netCashRevenue.toLocaleString("vi-VN")} ₫</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

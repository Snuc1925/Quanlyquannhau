import { Input, Button } from "@/components/ui";
import type { ReconciliationDraft } from "../types";

type ClosingFormProps = {
  draft: ReconciliationDraft;
  onUpdate: (updates: Partial<ReconciliationDraft>) => void;
  onConfirm: (type: "SHIFT" | "DAY") => void;
  disabled: boolean;
};

export function ClosingForm({
  draft,
  onUpdate,
  onConfirm,
  disabled,
}: ClosingFormProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
      <div className="grid grid-2" style={{ gap: "var(--sp-4)" }}>
        <Input
          id="openingCashFund"
          label="💰 Quỹ tiền lẻ đầu ca"
          type="number"
          min={0}
          value={draft.openingCashFund}
          onChange={(e) =>
            onUpdate({ openingCashFund: Number(e.target.value) || 0 })
          }
          disabled={disabled}
        />
        <div />
      </div>

      <div className="grid grid-2" style={{ gap: "var(--sp-4)" }}>
        <Input
          id="actualCash"
          label="💵 Tiền mặt thực tế"
          type="number"
          min={0}
          value={draft.actualCash}
          onChange={(e) => onUpdate({ actualCash: Number(e.target.value) || 0 })}
          placeholder="Kiểm đếm két tiền..."
          required
          disabled={disabled}
        />
        <Input
          id="actualBank"
          label="🏦 Chuyển khoản thực tế"
          type="number"
          min={0}
          value={draft.actualBank}
          onChange={(e) => onUpdate({ actualBank: Number(e.target.value) || 0 })}
          placeholder="Đối chiếu sao kê..."
          required
          disabled={disabled}
        />
      </div>

      <div className="grid grid-2" style={{ gap: "var(--sp-4)" }}>
        <Input
          id="actualCard"
          label="💳 Thẻ thực tế"
          type="number"
          min={0}
          value={draft.actualCard}
          onChange={(e) => onUpdate({ actualCard: Number(e.target.value) || 0 })}
          placeholder="Kiểm tra máy POS..."
          required
          disabled={disabled}
        />
        <Input
          id="actualEwallet"
          label="📱 Ví điện tử thực tế"
          type="number"
          min={0}
          value={draft.actualEwallet}
          onChange={(e) =>
            onUpdate({ actualEwallet: Number(e.target.value) || 0 })
          }
          placeholder="Kiểm tra app ví..."
          required
          disabled={disabled}
        />
      </div>

      <Input
        id="notes"
        label="📝 Ghi chú (tuỳ chọn)"
        value={draft.notes}
        onChange={(e) => onUpdate({ notes: e.target.value })}
        placeholder="Ghi chú về chênh lệch, sự cố..."
        disabled={disabled}
      />

      <div
        className="flex items-center"
        style={{ gap: "var(--sp-3)", justifyContent: "flex-end" }}
      >
        <Button
          size="lg"
          variant="default"
          onClick={() => onConfirm("SHIFT")}
          disabled={disabled}
        >
          🔒 Chốt ca
        </Button>
        <Button
          size="lg"
          variant="primary"
          onClick={() => onConfirm("DAY")}
          disabled={disabled}
        >
          🔒 Chốt ngày
        </Button>
      </div>
    </div>
  );
}

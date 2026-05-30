import { useState, useMemo } from "react";
import { Button, Card } from "@/components/ui";
import { useToast } from "@/app/providers/ToastProvider";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useInventoryStore } from "../store/inventoryStore";
import { SupplierSelector } from "../components/SupplierSelector";
import { IngredientSearch } from "../components/IngredientSearch";
import { ReceiptLineItems } from "../components/ReceiptLineItems";
import { StockTable } from "../components/StockTable";

export function InventoryPage() {
  const { session } = useAuthStore();
  const {
    suppliers,
    ingredients,
    draft,
    setSupplier,
    addItem,
    updateItem,
    removeItem,
    confirmReceipt,
    clearDraft,
    getIngredientById,
  } = useInventoryStore();

  const { pushToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const disabledIngredientIds = useMemo(
    () => draft.items.map((it) => it.ingredientId),
    [draft.items]
  );

  const canSubmit = draft.supplierId && draft.items.length > 0;

  const handleConfirm = async () => {
    if (!session) return;

    setSubmitting(true);
    try {
      await new Promise((r) => window.setTimeout(r, 800));
      const receipt = confirmReceipt(session.username);
      pushToast({
        kind: "success",
        title: "✅ Nhập kho thành công!",
        description: `Phiếu ${receipt.id.slice(0, 12)} đã được lưu · Tổng ${receipt.grandTotal.toLocaleString()} ₫`,
      });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Không thể xác nhận phiếu nhập",
        description: err instanceof Error ? err.message : "Lỗi không xác định",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
      <Card
        title="📦 Tạo phiếu nhập kho"
        subtitle="Chọn nhà cung cấp và thêm nguyên liệu cần nhập"
        stepNumber={1}
        stepDone={Boolean(draft.supplierId)}
      >
        <SupplierSelector
          suppliers={suppliers}
          value={draft.supplierId}
          onChange={setSupplier}
        />
      </Card>

      <Card
        title="🔍 Tìm kiếm nguyên liệu"
        subtitle="Gõ tên để tìm và thêm vào phiếu nhập"
        stepNumber={2}
      >
        <IngredientSearch
          ingredients={ingredients}
          onAdd={addItem}
          disabledIds={disabledIngredientIds}
        />
      </Card>

      <Card
        title="📝 Chi tiết phiếu nhập"
        subtitle="Nhập số lượng, đơn giá và hạn sử dụng cho từng nguyên liệu"
        stepNumber={3}
        stepDone={draft.items.length > 0}
      >
        <ReceiptLineItems
          items={draft.items}
          getIngredient={getIngredientById}
          onUpdate={updateItem}
          onRemove={removeItem}
        />

        {draft.items.length > 0 ? (
          <div
            className="flex items-center"
            style={{
              marginTop: "var(--sp-4)",
              gap: "var(--sp-3)",
              justifyContent: "flex-end",
            }}
          >
            <Button variant="ghost" onClick={clearDraft} disabled={submitting}>
              🗑 Xóa toàn bộ
            </Button>
            <Button
              size="lg"
              onClick={handleConfirm}
              disabled={!canSubmit || submitting}
            >
              {submitting ? "⏳ Đang xác nhận..." : "✅ Xác nhận nhập kho"}
            </Button>
          </div>
        ) : null}
      </Card>

      <StockTable ingredients={ingredients} />
    </div>
  );
}

import { Input, Button } from "@/components/ui";
import type { Ingredient, ReceiptLineItem } from "../types";

type ReceiptLineItemsProps = {
  items: ReceiptLineItem[];
  getIngredient: (id: string) => Ingredient | undefined;
  onUpdate: (
    ingredientId: string,
    updates: Partial<Omit<ReceiptLineItem, "ingredientId" | "total">>
  ) => void;
  onRemove: (ingredientId: string) => void;
};

export function ReceiptLineItems({
  items,
  getIngredient,
  onUpdate,
  onRemove,
}: ReceiptLineItemsProps) {
  if (items.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "var(--sp-6)",
          color: "var(--c-gray-400)",
          border: "2px dashed var(--c-gray-200)",
          borderRadius: "var(--r-md)",
        }}
      >
        📦 Chưa có nguyên liệu nào · Tìm kiếm và thêm ở trên
      </div>
    );
  }

  const grandTotal = items.reduce((sum, it) => sum + it.total, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
      {items.map((item) => {
        const ingredient = getIngredient(item.ingredientId);
        if (!ingredient) return null;

        return (
          <div
            key={item.ingredientId}
            style={{
              padding: "var(--sp-4)",
              border: "1px solid var(--c-gray-200)",
              borderRadius: "var(--r-md)",
              background: "var(--c-white)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--sp-3)",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "var(--fw-semi)",
                    color: "var(--c-gray-900)",
                    fontSize: "var(--fs-base)",
                  }}
                >
                  {ingredient.name}
                </div>
                <div className="text-muted">Đơn vị: {ingredient.unit}</div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onRemove(item.ingredientId)}
              >
                🗑 Xóa
              </Button>
            </div>

            <div className="grid grid-3" style={{ gap: "var(--sp-3)" }}>
              <Input
                id={`qty-${item.ingredientId}`}
                label="Số lượng"
                type="number"
                min={0}
                step={0.1}
                value={item.quantity}
                onChange={(e) =>
                  onUpdate(item.ingredientId, {
                    quantity: Number(e.target.value) || 0,
                  })
                }
              />
              <Input
                id={`price-${item.ingredientId}`}
                label="Đơn giá (₫)"
                type="number"
                min={0}
                value={item.unitPrice}
                onChange={(e) =>
                  onUpdate(item.ingredientId, {
                    unitPrice: Number(e.target.value) || 0,
                  })
                }
              />
              {ingredient.hasExpiry ? (
                <Input
                  id={`expiry-${item.ingredientId}`}
                  label="Hạn sử dụng"
                  type="date"
                  value={item.expiryDate ?? ""}
                  onChange={(e) =>
                    onUpdate(item.ingredientId, {
                      expiryDate: e.target.value || undefined,
                    })
                  }
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "var(--c-gray-400)",
                    fontSize: "var(--fs-sm)",
                  }}
                >
                  ♾️ Không có hạn
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "var(--sp-3)",
                paddingTop: "var(--sp-3)",
                borderTop: "1px solid var(--c-gray-100)",
                textAlign: "right",
              }}
            >
              <span style={{ color: "var(--c-gray-600)", fontSize: "var(--fs-sm)" }}>
                Thành tiền:{" "}
              </span>
              <strong
                style={{
                  color: "var(--c-primary-600)",
                  fontSize: "var(--fs-lg)",
                  fontWeight: "var(--fw-bold)",
                }}
              >
                {item.total.toLocaleString("vi-VN")} ₫
              </strong>
            </div>
          </div>
        );
      })}

      <div
        style={{
          padding: "var(--sp-4)",
          background: "var(--c-primary-50)",
          border: "2px solid var(--c-primary-200)",
          borderRadius: "var(--r-md)",
          textAlign: "right",
        }}
      >
        <div style={{ color: "var(--c-gray-700)", fontSize: "var(--fs-sm)", marginBottom: "var(--sp-1)" }}>
          Tổng cộng phiếu nhập
        </div>
        <div
          style={{
            fontSize: "var(--fs-2xl)",
            fontWeight: "var(--fw-bold)",
            color: "var(--c-primary-700)",
          }}
        >
          {grandTotal.toLocaleString("vi-VN")} ₫
        </div>
      </div>
    </div>
  );
}

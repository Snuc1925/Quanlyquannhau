import type { MenuItem, PreOrderItem } from "@/features/reservations/types";

type PreOrderMenuProps = {
  menuItems: MenuItem[];
  preOrders: PreOrderItem[];
  onChangeQuantity: (menuItemId: string, quantity: number) => void;
};

export function PreOrderMenu({
  menuItems,
  preOrders,
  onChangeQuantity
}: PreOrderMenuProps) {
  const preOrderMap = new Map(
    preOrders.map((item) => [item.menuItemId, item.quantity])
  );
  const availableItems = menuItems.filter((item) => item.status === "AVAILABLE");

  return (
    <>
      <div className="menu-grid">
        {availableItems.map((item) => {
          const qty = preOrderMap.get(item.id) ?? 0;
          return (
            <div className="menu-item" key={item.id}>
              <div className="menu-item-name">{item.name}</div>
              <div className="menu-item-price">
                {item.price.toLocaleString("vi-VN")}đ / phần
              </div>
              <div className="qty-control">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => onChangeQuantity(item.id, qty - 1)}
                  disabled={qty === 0}
                >
                  −
                </button>
                <span className="qty-value">{qty === 0 ? "0" : qty}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => onChangeQuantity(item.id, qty + 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {preOrders.length > 0 ? (
        <div
          style={{
            marginTop: "var(--sp-4)",
            padding: "var(--sp-3) var(--sp-4)",
            background: "var(--c-primary-50)",
            border: "1px solid var(--c-primary-100)",
            borderRadius: "var(--r-sm)",
            fontSize: "var(--fs-sm)",
            color: "var(--c-primary-600)",
            fontWeight: "var(--fw-medium)"
          }}
        >
          ✅ Đã chọn {preOrders.length} món với{" "}
          {preOrders.reduce((sum, o) => sum + o.quantity, 0)} phần
        </div>
      ) : null}
    </>
  );
}

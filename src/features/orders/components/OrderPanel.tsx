import React, { useState, useMemo } from "react";
import { useMenuStore } from "@/features/menu/store/menuStore";
import type { MenuItem } from "@/features/menu/types";
import { CATEGORY_META } from "@/features/menu/types";
import type { ActiveBill } from "../types";
import type { DiningTable } from "@/features/reservations/types";

type Props = {
  table: DiningTable;
  bill: ActiveBill | undefined;
  onSendOrder: (lines: { menuItemId: string; name: string; price: number; quantity: number; note: string }[]) => void;
  onCloseTable: () => void;
};

type CartItem = {
  item: MenuItem;
  quantity: number;
  note: string;
};

function fmt(n: number) { return n.toLocaleString("vi-VN") + "₫"; }
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export const OrderPanel: React.FC<Props> = ({ table, bill, onSendOrder, onCloseTable }) => {
  const { items } = useMenuStore();
  const availableItems = useMemo(() => items.filter((i) => i.available), [items]);

  const [catFilter, setCatFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const displayedMenu = useMemo(() => {
    return availableItems.filter((i) => {
      const matchCat = catFilter === "all" || i.category === catFilter;
      const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [availableItems, catFilter, search]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.item.id === item.id);
      if (idx >= 0) {
        return prev.map((c, i) => (i === idx ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { item, quantity: 1, note: "" }];
    });
  };

  const updateCart = (itemId: string, field: "quantity" | "note", val: string | number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item.id === itemId ? { ...c, [field]: val } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const cartTotal = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);
  const billTotal = bill
    ? bill.lines.reduce((s, l) => s + l.price * l.quantity, 0)
    : 0;

  const handleSend = () => {
    if (!cart.length) return;
    onSendOrder(cart.map((c) => ({
      menuItemId: c.item.id,
      name: c.item.name,
      price: c.item.price,
      quantity: c.quantity,
      note: c.note,
    })));
    setCart([]);
  };

  const usedCategories = useMemo(
    () => [...new Set(availableItems.map((i) => i.category))],
    [availableItems]
  );

  return (
    <div className="order-panel">
      {/* ── Panel header ─────────────────────────────── */}
      <div className="order-panel-header">
        <div>
          <h2 className="order-panel-title">
            🍽️ Bàn <strong>{table.code}</strong>
          </h2>
          <p className="order-panel-sub">
            {bill
              ? `Mở từ ${fmtTime(bill.openedAt)} · ${bill.lines.length} món đã gọi`
              : "Bàn vừa được mở"}
          </p>
        </div>
        <button
          className="btn btn-outline btn--sm btn--danger-outline"
          onClick={onCloseTable}
          title="Đóng bàn và lưu vào lịch sử"
        >
          🔒 Đóng bàn
        </button>
      </div>

      <div className="order-body">
        {/* ══════════ LEFT: menu browser ═══════════════ */}
        <div className="order-menu-col">
          <div className="order-menu-header">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Tìm món…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <div className="order-cat-tabs">
              <button
                className={`order-cat-tab ${catFilter === "all" ? "order-cat-tab--active" : ""}`}
                onClick={() => setCatFilter("all")}
              >
                Tất cả
              </button>
              {usedCategories.map((k) => {
                const m = CATEGORY_META[k];
                return (
                  <button
                    key={k}
                    className={`order-cat-tab ${catFilter === k ? "order-cat-tab--active" : ""}`}
                    style={catFilter === k ? { background: m.bg, color: m.color, borderColor: m.color } : undefined}
                    onClick={() => setCatFilter(k)}
                  >
                    {m.icon} {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="order-menu-grid">
            {displayedMenu.length === 0 ? (
              <p className="order-menu-empty">Không tìm thấy món nào</p>
            ) : (
              displayedMenu.map((item) => {
                const inCart = cart.find((c) => c.item.id === item.id);
                return (
                  <button
                    key={item.id}
                    className={`order-menu-item ${inCart ? "order-menu-item--active" : ""}`}
                    onClick={() => addToCart(item)}
                  >
                    <span className="order-menu-item__emoji">{item.emoji}</span>
                    <span className="order-menu-item__name">{item.name}</span>
                    <span className="order-menu-item__price">{fmt(item.price)}</span>
                    {inCart && (
                      <span className="order-menu-item__badge">{inCart.quantity}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ══════════ RIGHT: cart + sent lines ═════════ */}
        <div className="order-right-col">
          {/* Cart (pending order) */}
          <div className="order-cart-section">
            <p className="order-section-title">🛒 Đang chọn ({cart.length} loại)</p>

            {cart.length === 0 ? (
              <p className="order-cart-empty">Chưa có món nào — bấm vào thực đơn để thêm</p>
            ) : (
              <>
                <div className="order-cart-list">
                  {cart.map((c) => (
                    <div key={c.item.id} className="order-cart-item">
                      <span className="cart-item-emoji">{c.item.emoji}</span>
                      <div className="cart-item-info">
                        <p className="cart-item-name">{c.item.name}</p>
                        <input
                          className="cart-item-note field-input"
                          placeholder="Ghi chú (vd: không cay, ít đá)"
                          value={c.note}
                          onChange={(e) => updateCart(c.item.id, "note", e.target.value)}
                        />
                      </div>
                      <div className="cart-item-qty">
                        <button className="qty-btn" onClick={() => updateCart(c.item.id, "quantity", c.quantity - 1)}>−</button>
                        <span className="qty-val">{c.quantity}</span>
                        <button className="qty-btn" onClick={() => updateCart(c.item.id, "quantity", c.quantity + 1)}>+</button>
                      </div>
                      <div className="cart-item-right">
                        <p className="cart-item-total">{fmt(c.item.price * c.quantity)}</p>
                        <button className="cart-remove-btn" onClick={() => removeFromCart(c.item.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-cart-footer">
                  <p className="order-subtotal">
                    Tạm tính: <strong>{fmt(cartTotal)}</strong>
                  </p>
                  <button className="btn btn-primary" onClick={handleSend}>
                    📤 Gửi order ({cart.length} món)
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sent lines (running bill) */}
          <div className="order-sent-section">
            <p className="order-section-title">
              📋 Hóa đơn tạm tính
              {bill && bill.lines.length > 0 && (
                <span className="order-section-total">{fmt(billTotal)}</span>
              )}
            </p>

            {!bill || bill.lines.length === 0 ? (
              <p className="order-cart-empty">Chưa có món nào được gửi</p>
            ) : (
              <div className="order-sent-list">
                {bill.lines.map((line) => (
                  <div key={line.id} className="order-sent-item">
                    <span className="sent-time">{fmtTime(line.sentAt)}</span>
                    <span className="sent-name">{line.name}</span>
                    {line.note && <span className="sent-note">💬 {line.note}</span>}
                    <span className="sent-qty">×{line.quantity}</span>
                    <span className="sent-total">{fmt(line.price * line.quantity)}</span>
                  </div>
                ))}
                <div className="order-bill-total">
                  <span>Tổng cộng</span>
                  <strong>{fmt(billTotal)}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

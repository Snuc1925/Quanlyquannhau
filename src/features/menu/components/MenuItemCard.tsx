import React from "react";
import type { MenuItem } from "../types";
import { CATEGORY_META } from "../types";

type Props = {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggle: (id: string) => void;
};

export const MenuItemCard: React.FC<Props> = ({ item, onEdit, onDelete, onToggle }) => {
  const cat = CATEGORY_META[item.category];

  return (
    <div className={`menu-card ${!item.available ? "menu-card--unavailable" : ""}`}>
      {/* emoji + category pill */}
      <div className="menu-card__hero">
        <span className="menu-card__emoji">{item.emoji}</span>
        <span
          className="menu-card__cat-pill"
          style={{ color: cat.color, background: cat.bg }}
        >
          {cat.icon} {cat.label}
        </span>
      </div>

      {/* body */}
      <div className="menu-card__body">
        <p className="menu-card__name">{item.name}</p>
        <p className="menu-card__desc">{item.description}</p>
        <p className="menu-card__price">
          {item.price.toLocaleString("vi-VN")}₫
        </p>
      </div>

      {/* footer */}
      <div className="menu-card__footer">
        <button
          className={`toggle-chip ${item.available ? "toggle-chip--on" : "toggle-chip--off"}`}
          onClick={() => onToggle(item.id)}
          title={item.available ? "Đang bán – bấm để ngừng" : "Hết hàng – bấm để mở"}
        >
          <span className="toggle-chip__dot" />
          {item.available ? "Còn hàng" : "Hết hàng"}
        </button>
        <div className="menu-card__actions">
          <button className="icon-btn icon-btn--edit" onClick={() => onEdit(item)} title="Sửa">
            ✏️
          </button>
          <button className="icon-btn icon-btn--delete" onClick={() => onDelete(item)} title="Xóa">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

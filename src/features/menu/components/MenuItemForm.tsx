import React, { useState, useEffect } from "react";
import type { MenuItem, MenuFormData, MenuCategory } from "../types";
import { CATEGORY_META } from "../types";

type Props = {
  initial?: MenuItem;
  onSave: (data: MenuFormData) => void;
  onClose: () => void;
};

const EMPTY: MenuFormData = {
  name: "",
  category: "bia",
  price: 0,
  description: "",
  emoji: "🍺",
  available: true,
};

export const MenuItemForm: React.FC<Props> = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState<MenuFormData>(initial ? { ...initial } : EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof MenuFormData, string>>>({});

  useEffect(() => {
    setForm(initial ? { ...initial } : EMPTY);
    setErrors({});
  }, [initial]);

  const set = <K extends keyof MenuFormData>(key: K, val: MenuFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Tên món không được để trống";
    if (form.price <= 0) e.price = "Giá phải lớn hơn 0";
    if (!form.emoji.trim()) e.emoji = "Hãy nhập emoji hoặc icon";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box menu-form-modal" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {initial ? "✏️ Sửa món" : "➕ Thêm món mới"}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body menu-form-body">
            {/* emoji + name row */}
            <div className="form-row-2">
              <div className="field-group" style={{ flex: "0 0 100px" }}>
                <label className="field-label">Icon / Emoji</label>
                <input
                  className={`field-input text-center text-2xl ${errors.emoji ? "field-input--error" : ""}`}
                  value={form.emoji}
                  onChange={(e) => set("emoji", e.target.value)}
                  placeholder="🍺"
                  maxLength={4}
                />
                {errors.emoji && <p className="field-error">{errors.emoji}</p>}
              </div>
              <div className="field-group" style={{ flex: 1 }}>
                <label className="field-label">Tên món *</label>
                <input
                  className={`field-input ${errors.name ? "field-input--error" : ""}`}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="VD: Bia hơi Hà Nội"
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
            </div>

            {/* category */}
            <div className="field-group">
              <label className="field-label">Danh mục</label>
              <div className="cat-radio-group">
                {(Object.keys(CATEGORY_META) as MenuCategory[]).map((k) => {
                  const m = CATEGORY_META[k];
                  return (
                    <label
                      key={k}
                      className={`cat-radio ${form.category === k ? "cat-radio--active" : ""}`}
                      style={
                        form.category === k
                          ? { color: m.color, background: m.bg, borderColor: m.color }
                          : undefined
                      }
                    >
                      <input
                        type="radio"
                        name="category"
                        value={k}
                        checked={form.category === k}
                        onChange={() => set("category", k)}
                        style={{ display: "none" }}
                      />
                      {m.icon} {m.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* price + availability row */}
            <div className="form-row-2">
              <div className="field-group">
                <label className="field-label">Giá bán (₫) *</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  className={`field-input ${errors.price ? "field-input--error" : ""}`}
                  value={form.price || ""}
                  onChange={(e) => set("price", parseInt(e.target.value || "0", 10))}
                  placeholder="25000"
                />
                {errors.price && <p className="field-error">{errors.price}</p>}
              </div>
              <div className="field-group">
                <label className="field-label">Trạng thái</label>
                <div className="avail-toggle-row">
                  <button
                    type="button"
                    className={`avail-btn ${form.available ? "avail-btn--on" : ""}`}
                    onClick={() => set("available", true)}
                  >
                    ✅ Còn hàng
                  </button>
                  <button
                    type="button"
                    className={`avail-btn ${!form.available ? "avail-btn--off" : ""}`}
                    onClick={() => set("available", false)}
                  >
                    ❌ Hết hàng
                  </button>
                </div>
              </div>
            </div>

            {/* description */}
            <div className="field-group">
              <label className="field-label">Mô tả</label>
              <textarea
                className="field-input field-textarea"
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Mô tả ngắn về món ăn / đồ uống…"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Huỷ
            </button>
            <button type="submit" className="btn btn-primary">
              {initial ? "💾 Lưu thay đổi" : "➕ Thêm vào thực đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

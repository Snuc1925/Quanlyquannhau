import React, { useState, useMemo } from "react";
import { useMenuStore } from "../store/menuStore";
import { MenuItemCard } from "../components/MenuItemCard";
import { MenuItemForm } from "../components/MenuItemForm";
import type { MenuItem, MenuCategory } from "../types";
import { CATEGORY_META } from "../types";

type Filter = "all" | MenuCategory;

export const MenuPage: React.FC = () => {
  const { items, addItem, updateItem, deleteItem, toggleAvailability } = useMenuStore();

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MenuItem | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const displayed = useMemo(() => {
    return items.filter((item) => {
      const matchCat = filter === "all" || item.category === filter;
      const matchSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, filter, search]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    });
    return counts;
  }, [items]);

  const stats = useMemo(() => ({
    total: items.length,
    available: items.filter((i) => i.available).length,
    unavailable: items.filter((i) => !i.available).length,
  }), [items]);

  const openAdd = () => { setEditTarget(undefined); setFormOpen(true); };
  const openEdit = (item: MenuItem) => { setEditTarget(item); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditTarget(undefined); };

  const handleSave = (data: Parameters<typeof addItem>[0]) => {
    if (editTarget) updateItem(editTarget.id, data);
    else addItem(data);
    closeForm();
  };

  const confirmDelete = () => {
    if (deleteTarget) { deleteItem(deleteTarget.id); setDeleteTarget(null); }
  };

  return (
    <div className="page-wrapper">
      {/* ── Header bar ─────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🍽️ Quản lý thực đơn</h1>
          <p className="page-subtitle">Thêm, sửa, xóa và cập nhật trạng thái món</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Thêm món mới
        </button>
      </div>

      {/* ── Stats row ──────────────────────────────── */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon">🗂️</span>
          <div><p className="stat-value">{stats.total}</p><p className="stat-label">Tổng món</p></div>
        </div>
        <div className="stat-card stat-card--success">
          <span className="stat-icon">✅</span>
          <div><p className="stat-value">{stats.available}</p><p className="stat-label">Còn hàng</p></div>
        </div>
        <div className="stat-card stat-card--danger">
          <span className="stat-icon">❌</span>
          <div><p className="stat-value">{stats.unavailable}</p><p className="stat-label">Hết hàng</p></div>
        </div>
      </div>

      {/* ── Search + filter ────────────────────────── */}
      <div className="menu-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Tìm theo tên món…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        <div className="cat-filter-tabs">
          <button
            className={`cat-tab ${filter === "all" ? "cat-tab--active" : ""}`}
            onClick={() => setFilter("all")}
          >
            📋 Tất cả <span className="cat-tab__count">{catCounts.all}</span>
          </button>
          {(Object.keys(CATEGORY_META) as MenuCategory[]).map((k) => {
            const m = CATEGORY_META[k];
            return (
              <button
                key={k}
                className={`cat-tab ${filter === k ? "cat-tab--active" : ""}`}
                style={filter === k ? { color: m.color, borderBottomColor: m.color } : undefined}
                onClick={() => setFilter(k)}
              >
                {m.icon} {m.label} <span className="cat-tab__count">{catCounts[k] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__icon">🔍</p>
          <p className="empty-state__title">Không tìm thấy món nào</p>
          <p className="empty-state__desc">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="menu-grid">
          {displayed.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onToggle={toggleAvailability}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit form modal ──────────────────── */}
      {formOpen && (
        <MenuItemForm initial={editTarget} onSave={handleSave} onClose={closeForm} />
      )}

      {/* ── Delete confirm modal ───────────────────── */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🗑️ Xác nhận xóa</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc muốn xóa món{" "}
                <strong>
                  {deleteTarget.emoji} {deleteTarget.name}
                </strong>{" "}
                khỏi thực đơn?
              </p>
              <p className="text-danger" style={{ marginTop: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>
                Huỷ
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                🗑️ Xóa món này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

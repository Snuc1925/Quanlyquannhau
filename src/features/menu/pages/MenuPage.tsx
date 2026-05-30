import React, { useMemo, useState } from "react";
import { MenuItemForm } from "../components/MenuItemForm";
import { useMenuStore } from "../store/menuStore";
import type { MenuCategory, MenuItem } from "../types";
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
      const matchSearch = search.trim() === "" || item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [filter, items, search]);

  const stats = useMemo(
    () => ({
      total: items.length,
      available: items.filter((item) => item.available).length,
      unavailable: items.filter((item) => !item.available).length,
      categories: new Set(items.map((item) => item.category)).size,
    }),
    [items],
  );

  const openAdd = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditTarget(item);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditTarget(undefined);
  };

  const handleSave = (data: Parameters<typeof addItem>[0]) => {
    if (editTarget) {
      updateItem(editTarget.id, data);
    } else {
      addItem(data);
    }
    closeForm();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="mnu-page">
      <section className="mnu-header">
        <div>
          <h1>Thiết lập thực đơn</h1>
          <p>Quản lý món ăn, giá bán và trạng thái còn hàng theo một giao diện đồng nhất.</p>
        </div>
        <button className="mnu-primary-btn" onClick={openAdd} type="button">
          + Thêm món mới
        </button>
      </section>

      <section className="mnu-stats">
        <article className="mnu-stat-card">
          <span className="mnu-stat-icon">🍽️</span>
          <div>
            <h3>{stats.total}</h3>
            <p>Tổng món</p>
          </div>
        </article>
        <article className="mnu-stat-card mnu-stat-card--green">
          <span className="mnu-stat-icon">✅</span>
          <div>
            <h3>{stats.available}</h3>
            <p>Còn hàng</p>
          </div>
        </article>
        <article className="mnu-stat-card mnu-stat-card--amber">
          <span className="mnu-stat-icon">⚠️</span>
          <div>
            <h3>{stats.unavailable}</h3>
            <p>Tạm hết</p>
          </div>
        </article>
        <article className="mnu-stat-card mnu-stat-card--blue">
          <span className="mnu-stat-icon">📂</span>
          <div>
            <h3>{stats.categories}</h3>
            <p>Danh mục</p>
          </div>
        </article>
      </section>

      <section className="mnu-panel">
        <header className="mnu-panel-head">
          <div className="mnu-search-wrap">
            <span>🔎</span>
            <input
              type="text"
              placeholder="Tìm theo tên món..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="mnu-filter-chips">
            <button
              type="button"
              className={filter === "all" ? "mnu-chip mnu-chip--active" : "mnu-chip"}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </button>
            {(Object.keys(CATEGORY_META) as MenuCategory[]).map((category) => {
              const meta = CATEGORY_META[category];
              const active = filter === category;
              return (
                <button
                  key={category}
                  type="button"
                  className={active ? "mnu-chip mnu-chip--active" : "mnu-chip"}
                  onClick={() => setFilter(category)}
                  style={active ? { borderColor: meta.color, color: meta.color, background: meta.bg } : undefined}
                >
                  {meta.icon} {meta.label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="mnu-table-wrap">
          <table className="mnu-table">
            <thead>
              <tr>
                <th>Món</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td className="mnu-empty" colSpan={6}>
                    Không có món phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                displayed.map((item) => {
                  const meta = CATEGORY_META[item.category];
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="mnu-item-main">
                          <span className="mnu-item-emoji">{item.emoji}</span>
                          <div>
                            <p className="mnu-item-name">{item.name}</p>
                            <p className="mnu-item-desc">{item.description || "Chưa có mô tả"}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="mnu-category-tag" style={{ color: meta.color, backgroundColor: meta.bg }}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td>{item.price.toLocaleString("vi-VN")}đ</td>
                      <td>
                        <button
                          type="button"
                          className={item.available ? "mnu-status mnu-status--on" : "mnu-status mnu-status--off"}
                          onClick={() => toggleAvailability(item.id)}
                        >
                          {item.available ? "Còn hàng" : "Hết hàng"}
                        </button>
                      </td>
                      <td>{new Date(item.updatedAt).toLocaleString("vi-VN")}</td>
                      <td>
                        <div className="mnu-actions">
                          <button type="button" className="mnu-link-btn" onClick={() => openEdit(item)}>
                            Sửa
                          </button>
                          <button type="button" className="mnu-link-btn mnu-link-btn--danger" onClick={() => setDeleteTarget(item)}>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && <MenuItemForm initial={editTarget} onClose={closeForm} onSave={handleSave} />}

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal mnu-delete-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Xác nhận xóa món</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)} type="button">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Bạn chắc chắn muốn xóa <strong>{deleteTarget.emoji} {deleteTarget.name}</strong> khỏi thực đơn?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} type="button">
                Hủy
              </button>
              <button className="btn btn-danger" onClick={confirmDelete} type="button">
                Xóa món
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

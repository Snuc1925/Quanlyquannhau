import { useState, useMemo } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useInventoryStore } from "../store/inventoryStore";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [tableQuery, setTableQuery] = useState("");
  const [importDate, setImportDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [importCode, setImportCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const disabledIngredientIds = useMemo(
    () => draft.items.map((it) => it.ingredientId),
    [draft.items]
  );

  const stats = useMemo(() => {
    const total = ingredients.length;
    const out = ingredients.filter((ing) => ing.currentStock === 0).length;
    const low = ingredients.filter(
      (ing) => ing.currentStock > 0 && ing.currentStock <= ing.minStock
    ).length;
    const ok = total - low - out;
    return { total, ok, low, out };
  }, [ingredients]);

  const filteredStock = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter((ing) => ing.name.toLowerCase().includes(q));
  }, [ingredients, tableQuery]);

  const ingredientSuggestions = useMemo(() => {
    const q = ingredientQuery.trim().toLowerCase();
    if (!q) return [];
    return ingredients.filter((ing) => ing.name.toLowerCase().includes(q));
  }, [ingredients, ingredientQuery]);

  const grandTotal = useMemo(
    () => draft.items.reduce((sum, item) => sum + item.total, 0),
    [draft.items]
  );

  const selectedSupplier = useMemo(
    () => suppliers.find((sup) => sup.id === draft.supplierId),
    [suppliers, draft.supplierId]
  );

  const canStep2 = Boolean(draft.supplierId);
  const canStep3 = draft.items.length > 0;
  const canStep4 = draft.items.every((item) => item.quantity > 0 && item.unitPrice > 0);
  const canSubmit = canStep2 && canStep3 && canStep4;

  const money = (v: number) => `${v.toLocaleString("vi-VN")}đ`;
  const formatCurrencyInput = (v: number) => (v > 0 ? v.toLocaleString("vi-VN") : "");
  const parseCurrencyInput = (v: string) => Number(v.replace(/[^\d]/g, "")) || 0;

  const openModal = () => {
    clearDraft();
    setStep(1);
    setIngredientQuery("");
    setImportDate(new Date().toISOString().slice(0, 10));
    setImportCode("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setIngredientQuery("");
    clearDraft();
  };

  const handleNext = () => {
    if (step === 1 && !canStep2) return;
    if (step === 2 && !canStep3) return;
    if (step === 2 && canStep3 && !canStep4) {
      pushToast({
        kind: "error",
        title: "Thiếu dữ liệu số lượng/đơn giá",
        description: "Vui lòng nhập đủ số lượng và đơn giá lớn hơn 0 cho tất cả nguyên liệu.",
      });
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleConfirm = async () => {
    if (!session) return;

    setSubmitting(true);
    try {
      await new Promise((r) => window.setTimeout(r, 800));
      const receipt = confirmReceipt(session.username);
      pushToast({
        kind: "success",
        title: "✅ Nhập kho thành công!",
        description: `Phiếu ${receipt.id.slice(0, 12)} đã được lưu · Tổng ${money(
          receipt.grandTotal
        )}`,
      });
      setIsModalOpen(false);
      setStep(1);
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
    <div className="inv-page">
      <div className="inv-page-header">
        <div>
          <h2 className="inv-title">Tồn kho nguyên liệu</h2>
          <p className="inv-subtitle">
            Theo dõi số lượng và trạng thái tồn kho theo thời gian thực
          </p>
        </div>
        <button type="button" className="inv-btn-primary" onClick={openModal}>
          <span className="inv-btn-icon">＋</span>
          Tạo đơn nhập kho
        </button>
      </div>

      <div className="inv-stats-bar">
        <div className="inv-stat-card">
          <div className="inv-stat-label">Tổng nguyên liệu</div>
          <div className="inv-stat-value">{stats.total}</div>
          <div className="inv-stat-sub">mặt hàng đang theo dõi</div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-label">Đủ hàng</div>
          <div className="inv-stat-value inv-green">{stats.ok}</div>
          <div className="inv-stat-sub">nguyên liệu ổn định</div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-label">Sắp hết</div>
          <div className="inv-stat-value inv-amber">{stats.low}</div>
          <div className="inv-stat-sub">cần theo dõi</div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-label">Hết hàng</div>
          <div className="inv-stat-value inv-red">{stats.out}</div>
          <div className="inv-stat-sub">cần nhập ngay</div>
        </div>
      </div>

      <div className="inv-table-wrap">
        <div className="inv-table-toolbar">
          <div className="inv-search-box">
            <span className="inv-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm nguyên liệu..."
              value={tableQuery}
              onChange={(e) => setTableQuery(e.target.value)}
            />
          </div>
          <span className="inv-table-count">{filteredStock.length} mặt hàng</span>
        </div>
        <table className="inv-table">
          <thead>
            <tr>
              <th>Nguyên liệu</th>
              <th>Tồn kho</th>
              <th>Tối thiểu</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.map((ing) => {
              const isOut = ing.currentStock === 0;
              const isLow = ing.currentStock > 0 && ing.currentStock <= ing.minStock;
              return (
                <tr key={ing.id}>
                  <td>
                    <div className="inv-ingredient-name">{ing.name}</div>
                    <div className="inv-ingredient-unit">
                      {ing.unit} {ing.hasExpiry ? "⏰" : ""}
                    </div>
                  </td>
                  <td className="inv-qty">{ing.currentStock}</td>
                  <td className="inv-min-qty">{ing.minStock}</td>
                  <td>
                    <span
                      className={`inv-badge ${
                        isOut ? "inv-badge-low" : isLow ? "inv-badge-mid" : "inv-badge-ok"
                      }`}
                    >
                      {isOut ? "⛔ Hết hàng" : isLow ? "⚠ Sắp hết" : "✅ Đủ hàng"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className={`inv-modal-backdrop${isModalOpen ? " open" : ""}`}
        onClick={closeModal}
      >
        <div
          className="inv-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Tạo phiếu nhập kho"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="inv-modal-stepper">
            <div className="inv-stepper-row">
              <div className="inv-step-item">
                <div
                  className={`inv-step-circle${step === 1 ? " active" : ""}${step > 1 ? " done" : ""}`}
                >
                  {step > 1 ? "✓" : 1}
                </div>
              </div>
              <div className={`inv-step-connector${step > 1 ? " done" : ""}`} />
              <div className="inv-step-item">
                <div
                  className={`inv-step-circle${step === 2 ? " active" : ""}${step > 2 ? " done" : ""}`}
                >
                  {step > 2 ? "✓" : 2}
                </div>
              </div>
              <div className={`inv-step-connector${step > 2 ? " done" : ""}`} />
              <div className="inv-step-item">
                <div className={`inv-step-circle${step === 3 ? " active" : ""}`}>
                  3
                </div>
              </div>
            </div>
            <div className="inv-step-labels">
              <span className={`inv-step-label-item${step >= 1 ? " active" : ""}`}>Nhà cung cấp</span>
              <span className={`inv-step-label-item${step >= 2 ? " active" : ""}`}>Nguyên liệu &amp; giá</span>
              <span className={`inv-step-label-item${step >= 3 ? " active" : ""}`}>Xác nhận</span>
            </div>
          </div>

          <div className="inv-modal-body">
            {step === 1 ? (
              <div className="inv-step-panel active">
                <h3 className="inv-step-heading">Chọn nhà cung cấp</h3>
                <p className="inv-step-desc">Chọn nhà cung cấp và điền thông tin phiếu nhập</p>

                <div className="inv-form-group">
                  <label>Nhà cung cấp *</label>
                  <select
                    value={draft.supplierId ?? ""}
                    onChange={(e) => setSupplier(e.target.value)}
                  >
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inv-form-group">
                  <label>Ngày nhập *</label>
                  <input
                    type="date"
                    value={importDate}
                    onChange={(e) => setImportDate(e.target.value)}
                  />
                </div>

                <div className="inv-form-group">
                  <label>Mã phiếu nhập</label>
                  <input
                    type="text"
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value)}
                    placeholder="Tự động tạo nếu để trống"
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="inv-step-panel active">
                <h3 className="inv-step-heading">Nguyên liệu &amp; đơn giá</h3>
                <p className="inv-step-desc">Tìm kiếm nguyên liệu, nhập số lượng và đơn giá ngay bên dưới</p>

                <div className="inv-form-group">
                  <label>Tìm kiếm nguyên liệu</label>
                  <div className="inv-ingredient-search-wrap">
                    <input
                      type="text"
                      placeholder="Nhập tên nguyên liệu..."
                      value={ingredientQuery}
                      onChange={(e) => setIngredientQuery(e.target.value)}
                    />
                    {ingredientSuggestions.length > 0 ? (
                      <div className="inv-ingredient-results">
                        {ingredientSuggestions.map((ing) => {
                          const disabled = disabledIngredientIds.includes(ing.id);
                          return (
                            <div className="inv-ingredient-result-item" key={ing.id}>
                              <div className="inv-ing-info">
                                <div className="name">{ing.name}</div>
                                <div className="meta">
                                  Tồn kho: {ing.currentStock} {ing.unit}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="inv-ing-add-btn"
                                onClick={() => !disabled && addItem(ing.id)}
                                disabled={disabled}
                              >
                                {disabled ? "✓" : "+"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : ingredientQuery.trim() ? (
                      <div className="inv-empty-state">Không tìm thấy nguyên liệu phù hợp</div>
                    ) : null}
                  </div>
                </div>

                {draft.items.length === 0 ? (
                  <div className="inv-empty-state">
                    <div className="inv-empty-icon">📦</div>
                    Chưa có nguyên liệu nào được thêm
                  </div>
                ) : (
                  <>
                    <div className="inv-ing-col-labels">
                      <span className="inv-col-spacer" />
                      <span className="inv-col-label">Số lượng</span>
                      <span className="inv-col-label price">Đơn giá</span>
                      <span className="inv-col-label">HSD</span>
                      <span className="inv-col-spacer-small" />
                    </div>

                    <div className="inv-ing-list">
                      {draft.items.map((item) => {
                        const ingredient = getIngredientById(item.ingredientId);
                        if (!ingredient) return null;
                        return (
                          <div className="inv-ing-row" key={item.ingredientId}>
                            <div className="inv-ing-row-name">
                              {ingredient.name}
                              <div className="inv-ing-row-unit">{ingredient.unit}</div>
                            </div>
                            <input
                              type="number"
                              min={0}
                              step={0.1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(item.ingredientId, {
                                  quantity: Number(e.target.value) || 0,
                                })
                              }
                            />
                            <div className="inv-ing-row-price">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={formatCurrencyInput(item.unitPrice)}
                                placeholder="0"
                                onChange={(e) =>
                                  updateItem(item.ingredientId, {
                                    unitPrice: parseCurrencyInput(e.target.value),
                                  })
                                }
                              />
                            </div>
                            {ingredient.hasExpiry ? (
                              <input
                                type="date"
                                value={item.expiryDate ?? ""}
                                onChange={(e) =>
                                  updateItem(item.ingredientId, {
                                    expiryDate: e.target.value || undefined,
                                  })
                                }
                              />
                            ) : (
                              <input type="text" value="Không có hạn" readOnly />
                            )}
                            <button
                              type="button"
                              className="inv-ing-remove"
                              onClick={() => removeItem(item.ingredientId)}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="inv-step-panel active">
                <h3 className="inv-step-heading">Xác nhận phiếu nhập</h3>
                <p className="inv-step-desc">Kiểm tra thông tin trước khi lưu vào hệ thống</p>

                <div className="inv-summary-card">
                  <div className="inv-summary-section-title">Thông tin phiếu</div>
                  <div className="inv-summary-row">
                    <span className="key">Nhà cung cấp</span>
                    <span className="val">{selectedSupplier?.name ?? "--"}</span>
                  </div>
                  <div className="inv-summary-row">
                    <span className="key">Ngày nhập</span>
                    <span className="val">{importDate || "--"}</span>
                  </div>
                  <div className="inv-summary-row">
                    <span className="key">Mã phiếu</span>
                    <span className="val">{importCode || "Tự động tạo"}</span>
                  </div>
                  <div className="inv-summary-row">
                    <span className="key">Số dòng nguyên liệu</span>
                    <span className="val">{draft.items.length}</span>
                  </div>
                </div>

                <div className="inv-summary-card">
                  <div className="inv-summary-section-title">Chi tiết thành tiền</div>
                  {draft.items.map((item) => {
                    const ingredient = getIngredientById(item.ingredientId);
                    if (!ingredient) return null;
                    return (
                      <div className="inv-summary-row" key={item.ingredientId}>
                        <span className="key">
                          {ingredient.name} × {item.quantity}
                        </span>
                        <span className="val">{money(item.total)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="inv-summary-total">
                  <span className="label">Tổng cộng</span>
                  <span className="amount">{money(grandTotal)}</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="inv-modal-footer">
            <span className="inv-step-count">
              Bước {step}/3
            </span>
            {step > 1 ? (
              <button type="button" className="inv-btn-back" onClick={handleBack}>
                ← Quay lại
              </button>
            ) : null}
            <button type="button" className="inv-btn-cancel" onClick={closeModal}>
              Hủy
            </button>
            {step < 3 ? (
              <button
                type="button"
                className="inv-btn-next"
                onClick={handleNext}
                disabled={
                  (step === 1 && !canStep2) ||
                  (step === 2 && !canStep3) ||
                  (step === 2 && !canStep4)
                }
              >
                Tiếp tục →
              </button>
            ) : (
              <button
                type="button"
                className="inv-btn-next inv-btn-submit"
                onClick={handleConfirm}
                disabled={!canSubmit || submitting}
              >
                {submitting ? "Đang lưu..." : "✅ Xác nhận nhập kho"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

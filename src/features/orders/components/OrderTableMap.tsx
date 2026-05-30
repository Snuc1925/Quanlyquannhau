import React from "react";
import type { DiningTable } from "@/features/reservations/types";

type Props = {
  tables: DiningTable[];
  selectedId: string | null;
  onSelect: (table: DiningTable) => void;
};

const STATUS_META = {
  EMPTY:  { label: "Trống",        color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  IN_USE: { label: "Đang dùng",    color: "#1e40af", bg: "#dbeafe", border: "#93c5fd" },
  BOOKED: { label: "Đã đặt",       color: "#92400e", bg: "#fef3c7", border: "#fcd34d" },
  HELD:   { label: "Đang giữ",     color: "#7e22ce", bg: "#f3e8ff", border: "#c4b5fd" },
} as const;

export const OrderTableMap: React.FC<Props> = ({ tables, selectedId, onSelect }) => {
  return (
    <div className="order-table-panel">
      {/* legend */}
      <div className="table-legend">
        {(Object.entries(STATUS_META) as [keyof typeof STATUS_META, (typeof STATUS_META)[keyof typeof STATUS_META]][]).map(
          ([key, m]) => (
            <span key={key} className="legend-item">
              <span className="legend-dot" style={{ background: m.border }} />
              {m.label}
            </span>
          )
        )}
      </div>

      {/* grid */}
      <div className="order-table-grid">
        {tables.map((t) => {
          const m = STATUS_META[t.status];
          const isSelected = t.id === selectedId;
          const isDisabled = t.status === "BOOKED" || t.status === "HELD";
          return (
            <button
              key={t.id}
              className={`order-table-btn${isSelected ? " order-table-btn--selected" : ""}${
                isDisabled ? " order-table-btn--disabled" : ""
              }`}
              style={
                isSelected
                  ? { background: "var(--c-primary)", color: "#fff", borderColor: "var(--c-primary)" }
                  : { background: m.bg, color: m.color, borderColor: m.border }
              }
              onClick={() => !isDisabled && onSelect(t)}
              title={isDisabled ? `Bàn ${t.code} đang được đặt trước` : `Bàn ${t.code} – ${m.label}`}
            >
              <span className="order-table-btn__code">{t.code}</span>
              <span className="order-table-btn__cap">👥 {t.capacity}</span>
              <span className="order-table-btn__status">{isSelected ? "Đang chọn" : m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

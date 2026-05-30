import React, { useState } from "react";
import { useOrderStore } from "../store/orderStore";
import { OrderTableMap } from "../components/OrderTableMap";
import { OrderPanel } from "../components/OrderPanel";
import type { DiningTable } from "@/features/reservations/types";

export const OrderPage: React.FC = () => {
  const { tables, bills, openTable, sendOrder, closeTable } = useOrderStore();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const selectedTable = tables.find((t) => t.id === selectedTableId) ?? null;
  const activeBill = selectedTableId ? bills[selectedTableId] : undefined;

  const inUseCount = tables.filter((t) => t.status === "IN_USE").length;
  const emptyCount = tables.filter((t) => t.status === "EMPTY").length;

  const handleSelectTable = (table: DiningTable) => {
    openTable(table.id);
    setSelectedTableId(table.id);
  };

  const handleSendOrder = (lines: Parameters<typeof sendOrder>[1]) => {
    if (!selectedTableId) return;
    sendOrder(selectedTableId, lines);
  };

  const handleCloseTable = () => {
    if (!selectedTableId) return;
    closeTable(selectedTableId);
    setSelectedTableId(null);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">🍻 Gọi món tại bàn</h1>
          <p className="page-subtitle">Chọn bàn để mở hoặc tiếp tục hóa đơn</p>
        </div>
        <div style={{ display: "flex", gap: "var(--sp-3)" }}>
          <span className="stat-chip stat-chip--blue">
            🟦 {inUseCount} bàn đang dùng
          </span>
          <span className="stat-chip stat-chip--green">
            🟩 {emptyCount} bàn trống
          </span>
        </div>
      </div>

      <div className={`order-layout ${selectedTable ? "order-layout--split" : ""}`}>
        {/* table map always visible */}
        <div className="order-map-col">
          <div className="panel-header">
            <span className="panel-header__icon">🗺️</span>
            <h2 className="panel-header__title">Sơ đồ bàn</h2>
          </div>
          <OrderTableMap
            tables={tables}
            selectedId={selectedTableId}
            onSelect={handleSelectTable}
          />
        </div>

        {/* order panel: shows when a table is selected */}
        {selectedTable ? (
          <OrderPanel
            table={selectedTable}
            bill={activeBill}
            onSendOrder={handleSendOrder}
            onCloseTable={handleCloseTable}
          />
        ) : (
          <div className="order-placeholder">
            <p className="order-placeholder__icon">👆</p>
            <p className="order-placeholder__text">Chọn một bàn để bắt đầu gọi món</p>
            <p className="order-placeholder__sub">
              Bàn <strong>Trống</strong> sẽ tự động mở · Bàn <strong>Đang dùng</strong> sẽ mở tiếp hóa đơn
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

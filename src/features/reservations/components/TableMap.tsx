import { Badge } from "@/components/ui";
import type { DiningTable } from "@/features/reservations/types";

type TableMapProps = {
  tables: DiningTable[];
  availableTableIds: string[];
  selectedTableId: string | null;
  onSelect: (tableId: string) => void;
};

const statusLabel: Record<DiningTable["status"], string> = {
  EMPTY:   "Trống",
  HELD:    "Tạm giữ",
  BOOKED:  "Đã đặt",
  IN_USE:  "Đang dùng"
};

const statusVariant: Record<
  DiningTable["status"],
  "success" | "warning" | "info" | "default"
> = {
  EMPTY:  "success",
  HELD:   "warning",
  BOOKED: "info",
  IN_USE: "default"
};

const statusEmoji: Record<DiningTable["status"], string> = {
  EMPTY:  "🟢",
  HELD:   "🟡",
  BOOKED: "🔵",
  IN_USE: "🟣"
};

export function TableMap({
  tables,
  availableTableIds,
  selectedTableId,
  onSelect
}: TableMapProps) {
  return (
    <div className="table-map">
      {tables.map((table) => {
        const canSelect =
          availableTableIds.includes(table.id) && table.status === "EMPTY";
        const cssStatus = table.status.toLowerCase().replace("_", "_");

        return (
          <button
            key={table.id}
            type="button"
            className={[
              "table-item",
              `table-item-${cssStatus}`,
              selectedTableId === table.id ? "is-selected" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={!canSelect}
            onClick={() => onSelect(table.id)}
            title={canSelect ? `Chọn ${table.code}` : statusLabel[table.status]}
          >
            <span className="table-item-code">{table.code}</span>
            <span className="table-item-cap">{table.capacity} khách</span>
            <Badge variant={statusVariant[table.status]}>
              {statusEmoji[table.status]} {statusLabel[table.status]}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

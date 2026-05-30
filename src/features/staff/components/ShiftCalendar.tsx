import { useMemo } from "react";
import { Button, Badge } from "@/components/ui";
import type { ShiftSlot, RegistrationStatus } from "../types";

type ShiftCalendarProps = {
  shifts: ShiftSlot[];
  staffId: string;
  getStatus: (staffId: string, shiftId: string) => RegistrationStatus | null;
  onRegister: (shiftId: string) => void;
  onCancel: (shiftId: string) => void;
};

const DAYS_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const FULL_DAYS_VI = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const SHIFT_COLORS = {
  "Sáng":  { bg: "#fef9c3", border: "#fde047", text: "#713f12" },
  "Chiều": { bg: "#dbeafe", border: "#93c5fd", text: "#1e3a8a" },
  "Tối":   { bg: "#ede9fe", border: "#c4b5fd", text: "#3b0764" },
};
const STATUS_LABEL: Record<RegistrationStatus, string> = {
  PENDING:  "⏳ Chờ duyệt",
  APPROVED: "✅ Đã duyệt",
  REJECTED: "❌ Từ chối",
};

export function ShiftCalendar({
  shifts,
  staffId,
  getStatus,
  onRegister,
  onCancel,
}: ShiftCalendarProps) {
  // Group shifts by date
  const byDate = useMemo(() => {
    const map = new Map<string, ShiftSlot[]>();
    shifts.forEach((s) => {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    });
    return map;
  }, [shifts]);

  const dates = useMemo(
    () => [...byDate.keys()].sort(),
    [byDate]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${dates.length}, minmax(0, 1fr))`,
          gap: "var(--sp-2)",
        }}
      >
        {dates.map((date, idx) => {
          const d = new Date(date + "T00:00:00");
          const daySlots = byDate.get(date) ?? [];
          const isToday = date === "2026-05-30";

          return (
            <div key={date} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
              {/* Day header */}
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--sp-2)",
                  borderRadius: "var(--r-sm)",
                  background: isToday ? "var(--c-primary-600)" : "var(--c-gray-100)",
                  color: isToday ? "var(--c-white)" : "var(--c-gray-700)",
                  fontWeight: "var(--fw-semi)",
                }}
              >
                <div style={{ fontSize: "var(--fs-sm)" }}>{FULL_DAYS_VI[idx]}</div>
                <div style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)" }}>
                  {d.getDate()}
                </div>
              </div>

              {/* Shift cells */}
              {daySlots.map((shift) => {
                const status = getStatus(staffId, shift.id);
                const isFull = shift.registeredCount >= shift.requiredStaff;
                const colors = SHIFT_COLORS[shift.label];

                return (
                  <div
                    key={shift.id}
                    style={{
                      padding: "var(--sp-2)",
                      borderRadius: "var(--r-sm)",
                      border: `1px solid ${status === "APPROVED" ? "var(--c-success-400)" : status === "PENDING" ? "var(--c-warning)" : colors.border}`,
                      background: status === "APPROVED"
                        ? "var(--c-success-50)"
                        : status === "PENDING"
                        ? "#fffbeb"
                        : colors.bg,
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--sp-1)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "var(--fs-xs)",
                        fontWeight: "var(--fw-bold)",
                        color: colors.text,
                      }}
                    >
                      {shift.label}
                    </div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-gray-500)" }}>
                      {shift.startTime}–{shift.endTime}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--fs-xs)",
                        color: isFull && !status ? "var(--c-danger)" : "var(--c-gray-600)",
                        fontWeight: "var(--fw-medium)",
                      }}
                    >
                      👥 {shift.registeredCount}/{shift.requiredStaff}
                    </div>

                    {status ? (
                      <div
                        style={{
                          fontSize: "var(--fs-xs)",
                          fontWeight: "var(--fw-semi)",
                          color:
                            status === "APPROVED"
                              ? "var(--c-success)"
                              : status === "PENDING"
                              ? "var(--c-warning)"
                              : "var(--c-danger)",
                        }}
                      >
                        {STATUS_LABEL[status]}
                      </div>
                    ) : null}

                    {!status && !isFull ? (
                      <button
                        type="button"
                        onClick={() => onRegister(shift.id)}
                        style={{
                          marginTop: "var(--sp-1)",
                          fontSize: "var(--fs-xs)",
                          padding: "2px 6px",
                          borderRadius: "var(--r-sm)",
                          border: "none",
                          background: "var(--c-primary-600)",
                          color: "var(--c-white)",
                          cursor: "pointer",
                          fontWeight: "var(--fw-medium)",
                        }}
                      >
                        + Đăng ký
                      </button>
                    ) : null}

                    {status === "PENDING" ? (
                      <button
                        type="button"
                        onClick={() => onCancel(shift.id)}
                        style={{
                          marginTop: "var(--sp-1)",
                          fontSize: "var(--fs-xs)",
                          padding: "2px 6px",
                          borderRadius: "var(--r-sm)",
                          border: "1px solid var(--c-danger-300)",
                          background: "transparent",
                          color: "var(--c-danger)",
                          cursor: "pointer",
                        }}
                      >
                        Huỷ
                      </button>
                    ) : null}

                    {isFull && !status ? (
                      <div
                        style={{
                          marginTop: "var(--sp-1)",
                          fontSize: "var(--fs-xs)",
                          color: "var(--c-danger)",
                          fontWeight: "var(--fw-semi)",
                        }}
                      >
                        ⛔ Đủ người
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center" style={{ gap: "var(--sp-3)", flexWrap: "wrap" }}>
        {(["Sáng", "Chiều", "Tối"] as const).map((l) => (
          <div key={l} className="flex items-center" style={{ gap: "var(--sp-1)" }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: SHIFT_COLORS[l].bg,
                border: `1px solid ${SHIFT_COLORS[l].border}`,
              }}
            />
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--c-gray-600)" }}>{l}</span>
          </div>
        ))}
        <div className="flex items-center" style={{ gap: "var(--sp-1)" }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: "var(--c-success-50)", border: "1px solid var(--c-success-400)" }} />
          <span style={{ fontSize: "var(--fs-xs)", color: "var(--c-gray-600)" }}>Đã duyệt</span>
        </div>
        <div className="flex items-center" style={{ gap: "var(--sp-1)" }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: "#fffbeb", border: "1px solid var(--c-warning)" }} />
          <span style={{ fontSize: "var(--fs-xs)", color: "var(--c-gray-600)" }}>Chờ duyệt</span>
        </div>
      </div>
    </div>
  );
}

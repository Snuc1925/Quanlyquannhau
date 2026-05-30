import { useState } from "react";
import { Badge, Button, Card, DataTable, Modal } from "@/components/ui";
import { useToast } from "@/app/providers/ToastProvider";
import type { ShiftRegistration } from "../types";
import { useStaffStore } from "../store/staffStore";

type RegistrationApprovalProps = {
  registrations: ShiftRegistration[];
  reviewerUsername: string;
};

export function RegistrationApproval({
  registrations,
  reviewerUsername,
}: RegistrationApprovalProps) {
  const { getShiftById, getProfileById, approveRegistration, rejectRegistration } =
    useStaffStore();
  const { pushToast } = useToast();
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const pending = registrations.filter((r) => r.status === "PENDING");
  const reviewed = registrations.filter((r) => r.status !== "PENDING");

  const statusColors = {
    PENDING:  "warning",
    APPROVED: "success",
    REJECTED: "danger",
  } as const;

  const statusLabels = {
    PENDING:  "⏳ Chờ duyệt",
    APPROVED: "✅ Đã duyệt",
    REJECTED: "❌ Từ chối",
  };

  const columns = [
    {
      key: "staff",
      title: "Nhân viên",
      render: (r: ShiftRegistration) => {
        const p = getProfileById(r.staffId);
        return (
          <div>
            <div style={{ fontWeight: "var(--fw-semi)" }}>{p?.fullName ?? r.staffId}</div>
            <div className="text-muted">{p?.phone}</div>
          </div>
        );
      },
    },
    {
      key: "shift",
      title: "Ca đăng ký",
      render: (r: ShiftRegistration) => {
        const s = getShiftById(r.shiftId);
        if (!s) return "—";
        return (
          <div>
            <div style={{ fontWeight: "var(--fw-semi)" }}>
              {new Date(s.date + "T00:00:00").toLocaleDateString("vi-VN")} · {s.label}
            </div>
            <div className="text-muted">{s.startTime} – {s.endTime}</div>
          </div>
        );
      },
    },
    {
      key: "registeredAt",
      title: "Đăng ký lúc",
      render: (r: ShiftRegistration) =>
        new Date(r.registeredAt).toLocaleString("vi-VN", { hour12: false }),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (r: ShiftRegistration) => (
        <Badge variant={statusColors[r.status]}>{statusLabels[r.status]}</Badge>
      ),
    },
    {
      key: "action",
      title: "",
      render: (r: ShiftRegistration) =>
        r.status === "PENDING" ? (
          <div className="flex items-center" style={{ gap: "var(--sp-2)" }}>
            <Button
              size="sm"
              onClick={() => {
                approveRegistration(r.id, reviewerUsername);
                pushToast({
                  kind: "success",
                  title: "✅ Đã duyệt ca",
                  description: `${getProfileById(r.staffId)?.fullName} được xác nhận`,
                });
              }}
            >
              Duyệt
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setRejectTarget(r.id);
                setRejectNote("");
              }}
            >
              Từ chối
            </Button>
          </div>
        ) : r.status === "REJECTED" && r.rejectNote ? (
          <span className="text-muted" style={{ fontSize: "var(--fs-xs)" }}>
            {r.rejectNote}
          </span>
        ) : null,
    },
  ];

  return (
    <>
      <Card
        title={`📋 Đăng ký chờ duyệt ${pending.length ? `· ${pending.length} mới` : ""}`}
        subtitle="Xem xét và phê duyệt lịch làm việc cho nhân viên"
      >
        {pending.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "var(--sp-6)",
              color: "var(--c-gray-400)",
              border: "2px dashed var(--c-gray-200)",
              borderRadius: "var(--r-md)",
            }}
          >
            🎉 Không có đăng ký nào chờ duyệt
          </div>
        ) : (
          <DataTable
            data={pending}
            columns={columns}
            emptyText="Không có đăng ký nào"
          />
        )}
      </Card>

      {reviewed.length > 0 ? (
        <Card title="📜 Lịch sử xét duyệt" subtitle="Các đăng ký đã được xử lý">
          <DataTable
            data={reviewed.slice().reverse()}
            columns={columns}
            emptyText=""
          />
        </Card>
      ) : null}

      <Modal
        open={Boolean(rejectTarget)}
        title="Từ chối đăng ký ca"
        onClose={() => setRejectTarget(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>
              Huỷ
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!rejectTarget) return;
                rejectRegistration(rejectTarget, reviewerUsername, rejectNote || "Không phù hợp");
                pushToast({ kind: "info", title: "Đã từ chối đăng ký ca" });
                setRejectTarget(null);
              }}
            >
              Xác nhận từ chối
            </Button>
          </>
        }
      >
        <p style={{ color: "var(--c-gray-600)", marginBottom: "var(--sp-3)" }}>
          Ghi chú lý do từ chối (tuỳ chọn):
        </p>
        <textarea
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="VD: Ca này đã đủ người cấp độ cao hơn..."
          rows={3}
          style={{
            width: "100%",
            padding: "var(--sp-3)",
            border: "1px solid var(--c-gray-300)",
            borderRadius: "var(--r-sm)",
            fontSize: "var(--fs-sm)",
            resize: "vertical",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      </Modal>
    </>
  );
}

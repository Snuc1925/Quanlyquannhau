import { Badge, Card, DataTable } from "@/components/ui";
import type { StaffProfile } from "../types";

type StaffRosterProps = {
  profiles: StaffProfile[];
};

export function StaffRoster({ profiles }: StaffRosterProps) {
  const staff = profiles.filter((p) => p.role === "staff");

  const columns = [
    {
      key: "name",
      title: "Họ tên",
      render: (p: StaffProfile) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "var(--c-primary-100)",
              color: "var(--c-primary-700)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "var(--fw-bold)",
              fontSize: "var(--fs-base)",
              flexShrink: 0,
            }}
          >
            {p.fullName.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: "var(--fw-semi)", color: "var(--c-gray-900)" }}>
              {p.fullName}
            </div>
            <div className="text-muted">{p.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      title: "SĐT",
      render: (p: StaffProfile) => p.phone,
    },
    {
      key: "bank",
      title: "Tài khoản nhận lương",
      render: (p: StaffProfile) => (
        <div>
          <div style={{ fontFamily: "monospace", fontSize: "var(--fs-sm)" }}>
            {p.bankAccount}
          </div>
          <div className="text-muted">{p.bankName}</div>
        </div>
      ),
    },
    {
      key: "hireDate",
      title: "Ngày vào làm",
      render: (p: StaffProfile) =>
        new Date(p.hireDate).toLocaleDateString("vi-VN"),
    },
    {
      key: "hours",
      title: "Giờ tích lũy",
      render: (p: StaffProfile) => (
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontWeight: "var(--fw-bold)",
              fontSize: "var(--fs-lg)",
              color: "var(--c-primary-600)",
            }}
          >
            {p.accumulatedHours}h
          </span>
        </div>
      ),
    },
    {
      key: "salary",
      title: "Thu nhập tích lũy",
      render: (p: StaffProfile) => (
        <span style={{ fontFamily: "monospace", fontWeight: "var(--fw-semi)" }}>
          {(p.hourlyRate * p.accumulatedHours).toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_: StaffProfile) => (
        <Badge variant="success">🟢 Đang làm</Badge>
      ),
    },
  ];

  return (
    <Card
      title="👥 Danh sách nhân sự"
      subtitle={`Tổng ${staff.length} nhân viên đang làm việc`}
    >
      <DataTable data={staff} columns={columns} emptyText="Không có nhân viên nào" />
    </Card>
  );
}

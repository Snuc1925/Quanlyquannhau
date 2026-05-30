import { useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/app/providers/ToastProvider";
import type { StaffProfile } from "../types";

type ProfileCardProps = {
  profile: StaffProfile;
  onSave: (updates: Partial<StaffProfile>) => void;
  readonly?: boolean;
};

const roleLabelMap: Record<string, string> = {
  staff: "🧑‍🍳 Nhân viên",
  manager: "👔 Quản lý",
};

export function ProfileCard({ profile, onSave, readonly }: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: profile.phone,
    email: profile.email,
    bankAccount: profile.bankAccount,
    bankName: profile.bankName,
  });
  const { pushToast } = useToast();

  const months = Math.floor(
    (new Date().getTime() - new Date(profile.hireDate).getTime()) /
      (1000 * 60 * 60 * 24 * 30)
  );

  const handleSave = () => {
    onSave(form);
    setEditing(false);
    pushToast({ kind: "success", title: "✅ Đã lưu thông tin cá nhân" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
      {/* Header strip */}
      <div
        style={{
          padding: "var(--sp-5)",
          background: "linear-gradient(135deg, var(--c-primary-600), var(--c-primary-800))",
          borderRadius: "var(--r-lg)",
          color: "var(--c-white)",
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-4)",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--fs-2xl)",
            fontWeight: "var(--fw-bold)",
            flexShrink: 0,
            border: "3px solid rgba(255,255,255,0.4)",
          }}
        >
          {profile.fullName.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)" }}>
            {profile.fullName}
          </div>
          <div style={{ opacity: 0.85, fontSize: "var(--fs-sm)", marginTop: "var(--sp-1)" }}>
            {roleLabelMap[profile.role]} · Từ {new Date(profile.hireDate).toLocaleDateString("vi-VN")}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)" }}>
            {profile.accumulatedHours}h
          </div>
          <div style={{ opacity: 0.75, fontSize: "var(--fs-xs)" }}>Giờ tích lũy</div>
        </div>
      </div>

      {/* Stat chips */}
      <div className="grid grid-3" style={{ gap: "var(--sp-3)" }}>
        {[
          { label: "Thâm niên", value: `${months} tháng` },
          { label: "Lương/giờ", value: `${profile.hourlyRate.toLocaleString()} ₫` },
          {
            label: "Thu nhập tích lũy",
            value: `${(profile.hourlyRate * profile.accumulatedHours).toLocaleString()} ₫`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "var(--sp-3)",
              background: "var(--c-gray-50)",
              border: "1px solid var(--c-gray-200)",
              borderRadius: "var(--r-md)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: "var(--c-primary-700)" }}>
              {stat.value}
            </div>
            <div className="text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Editable fields */}
      <Card
        title="📋 Thông tin liên hệ"
        action={
          !readonly ? (
            editing ? (
              <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Huỷ
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Lưu
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="default" onClick={() => setEditing(true)}>
                ✏️ Chỉnh sửa
              </Button>
            )
          ) : null
        }
      >
        <div className="grid grid-2" style={{ gap: "var(--sp-4)" }}>
          <Input
            id="phone"
            label="Số điện thoại"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            disabled={!editing}
          />
          <Input
            id="email"
            label="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            disabled={!editing}
          />
          <Input
            id="bankAccount"
            label="Số tài khoản ngân hàng"
            value={form.bankAccount}
            onChange={(e) => setForm((f) => ({ ...f, bankAccount: e.target.value }))}
            disabled={!editing}
          />
          <Input
            id="bankName"
            label="Ngân hàng"
            value={form.bankName}
            onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
            disabled={!editing}
          />
        </div>
      </Card>
    </div>
  );
}

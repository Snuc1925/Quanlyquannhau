import { useState } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useStaffStore } from "../store/staffStore";
import { ProfileCard } from "../components/ProfileCard";
import { ShiftCalendar } from "../components/ShiftCalendar";
import { RegistrationApproval } from "../components/RegistrationApproval";
import { StaffRoster } from "../components/StaffRoster";

// ─── Shared tab component ───────────────────────────────────────
function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        borderBottom: "2px solid var(--c-gray-200)",
        marginBottom: "var(--sp-5)",
      }}
    >
      {tabs.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(i)}
          style={{
            padding: "var(--sp-3) var(--sp-5)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontWeight: "var(--fw-medium)",
            fontSize: "var(--fs-base)",
            color: active === i ? "var(--c-primary-700)" : "var(--c-gray-500)",
            borderBottom: active === i
              ? "3px solid var(--c-primary-600)"
              : "3px solid transparent",
            marginBottom: -2,
            transition: "color var(--t-fast), border-color var(--t-fast)",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── StaffPage ──────────────────────────────────────────────────
export function StaffPage() {
  const { session } = useAuthStore();
  const {
    profiles,
    shifts,
    registrations,
    getProfileByUsername,
    updateProfile,
    registerShift,
    cancelRegistration,
    getRegistrationStatus,
    getMyRegistrations,
  } = useStaffStore();
  const { pushToast } = useToast();

  const [tabIdx, setTabIdx] = useState(0);

  const isManager = session?.role === "manager";
  const myProfile = getProfileByUsername(session?.username ?? "");

  // Manager tabs
  const managerTabs = ["👥 Quản lý nhân sự", "📋 Phê duyệt ca", "�� Hồ sơ cá nhân"];
  // Staff tabs
  const staffTabs = ["👤 Hồ sơ cá nhân", "📅 Đăng ký ca làm việc", "📋 Lịch đăng ký của tôi"];

  const tabs = isManager ? managerTabs : staffTabs;

  // ── Handlers ──
  const handleRegister = (shiftId: string) => {
    if (!myProfile) return;
    try {
      registerShift(myProfile.id, shiftId);
      pushToast({ kind: "success", title: "✅ Đăng ký ca thành công!", description: "Trạng thái: Chờ duyệt" });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Không thể đăng ký",
        description: err instanceof Error ? err.message : "Lỗi không xác định",
      });
    }
  };

  const handleCancel = (shiftId: string) => {
    if (!myProfile) return;
    const reg = registrations.find(
      (r) => r.staffId === myProfile.id && r.shiftId === shiftId && r.status === "PENDING"
    );
    if (reg) {
      cancelRegistration(reg.id);
      pushToast({ kind: "info", title: "Đã huỷ đăng ký ca" });
    }
  };

  // ── Render sections ──
  function renderManagerContent() {
    if (tabIdx === 0) {
      return <StaffRoster profiles={profiles} />;
    }
    if (tabIdx === 1) {
      return (
        <RegistrationApproval
          registrations={registrations}
          reviewerUsername={session?.username ?? "manager"}
        />
      );
    }
    // Tab 2: manager's own profile
    if (myProfile) {
      return (
        <ProfileCard
          profile={myProfile}
          onSave={(updates) => updateProfile(myProfile.id, updates)}
        />
      );
    }
    return null;
  }

  function renderStaffContent() {
    if (tabIdx === 0) {
      if (!myProfile) {
        return (
          <div style={{ textAlign: "center", color: "var(--c-gray-400)", padding: "var(--sp-8)" }}>
            Không tìm thấy hồ sơ. Vui lòng liên hệ quản lý.
          </div>
        );
      }
      return (
        <ProfileCard
          profile={myProfile}
          onSave={(updates) => updateProfile(myProfile.id, updates)}
        />
      );
    }

    if (tabIdx === 1) {
      if (!myProfile) return null;
      return (
        <div>
          <div
            style={{
              padding: "var(--sp-3) var(--sp-4)",
              background: "var(--c-primary-50)",
              border: "1px solid var(--c-primary-100)",
              borderRadius: "var(--r-md)",
              marginBottom: "var(--sp-4)",
              fontSize: "var(--fs-sm)",
              color: "var(--c-primary-700)",
            }}
          >
            💡 Nhấn <strong>"+ Đăng ký"</strong> vào ô ca còn trống · Trạng thái sẽ là <strong>Chờ duyệt</strong> cho đến khi quản lý phê duyệt.
          </div>
          <ShiftCalendar
            shifts={shifts}
            staffId={myProfile.id}
            getStatus={getRegistrationStatus}
            onRegister={handleRegister}
            onCancel={handleCancel}
          />
        </div>
      );
    }

    // Tab 2: My registrations history
    if (!myProfile) return null;
    const myRegs = getMyRegistrations(myProfile.id);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
        {myRegs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "var(--sp-8)",
              color: "var(--c-gray-400)",
              border: "2px dashed var(--c-gray-200)",
              borderRadius: "var(--r-md)",
            }}
          >
            📅 Bạn chưa đăng ký ca nào · Chuyển sang tab "Đăng ký ca làm việc"
          </div>
        ) : (
          myRegs.slice().reverse().map((reg) => {
            const s = shifts.find((sh) => sh.id === reg.shiftId);
            const statusColor = {
              PENDING:  { bg: "#fffbeb", border: "var(--c-warning)", text: "var(--c-warning)" },
              APPROVED: { bg: "var(--c-success-50)", border: "var(--c-success-400)", text: "var(--c-success)" },
              REJECTED: { bg: "#fff1f2", border: "var(--c-danger-300)", text: "var(--c-danger)" },
            }[reg.status];

            return (
              <div
                key={reg.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--sp-4)",
                  border: `1px solid ${statusColor.border}`,
                  borderRadius: "var(--r-md)",
                  background: statusColor.bg,
                }}
              >
                <div>
                  <div style={{ fontWeight: "var(--fw-semi)", color: "var(--c-gray-900)" }}>
                    {s ? `${new Date(s.date + "T00:00:00").toLocaleDateString("vi-VN")} · Ca ${s.label}` : reg.shiftId}
                  </div>
                  {s ? (
                    <div className="text-muted">{s.startTime} – {s.endTime}</div>
                  ) : null}
                  {reg.rejectNote ? (
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-danger)", marginTop: "var(--sp-1)" }}>
                      Lý do: {reg.rejectNote}
                    </div>
                  ) : null}
                </div>
                <div
                  style={{
                    fontWeight: "var(--fw-semi)",
                    color: statusColor.text,
                    fontSize: "var(--fs-sm)",
                  }}
                >
                  {reg.status === "PENDING"  ? "⏳ Chờ duyệt" :
                   reg.status === "APPROVED" ? "✅ Đã duyệt" : "❌ Từ chối"}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div>
      <Tabs tabs={tabs} active={tabIdx} onChange={setTabIdx} />
      {isManager ? renderManagerContent() : renderStaffContent()}
    </div>
  );
}

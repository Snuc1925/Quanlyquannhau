import { useMemo, useState } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useStaffStore } from "../store/staffStore";
import { ProfileCard } from "../components/ProfileCard";
import { ShiftCalendar } from "../components/ShiftCalendar";
import { RegistrationApproval } from "../components/RegistrationApproval";
import { StaffRoster } from "../components/StaffRoster";

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
    getMyRegistrations
  } = useStaffStore();
  const { pushToast } = useToast();

  const [tabIdx, setTabIdx] = useState(0);
  const isManager = session?.role === "manager";
  const myProfile = getProfileByUsername(session?.username ?? "");

  const managerTabs = ["Quản lý nhân sự", "Phê duyệt ca", "Hồ sơ cá nhân"];
  const staffTabs = ["Hồ sơ cá nhân", "Đăng ký ca làm việc", "Lịch đăng ký của tôi"];
  const tabs = isManager ? managerTabs : staffTabs;

  const stats = useMemo(() => {
    const staffOnly = profiles.filter((profile) => profile.role === "staff");
    const pendingCount = registrations.filter((reg) => reg.status === "PENDING").length;
    const approvedCount = registrations.filter((reg) => reg.status === "APPROVED").length;
    return {
      totalStaff: staffOnly.length,
      pendingCount,
      approvedCount,
      totalHours: staffOnly.reduce((sum, profile) => sum + profile.accumulatedHours, 0)
    };
  }, [profiles, registrations]);

  const handleRegister = (shiftId: string) => {
    if (!myProfile) return;
    try {
      registerShift(myProfile.id, shiftId);
      pushToast({
        kind: "success",
        title: "✅ Đăng ký ca thành công!",
        description: "Trạng thái: Chờ duyệt"
      });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Không thể đăng ký",
        description: err instanceof Error ? err.message : "Lỗi không xác định"
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

  function renderManagerContent() {
    if (tabIdx === 0) return <StaffRoster profiles={profiles} />;
    if (tabIdx === 1) {
      return (
        <RegistrationApproval
          registrations={registrations}
          reviewerUsername={session?.username ?? "manager"}
        />
      );
    }
    if (!myProfile) return null;
    return (
      <ProfileCard
        profile={myProfile}
        onSave={(updates) => updateProfile(myProfile.id, updates)}
      />
    );
  }

  function renderStaffContent() {
    if (tabIdx === 0) {
      if (!myProfile) return <div className="staff-empty">Không tìm thấy hồ sơ. Vui lòng liên hệ quản lý.</div>;
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
        <div className="staff-content-stack">
          <div className="staff-tip">
            💡 Nhấn <strong>"+ Đăng ký"</strong> vào ca còn trống. Trạng thái sẽ là{" "}
            <strong>Chờ duyệt</strong> cho đến khi quản lý phê duyệt.
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

    if (!myProfile) return null;
    const myRegs = getMyRegistrations(myProfile.id);
    return (
      <div className="staff-content-stack">
        {myRegs.length === 0 ? (
          <div className="staff-empty">
            📅 Bạn chưa đăng ký ca nào · Chuyển sang tab "Đăng ký ca làm việc"
          </div>
        ) : (
          myRegs
            .slice()
            .reverse()
            .map((reg) => {
              const s = shifts.find((sh) => sh.id === reg.shiftId);
              const statusClass =
                reg.status === "APPROVED"
                  ? "staff-reg-approved"
                  : reg.status === "REJECTED"
                    ? "staff-reg-rejected"
                    : "staff-reg-pending";
              return (
                <div key={reg.id} className={`staff-reg-item ${statusClass}`}>
                  <div>
                    <div className="staff-reg-title">
                      {s
                        ? `${new Date(s.date + "T00:00:00").toLocaleDateString("vi-VN")} · Ca ${s.label}`
                        : reg.shiftId}
                    </div>
                    {s ? <div className="staff-reg-meta">{s.startTime} – {s.endTime}</div> : null}
                    {reg.rejectNote ? <div className="staff-reg-reason">Lý do: {reg.rejectNote}</div> : null}
                  </div>
                  <div className="staff-reg-status">
                    {reg.status === "PENDING"
                      ? "⏳ Chờ duyệt"
                      : reg.status === "APPROVED"
                        ? "✅ Đã duyệt"
                        : "❌ Từ chối"}
                  </div>
                </div>
              );
            })
        )}
      </div>
    );
  }

  return (
    <div className="staff-page">
      <div className="staff-page-header">
        <div>
          <h2 className="staff-title">Quản lý nhân sự</h2>
          <p className="staff-subtitle">
            Theo dõi hồ sơ nhân sự, đăng ký ca và phê duyệt lịch làm việc
          </p>
        </div>
      </div>

      <div className="staff-stats-bar">
        <div className="staff-stat-card">
          <div className="staff-stat-label">Nhân viên</div>
          <div className="staff-stat-value">{stats.totalStaff}</div>
          <div className="staff-stat-sub">đang làm việc</div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-label">Đăng ký chờ duyệt</div>
          <div className="staff-stat-value staff-amber">{stats.pendingCount}</div>
          <div className="staff-stat-sub">cần xử lý</div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-label">Ca đã duyệt</div>
          <div className="staff-stat-value staff-green">{stats.approvedCount}</div>
          <div className="staff-stat-sub">đã xác nhận</div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-label">Tổng giờ tích lũy</div>
          <div className="staff-stat-value">{stats.totalHours}h</div>
          <div className="staff-stat-sub">toàn bộ nhân viên</div>
        </div>
      </div>

      <div className="staff-tabs-wrap">
        <div className="staff-tabs">
          {tabs.map((label, idx) => (
            <button
              key={label}
              type="button"
              className={`staff-tab${tabIdx === idx ? " active" : ""}`}
              onClick={() => setTabIdx(idx)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isManager ? renderManagerContent() : renderStaffContent()}
    </div>
  );
}

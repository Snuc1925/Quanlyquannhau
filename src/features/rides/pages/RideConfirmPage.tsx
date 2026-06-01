import { useMemo } from "react";
import { useRideStore } from "../store/rideStore";
import { useToast } from "@/app/providers/ToastProvider";
import { RIDE_APP_META, RIDE_STATUS_META } from "../types";
import type { RideRequest } from "../types";

const DEMO_RIDE: RideRequest = {
  id: "r-demo",
  tableNo: "A01",
  customerName: "Khách Demo",
  customerPhone: "0901 234 567",
  destination: "25 Nguyễn Bỉnh Khiêm, Q.1, TP.HCM",
  note: "Khách nhờ hỗ trợ đến bãi giữ xe",
  rideApp: "be",
  status: "dispatched",
  createdAt: new Date().toISOString(),
  staffName: "Nhân viên",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RideConfirmPage() {
  const { rides, updateStatus } = useRideStore();
  const { pushToast } = useToast();

  const activeRide = useMemo(
    () => rides.find((ride) => ride.status === "dispatched" || ride.status === "pending") ?? DEMO_RIDE,
    [rides]
  );

  const handleConfirm = () => {
    if (!activeRide || activeRide.id === "r-demo") return;
    updateStatus(activeRide.id, "completed");
    pushToast({
      kind: "success",
      title: "Đã xác nhận hoàn thành",
      description: `Chuyến ${activeRide.id.toUpperCase()} đã được xác nhận thành công.`,
    });
  };

  return (
    <div className="rides-page rides-confirm-page">
      <div className="rides-page-header">
        <div>
          <h2 className="rides-title">Xác nhận hoàn thành chuyến đi</h2>
          <p className="rides-subtitle">
            Khách hàng xác nhận sau khi xe đã đưa bạn đến nơi an toàn
          </p>
        </div>
      </div>

      {activeRide ? (
        <div className="rides-confirm-grid">
          <div className="rides-confirm-card">
            <div className="rides-confirm-head">
              <div>
                <h3>Chuyến xe đang di chuyển</h3>
                <p>Vui lòng kiểm tra thông tin và xác nhận khi đã đến nơi.</p>
              </div>
              <span
                className="rides-status-chip"
                style={{
                  color: RIDE_STATUS_META[activeRide.status].color,
                  background: RIDE_STATUS_META[activeRide.status].bg,
                }}
              >
                {RIDE_STATUS_META[activeRide.status].label}
              </span>
            </div>

            <div className="rides-confirm-body">
              <div className="rides-confirm-row">
                <span>Mã chuyến</span>
                <strong>{activeRide.id.toUpperCase()}</strong>
              </div>
              <div className="rides-confirm-row">
                <span>Khách hàng</span>
                <strong>{activeRide.customerName}</strong>
              </div>
              <div className="rides-confirm-row">
                <span>Số điện thoại</span>
                <strong>{activeRide.customerPhone}</strong>
              </div>
              <div className="rides-confirm-row">
                <span>Điểm đến</span>
                <strong>{activeRide.destination}</strong>
              </div>
              <div className="rides-confirm-row">
                <span>Ứng dụng</span>
                <strong>
                  {RIDE_APP_META[activeRide.rideApp].icon} {RIDE_APP_META[activeRide.rideApp].label}
                </strong>
              </div>
              <div className="rides-confirm-row">
                <span>Thời gian gọi</span>
                <strong>{formatTime(activeRide.createdAt)}</strong>
              </div>
              {activeRide.note ? (
                <div className="rides-confirm-note">💬 {activeRide.note}</div>
              ) : null}
            </div>

            <div className="rides-confirm-footer">
              <button type="button" className="rides-confirm-btn" onClick={handleConfirm}>
                ✅ Xác nhận đã hoàn thành chuyến đi
              </button>
              <p className="rides-confirm-hint">
                Nếu có vấn đề, hãy liên hệ nhân viên quán để được hỗ trợ ngay.
              </p>
            </div>
          </div>

          <div className="rides-confirm-card rides-confirm-side">
            <h4>Tiến trình chuyến đi</h4>
            <div className="rides-confirm-steps">
              <div className="rides-confirm-step done">
                <span>1</span>
                <div>
                  <strong>Đã gọi xe</strong>
                  <p>Xe đã được điều phối và chuẩn bị xuất phát.</p>
                </div>
              </div>
              <div className="rides-confirm-step active">
                <span>2</span>
                <div>
                  <strong>Đang di chuyển</strong>
                  <p>Chuyến đi đang diễn ra, vui lòng chú ý an toàn.</p>
                </div>
              </div>
              <div className="rides-confirm-step">
                <span>3</span>
                <div>
                  <strong>Hoàn thành</strong>
                  <p>Xác nhận khi bạn đã đến nơi an toàn.</p>
                </div>
              </div>
            </div>
            <div className="rides-confirm-alert">
              Hãy xác nhận trong vòng 30 phút sau khi kết thúc chuyến đi để hệ thống cập nhật.
            </div>
          </div>
        </div>
      ) : (
        <div className="rides-confirm-empty">
          <div className="rides-confirm-empty-icon">✅</div>
          <h4>Chưa có chuyến cần xác nhận</h4>
          <p>Khi xe được gọi thành công, hệ thống sẽ hiển thị tại đây để bạn xác nhận.</p>
        </div>
      )}
    </div>
  );
}

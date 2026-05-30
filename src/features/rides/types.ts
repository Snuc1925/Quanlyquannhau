export type RideStatus = "pending" | "dispatched" | "completed" | "cancelled";

export type RideRequest = {
  id: string;
  tableNo: string;
  customerName: string;
  customerPhone: string;
  destination: string;
  note: string;
  rideApp: "grab" | "be" | "xanh-sm" | "taxi";
  status: RideStatus;
  createdAt: string;
  staffName: string;
};

export const RIDE_APP_META: Record<
  RideRequest["rideApp"],
  { label: string; icon: string; color: string }
> = {
  grab:     { label: "Grab",     icon: "🟢", color: "#00b14f" },
  be:       { label: "Be",       icon: "🟡", color: "#ffcc00" },
  "xanh-sm":{ label: "Xanh SM", icon: "🔵", color: "#0066cc" },
  taxi:     { label: "Taxi",     icon: "🚕", color: "#f59e0b" },
};

export const RIDE_STATUS_META: Record<
  RideStatus,
  { label: string; color: string; bg: string }
> = {
  pending:    { label: "Chờ xe",    color: "#92400e", bg: "#fef3c7" },
  dispatched: { label: "Đã gọi",   color: "#1e40af", bg: "#dbeafe" },
  completed:  { label: "Hoàn thành", color: "#065f46", bg: "#d1fae5" },
  cancelled:  { label: "Đã huỷ",   color: "#991b1b", bg: "#fee2e2" },
};

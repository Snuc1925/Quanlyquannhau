import type { UserRole } from "@/types/auth";

type NavigationItem = {
  label: string;
  to: string;
  icon: string;
};

const navigationMap: Record<UserRole, NavigationItem[]> = {
  manager: [
    { label: "Dashboard",  to: "/manager/dashboard",    icon: "📊" },
    { label: "Đặt bàn",   to: "/manager/reservations", icon: "📅" },
    { label: "Nhập kho",  to: "/manager/inventory",    icon: "📦" },
    { label: "Doanh thu", to: "/manager/revenue",      icon: "💰" },
    { label: "Nhân sự",   to: "/manager/staff",        icon: "👥" },
    { label: "Thực đơn", to: "/manager/menu",          icon: "🍽️" },
    { label: "Đặt xe",   to: "/manager/rides",         icon: "🚖" },
    { label: "Gọi món",  to: "/manager/orders",        icon: "🍻" }
  ],
  accountant: [
    { label: "Dashboard",  to: "/accountant/dashboard", icon: "📊" },
    { label: "Doanh thu", to: "/accountant/revenue",   icon: "💰" }
  ],
  staff: [
    { label: "Dashboard",  to: "/staff/dashboard",    icon: "📊" },
    { label: "Đặt bàn",   to: "/staff/reservations", icon: "📅" },
    { label: "Nhập kho",  to: "/staff/inventory",    icon: "📦" },
    { label: "Hồ sơ & Ca", to: "/staff/staff",       icon: "🗓️" },
    { label: "Đặt xe",   to: "/staff/rides",        icon: "🚖" },
    { label: "Gọi món",  to: "/staff/orders",       icon: "🍻" }
  ],
  customer: [
    { label: "Dashboard",  to: "/customer/dashboard",    icon: "🏠" },
    { label: "Đặt bàn",   to: "/customer/reservations", icon: "📅" }
  ]
};

export function getNavigationByRole(role: UserRole) {
  return navigationMap[role];
}

export function getDefaultPathByRole(role: UserRole) {
  return navigationMap[role][0]?.to ?? "/login";
}

import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/app/layout/AppShell";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { RoleIndexRedirect } from "@/features/auth/components/RoleIndexRedirect";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { UnauthorizedPage } from "@/features/auth/pages/UnauthorizedPage";
import { DashboardHome } from "@/features/common/pages/DashboardHome";
import { NotFoundPage } from "@/features/common/pages/NotFoundPage";
import { ReservationPage } from "@/features/reservations/pages/ReservationPage";
import { InventoryPage } from "@/features/inventory/pages/InventoryPage";
import { RevenuePage } from "@/features/revenue/pages/RevenuePage";
import { StaffPage } from "@/features/staff/pages/StaffPage";
import { MenuPage } from "@/features/menu/pages/MenuPage";
import { RidePage } from "@/features/rides/pages/RidePage";
import { RideConfirmPage } from "@/features/rides/pages/RideConfirmPage";
import { OrderPage } from "@/features/orders/pages/OrderPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppShell />}>
          <Route index element={<RoleIndexRedirect />} />

          <Route
            element={<ProtectedRoute allowRoles={["manager"]} />}
          >
            <Route
              path="manager/dashboard"
              element={
                <DashboardHome
                  title="Tổng quan quản lý"
                  subtitle="Xem nhanh các chỉ số quan trọng trong ngày"
                />
              }
            />
            <Route path="manager/reservations" element={<ReservationPage />} />
            <Route path="manager/inventory" element={<InventoryPage />} />
            <Route path="manager/revenue" element={<RevenuePage />} />
            <Route path="manager/staff" element={<StaffPage />} />
            <Route path="manager/menu" element={<MenuPage />} />
            <Route path="manager/rides" element={<RidePage />} />
            <Route path="manager/orders" element={<OrderPage />} />
          </Route>

          <Route
            element={<ProtectedRoute allowRoles={["accountant"]} />}
          >
            <Route
              path="accountant/dashboard"
              element={
                <DashboardHome
                  title="Tổng quan kế toán"
                  subtitle="Màn hình đối soát và chốt sổ sẽ được mở rộng tiếp"
                />
              }
            />
            <Route path="accountant/revenue" element={<RevenuePage />} />
          </Route>

          <Route
            element={<ProtectedRoute allowRoles={["staff"]} />}
          >
            <Route
              path="staff/dashboard"
              element={
                <DashboardHome
                  title="Tổng quan nhân viên"
                  subtitle="Quản lý bàn và order nhanh trong ca trực"
                />
              }
            />
            <Route path="staff/reservations" element={<ReservationPage />} />
            <Route path="staff/inventory" element={<InventoryPage />} />
            <Route path="staff/staff" element={<StaffPage />} />
            <Route path="staff/rides" element={<RidePage />} />
            <Route path="staff/orders" element={<OrderPage />} />
          </Route>

          <Route
            element={<ProtectedRoute allowRoles={["customer"]} />}
          >
            <Route
              path="customer/dashboard"
              element={
                <DashboardHome
                  title="Trang khách hàng"
                  subtitle="Theo dõi và quản lý các lịch đặt bàn của bạn"
                />
              }
            />
            <Route path="customer/reservations" element={<ReservationPage />} />
            <Route path="customer/rides/confirm" element={<RideConfirmPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/app/layout/Header";
import { Sidebar } from "@/app/layout/Sidebar";
import { useAuth } from "@/features/auth/hooks/useAuth";

const pageTitleMap: Record<string, string> = {
  "/manager/dashboard": "Dashboard quản lý",
  "/accountant/dashboard": "Dashboard kế toán",
  "/staff/dashboard": "Dashboard nhân viên",
  "/customer/dashboard": "Dashboard khách hàng",
  "/manager/reservations": "Quản lý đặt bàn",
  "/staff/reservations": "Quản lý đặt bàn",
  "/customer/reservations": "Đặt bàn"
};

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title = useMemo(
    () => pageTitleMap[location.pathname] ?? "Hệ thống quản lý quán bia hơi",
    [location.pathname]
  );

  if (!session) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <Sidebar role={session.role} isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="content-wrap">
        <Header
          title={title}
          session={session}
          onToggleMenu={toggleSidebar}
          onLogout={handleLogout}
        />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

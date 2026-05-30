import { Button } from "@/components/ui";
import type { AuthSession } from "@/types/auth";

type HeaderProps = {
  title: string;
  session: AuthSession;
  onToggleMenu: () => void;
  onLogout: () => void;
};

const roleLabelMap: Record<AuthSession["role"], string> = {
  manager:    "Quản lý",
  accountant: "Kế toán",
  staff:      "Nhân viên",
  customer:   "Khách hàng"
};

export function Header({ title, session, onToggleMenu, onLogout }: HeaderProps) {
  const initials = session.fullName
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn" onClick={onToggleMenu} aria-label="Menu" style={{ fontSize: 20 }}>
          ☰
        </button>
        <span className="header-title">{title}</span>
      </div>

      <div className="header-right">
        <div className="header-user">
          <div className="header-user-avatar">{initials}</div>
          <div className="header-user-info">
            <span className="header-user-name">{session.fullName}</span>
            <span className="header-user-role">{roleLabelMap[session.role]}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}

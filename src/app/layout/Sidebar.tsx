import { NavLink } from "react-router-dom";
import { getNavigationByRole } from "@/app/layout/navigation";
import type { UserRole } from "@/types/auth";

type SidebarProps = {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const links = getNavigationByRole(role);

  return (
    <aside className={`sidebar${isOpen ? " open" : ""}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🍺</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Bia Hơi</span>
          <span className="sidebar-brand-sub">Management</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Menu chính">
        <span className="sidebar-nav-label">Chức năng</span>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

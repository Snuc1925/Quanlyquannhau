import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/app/providers/ToastProvider";
import { getDefaultPathByRole } from "@/app/layout/navigation";

type LocationState = { from?: { pathname?: string } };

const demoHints = [
  { role: "Quản lý",  credentials: "manager / manager123" },
  { role: "Kế toán",  credentials: "accountant / accountant123" },
  { role: "Nhân viên", credentials: "staff / staff123" },
  { role: "Khách hàng", credentials: "customer / customer123" }
];

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login, session }      = useAuth();
  const { pushToast }           = useToast();
  const navigate                = useNavigate();
  const location                = useLocation();

  const fromPath = (location.state as LocationState | null)?.from?.pathname;

  useEffect(() => {
    if (session) navigate(getDefaultPathByRole(session.role), { replace: true });
  }, [navigate, session]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ username, password });
      pushToast({ kind: "success", title: "Đăng nhập thành công 🎉" });
      navigate(fromPath ?? "/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🍺</div>
          <div>
            <div style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", color: "var(--c-gray-900)", letterSpacing: "-0.02em" }}>
              Quán Bia Hơi
            </div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-gray-400)" }}>Hệ thống quản lý</div>
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-body">
            <div style={{ marginBottom: "var(--sp-6)" }}>
              <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", color: "var(--c-gray-900)", marginBottom: 4, letterSpacing: "-0.02em" }}>
                Đăng nhập
              </h2>
              <p style={{ color: "var(--c-gray-400)", fontSize: "var(--fs-sm)" }}>
                Nhập thông tin để tiếp tục vào hệ thống
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <Input
                id="username"
                label="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username..."
                required
                autoFocus
                autoComplete="username"
              />
              <Input
                id="password"
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              {error ? (
                <div style={{
                  background: "var(--c-danger-bg)",
                  border: "1px solid var(--c-danger-ring)",
                  borderRadius: "var(--r-sm)",
                  padding: "var(--sp-3) var(--sp-4)",
                  color: "var(--c-danger)",
                  fontSize: "var(--fs-sm)",
                  marginBottom: "var(--sp-4)"
                }}>
                  ⚠️ {error}
                </div>
              ) : null}
              <Button type="submit" fullWidth disabled={loading} size="lg">
                {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
              </Button>
            </form>
          </div>

          {/* Demo hints */}
          <div style={{
            padding: "var(--sp-4) var(--sp-6)",
            borderTop: "1px solid var(--c-gray-100)",
            background: "var(--c-gray-25)"
          }}>
            <p style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-semi)", color: "var(--c-gray-500)", marginBottom: "var(--sp-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Tài khoản demo
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-2)" }}>
              {demoHints.map((hint) => (
                <button
                  key={hint.role}
                  type="button"
                  onClick={() => {
                    const [u, p] = hint.credentials.split(" / ");
                    setUsername(u);
                    setPassword(p);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "var(--sp-2) var(--sp-3)",
                    border: "1px solid var(--c-gray-200)",
                    borderRadius: "var(--r-sm)",
                    background: "var(--c-white)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "border-color 0.1s, background 0.1s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--c-primary-300)")}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--c-gray-200)")}
                >
                  <span style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-semi)", color: "var(--c-primary-600)" }}>
                    {hint.role}
                  </span>
                  <span style={{ fontSize: "var(--fs-xs)", color: "var(--c-gray-400)", marginTop: 1 }}>
                    {hint.credentials}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

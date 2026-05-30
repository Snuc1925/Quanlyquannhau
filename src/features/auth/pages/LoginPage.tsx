import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/app/providers/ToastProvider";
import { getDefaultPathByRole } from "@/app/layout/navigation";

type LocationState = { from?: { pathname?: string } };

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
        </div>
      </div>
    </div>
  );
}

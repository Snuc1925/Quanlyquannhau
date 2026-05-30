import { Link } from "react-router-dom";
import { Button, Card } from "@/components/ui";

export function UnauthorizedPage() {
  return (
    <div className="auth-page">
      <Card title="Không có quyền truy cập" subtitle="Role hiện tại không được phép vào trang này.">
        <Link to="/">
          <Button>Quay về trang chính</Button>
        </Link>
      </Card>
    </div>
  );
}

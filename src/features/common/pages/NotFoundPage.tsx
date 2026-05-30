import { Link } from "react-router-dom";
import { Button, Card } from "@/components/ui";

export function NotFoundPage() {
  return (
    <div className="auth-page">
      <Card title="404" subtitle="Không tìm thấy trang">
        <Link to="/login">
          <Button>Quay về đăng nhập</Button>
        </Link>
      </Card>
    </div>
  );
}

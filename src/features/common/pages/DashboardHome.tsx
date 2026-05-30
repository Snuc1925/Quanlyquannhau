import { Card, StatusView } from "@/components/ui";

type DashboardHomeProps = {
  title: string;
  subtitle: string;
};

export function DashboardHome({ title, subtitle }: DashboardHomeProps) {
  return (
    <div className="grid">
      <Card title={title} subtitle={subtitle}>
        <StatusView
          kind="empty"
          title="Module đang được mở rộng"
          description="Bạn có thể bắt đầu với module UC1 - Đặt bàn ở sidebar."
        />
      </Card>
    </div>
  );
}

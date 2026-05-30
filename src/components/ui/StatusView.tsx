type StatusViewProps = {
  kind: "loading" | "empty" | "error";
  title: string;
  description?: string;
};

const iconMap: Record<StatusViewProps["kind"], string> = {
  loading: "⏳",
  empty:   "📭",
  error:   "⚠️"
};

export function StatusView({ kind, title, description }: StatusViewProps) {
  return (
    <div className={`status-view status-${kind}`}>
      <span style={{ fontSize: 28 }}>{iconMap[kind]}</span>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

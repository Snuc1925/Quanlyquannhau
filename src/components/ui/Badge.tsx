import type { PropsWithChildren } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

type BadgeProps = PropsWithChildren<{
  variant?: BadgeVariant;
}>;

export function Badge({ variant = "default", children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
  }
>;

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const cls = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? "w-full" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  );
}

import type { PropsWithChildren, ReactNode } from "react";

type CardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  stepNumber?: number;
  stepDone?: boolean;
  footer?: ReactNode;
}>;

export function Card({ title, subtitle, action, stepNumber, stepDone, footer, children }: CardProps) {
  const hasHeader = Boolean(title ?? subtitle ?? action ?? stepNumber);

  return (
    <section className="card">
      {hasHeader ? (
        <header className="card-header">
          <div className="flex items-center gap-3">
            {stepNumber ? (
              <div className={`step-number${stepDone ? " done" : ""}`}>{stepDone ? "✓" : stepNumber}</div>
            ) : null}
            <div>
              {title ? <h3>{title}</h3> : null}
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
          </div>
          {action ?? null}
        </header>
      ) : null}
      <div className="card-body">{children}</div>
      {footer ? <div className="card-footer">{footer}</div> : null}
    </section>
  );
}

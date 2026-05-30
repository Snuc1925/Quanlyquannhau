import type { PropsWithChildren, SelectHTMLAttributes } from "react";

type Option = {
  label: string;
  value: string;
};

type SelectProps = PropsWithChildren<SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options?: Option[];
  error?: string;
}>;

export function Select({ label, options, error, id, className = "", children, ...props }: SelectProps) {
  return (
    <div className="field">
      {label ? (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={`input${error ? " is-error" : ""} ${className}`.trim()}
        {...props}
      >
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}

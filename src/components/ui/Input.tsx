import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  required?: boolean;
};

export function Input({ label, error, id, required, className = "", ...props }: InputProps) {
  return (
    <div className="field">
      {label ? (
        <label htmlFor={id} className="field-label">
          {label}
          {required ? <span className="required"> *</span> : null}
        </label>
      ) : null}
      <input
        id={id}
        className={`input${error ? " is-error" : ""} ${className}`.trim()}
        required={required}
        {...props}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}

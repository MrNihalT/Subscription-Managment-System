import * as React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className = "", label, helperText, error, id, options, children, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-zinc-700"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`block w-full rounded-md border bg-white px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-colors disabled:bg-zinc-100 disabled:cursor-not-allowed ${
            error
              ? "border-rose-400 text-rose-900 focus:ring-rose-500"
              : "border-zinc-300"
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <p className="text-xs text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-zinc-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

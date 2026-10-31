import * as React from "react";
import { Info, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "success" | "danger";
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  className = "",
  variant = "info",
  title,
  children,
  ...props
}) => {
  const variantStyles = {
    info: "bg-zinc-50 border-zinc-200 text-zinc-800",
    warning: "bg-amber-50/70 border-amber-200 text-amber-900",
    success: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
    danger: "bg-rose-50/70 border-rose-200 text-rose-900",
  };

  const icons = {
    info: <Info className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />,
    danger: <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={`rounded-md border p-3 flex gap-2.5 text-xs ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icons[variant]}
      <div className="space-y-0.5">
        {title && <h5 className="font-medium text-xs leading-none">{title}</h5>}
        <div className="text-xs leading-relaxed text-zinc-600">{children}</div>
      </div>
    </div>
  );
};

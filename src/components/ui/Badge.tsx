import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "success" | "warning" | "danger" | "accent" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "neutral",
  children,
  ...props
}) => {
  const variantStyles = {
    neutral: "bg-zinc-100 text-zinc-700 border-zinc-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    accent: "bg-teal-50 text-teal-800 border-teal-200",
    outline: "bg-transparent text-zinc-600 border-zinc-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

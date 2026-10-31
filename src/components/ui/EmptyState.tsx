import * as React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 p-8 text-center bg-zinc-50/50 ${className}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 text-xs text-zinc-500 max-w-sm">{description}</p>
      {actionLabel && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

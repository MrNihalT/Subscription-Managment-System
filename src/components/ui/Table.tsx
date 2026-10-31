import * as React from "react";

export const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className = "", ...props }, ref) => (
  <div className="w-full overflow-x-auto rounded-md border border-zinc-200">
    <table
      ref={ref}
      className={`w-full caption-bottom text-xs text-left text-zinc-700 ${className}`}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => (
  <thead
    ref={ref}
    className={`bg-zinc-50/80 border-b border-zinc-200 text-zinc-700 font-medium ${className}`}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => (
  <tbody
    ref={ref}
    className={`divide-y divide-zinc-200 bg-white ${className}`}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className = "", ...props }, ref) => (
  <tr
    ref={ref}
    className={`transition-colors hover:bg-zinc-50/60 ${className}`}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => (
  <th
    ref={ref}
    className={`h-9 px-3.5 text-left align-middle font-medium text-zinc-600 text-[11px] uppercase tracking-wider ${className}`}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => (
  <td
    ref={ref}
    className={`p-3.5 align-middle text-zinc-800 ${className}`}
    {...props}
  />
));
TableCell.displayName = "TableCell";

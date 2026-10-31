import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white p-5 shadow-xs ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div
    className={`flex flex-col space-y-1.5 pb-4 border-b border-zinc-100 mb-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <h3
    className={`font-semibold text-zinc-900 leading-none tracking-tight text-base ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className = "", children, ...props }) => (
  <p className={`text-xs text-zinc-500 ${className}`} {...props}>
    {children}
  </p>
);

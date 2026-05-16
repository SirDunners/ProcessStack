import React from 'react';
import { cn } from './utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: "bg-zinc-100 text-zinc-700",
    primary: "bg-zinc-900 text-white",
    secondary: "bg-zinc-200 text-zinc-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 text-xs font-medium rounded-full",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
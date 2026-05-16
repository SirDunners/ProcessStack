import React from 'react';
import { cn } from './utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'bordered';
}

export default function Card({ children, className, variant = 'default' }: CardProps) {
  return (
    <div className={cn(
      "bg-white rounded-3xl border shadow-sm overflow-hidden",
      variant === 'glass' && "bg-white/70 backdrop-blur-xl border-white/60 shadow-xl",
      variant === 'bordered' && "border-zinc-100",
      className
    )}>
      {children}
    </div>
  );
}
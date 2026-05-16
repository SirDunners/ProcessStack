import React from 'react';
import { cn } from './utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.985] rounded-2xl";

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variants = {
    primary: "bg-zinc-900 hover:bg-black text-white shadow-md hover:shadow-xl",
    secondary: "bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm",
    ghost: "hover:bg-zinc-100 text-zinc-700",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
import React from 'react';
import { cn } from './utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="border border-zinc-100 rounded-3xl overflow-hidden bg-white">
      <table className={cn("w-full text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-zinc-50 border-b border-zinc-100">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-zinc-100">{children}</tbody>;
}

export function TableRow({ children, onClick }: { 
  children: React.ReactNode; 
  onClick?: () => void;
}) {
  return (
    <tr 
      onClick={onClick}
      className="hover:bg-zinc-50 transition-colors cursor-pointer"
    >
      {children}
    </tr>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="px-6 py-4 text-left font-medium text-zinc-500">{children}</th>;
}

export function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-6 py-4">{children}</td>;
}
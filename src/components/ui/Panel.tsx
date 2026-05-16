import React from 'react';
import Card from './Card';

interface PanelProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Panel({ title, children, className }: PanelProps) {
  return (
    <Card className={className}>
      <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </Card>
  );
}
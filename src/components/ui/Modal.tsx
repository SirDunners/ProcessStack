import React from 'react';
import { cn } from './utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className={cn(
          "bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden",
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
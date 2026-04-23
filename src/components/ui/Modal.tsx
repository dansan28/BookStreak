"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // Capa fija que cubre toda la pantalla y centra el modal
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro con desenfoque */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Contenedor del Modal */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl",
          "border border-[var(--border)] p-6",
          "max-h-[90vh] flex flex-col", // Limitamos la altura y permitimos flexbox
          className
        )}
      >
        {/* Header del Modal - flex-shrink-0 evita que se aplaste */}
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo del Modal - Aquí es donde ocurre el scroll interno */}
        <div className="flex-1 overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
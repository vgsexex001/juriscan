"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function MobileDrawer({ isOpen, onClose, children }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current || !drawerRef.current) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = startXRef.current - currentXRef.current;
    if (diff > 0) {
      drawerRef.current.style.transform = `translateX(-${diff}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current || !drawerRef.current) return;
    isDraggingRef.current = false;
    const diff = startXRef.current - currentXRef.current;

    if (diff > 100) {
      onClose();
    }
    drawerRef.current.style.transform = "";
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] bg-white shadow-xl animate-slide-left"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 touch-target flex items-center justify-center z-10"
          style={{ marginTop: "var(--safe-area-top)" }}
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>

        {children}
      </div>
    </div>
  );
}

"use client";

import { Menu, Scale, Coins } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { balance, isLoading } = useCredits();

  return (
    <header
      className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200"
      style={{ paddingTop: "var(--safe-area-top)" }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 touch-target flex items-center justify-center"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Scale className="w-6 h-6 text-primary" strokeWidth={1.5} />
          <span className="text-primary text-lg font-semibold">Juriscan</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Coins className="w-4 h-4 text-yellow-500" />
          <span>{isLoading ? "..." : balance}</span>
        </div>
      </div>
    </header>
  );
}

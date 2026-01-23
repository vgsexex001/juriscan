"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import DisclaimerModal from "./DisclaimerModal";

export default function LegalDisclaimerInline() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
        <Info className="w-3 h-3 flex-shrink-0" />
        <span>
          Análises preditivas baseadas em jurimetria. Sem garantia de resultado.
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-primary hover:text-primary-hover underline font-medium whitespace-nowrap"
        >
          Saiba mais
        </button>
      </div>

      {isModalOpen && <DisclaimerModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

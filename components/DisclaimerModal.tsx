"use client";

import { useEffect, useCallback } from "react";
import { X, BarChart3, AlertTriangle, Scale } from "lucide-react";

interface DisclaimerModalProps {
  onClose: () => void;
}

const sections = [
  {
    icon: BarChart3,
    iconColor: "#8B5CF6",
    title: "Natureza das Análises",
    content:
      "As análises apresentadas pela Juriscan são baseadas em dados estatísticos, jurimetria e padrões históricos de decisões judiciais. Os resultados representam probabilidades e cenários estimados.",
  },
  {
    icon: AlertTriangle,
    iconColor: "#F59E0B",
    title: "Limitações",
    content:
      "As análises não constituem garantia de êxito, aconselhamento jurídico definitivo ou previsão absoluta de resultado. Cada caso possui particularidades que podem influenciar o desfecho processual.",
  },
  {
    icon: Scale,
    iconColor: "#3B82F6",
    title: "Responsabilidade Profissional",
    content:
      "A Juriscan é uma ferramenta de apoio à decisão estratégica. A análise jurídica completa e as decisões finais são de responsabilidade exclusiva do advogado responsável pelo caso.",
  },
];

export default function DisclaimerModal({ onClose }: DisclaimerModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-[500px] max-w-[90vw] bg-white rounded-2xl shadow-2xl"
        role="dialog"
        aria-labelledby="disclaimer-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2
            id="disclaimer-title"
            className="text-lg font-semibold text-gray-900"
          >
            Sobre as Análises
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="flex gap-3">
              <div
                className="p-2 rounded-lg flex-shrink-0 h-fit"
                style={{ backgroundColor: `${section.iconColor}15` }}
              >
                <section.icon
                  className="w-5 h-5"
                  style={{ color: section.iconColor }}
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

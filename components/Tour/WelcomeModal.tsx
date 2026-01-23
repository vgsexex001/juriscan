"use client";

import { useEffect, useState } from "react";
import { X, MessageSquare, FileText, Clock, Sparkles } from "lucide-react";
import { useTour } from "@/hooks/useTour";

const features = [
  {
    icon: MessageSquare,
    title: "Chat Jurídico com IA",
    description: "Tire dúvidas jurídicas em tempo real",
  },
  {
    icon: FileText,
    title: "Análise de Documentos",
    description: "Upload e análise automática de peças",
  },
  {
    icon: Clock,
    title: "Histórico Completo",
    description: "Acesse todas as suas consultas",
  },
  {
    icon: Sparkles,
    title: "Relatórios em PDF",
    description: "Gere documentos profissionais",
  },
];

export function WelcomeModal() {
  const { isWelcomeModalOpen, closeWelcomeModal, startTour } = useTour();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isWelcomeModalOpen) {
      // Pequeno delay para animação de entrada
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isWelcomeModalOpen]);

  if (!isWelcomeModalOpen) return null;

  const handleStartTour = () => {
    startTour();
  };

  const handleSkip = () => {
    closeWelcomeModal();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden transform transition-all duration-300 ${
          isAnimating ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary to-primary-hover px-8 pt-10 pb-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Bem-vindo ao Juriscan!</h2>
              <p className="text-white/80 text-sm">
                Sua plataforma de análise jurídica inteligente
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <p className="text-gray-600 mb-6">
            Conheça as principais funcionalidades que vão transformar sua
            prática jurídica:
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartTour}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Fazer tour guiado
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium rounded-xl transition-colors"
            >
              Pular e explorar sozinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

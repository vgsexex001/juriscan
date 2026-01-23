"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTour } from "@/hooks/useTour";

interface PopoverPosition {
  top: number;
  left: number;
}

// Componente da seta
function Arrow({ placement }: { placement: string }) {
  const baseClass = "absolute w-3 h-3 bg-white transform rotate-45";

  switch (placement) {
    case "right":
      return (
        <div
          className={`${baseClass} -left-1.5 top-1/2 -translate-y-1/2`}
          style={{ boxShadow: "-2px 2px 4px rgba(0, 0, 0, 0.1)" }}
        />
      );
    case "left":
      return (
        <div
          className={`${baseClass} -right-1.5 top-1/2 -translate-y-1/2`}
          style={{ boxShadow: "2px -2px 4px rgba(0, 0, 0, 0.1)" }}
        />
      );
    case "top":
      return (
        <div
          className={`${baseClass} -bottom-1.5 left-1/2 -translate-x-1/2`}
          style={{ boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)" }}
        />
      );
    case "bottom":
      return (
        <div
          className={`${baseClass} -top-1.5 left-1/2 -translate-x-1/2`}
          style={{ boxShadow: "-2px -2px 4px rgba(0, 0, 0, 0.1)" }}
        />
      );
    default:
      return null;
  }
}

export function TourPopover() {
  const {
    isTourActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    skipTour,
  } = useTour();

  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const calculatePosition = useCallback(() => {
    if (!currentStep) return;

    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const popoverWidth = 320;
    const popoverHeight = 200;
    const offset = 16;
    const padding = currentStep.spotlightPadding || 8;

    let top = 0;
    let left = 0;

    switch (currentStep.placement) {
      case "top":
        top = rect.top - padding - popoverHeight - offset;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
        break;
      case "bottom":
        top = rect.bottom + padding + offset;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - popoverHeight / 2;
        left = rect.left - padding - popoverWidth - offset;
        break;
      case "right":
        top = rect.top + rect.height / 2 - popoverHeight / 2;
        left = rect.right + padding + offset;
        break;
    }

    // Garantir que o popover não saia da tela
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 16) left = 16;
    if (left + popoverWidth > viewportWidth - 16) {
      left = viewportWidth - popoverWidth - 16;
    }
    if (top < 16) top = 16;
    if (top + popoverHeight > viewportHeight - 16) {
      top = viewportHeight - popoverHeight - 16;
    }

    setPosition({ top, left });
  }, [currentStep]);

  useEffect(() => {
    if (!isTourActive || !currentStep) {
      setIsVisible(false);
      return;
    }

    // Aguardar um frame para garantir que o elemento alvo esteja renderizado
    const timer = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, 50);

    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
    };
  }, [isTourActive, currentStep, calculatePosition]);

  if (!isTourActive || !currentStep) return null;

  return (
    <div
      className={`fixed z-[95] w-80 bg-white rounded-xl shadow-2xl transition-all duration-300 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Seta apontando para o elemento */}
      <Arrow placement={currentStep.placement} />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{currentStep.title}</h3>
        <button
          onClick={skipTour}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-100"
          aria-label="Fechar tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          {currentStep.content}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStepIndex
                  ? "bg-primary"
                  : index < currentStepIndex
                  ? "bg-primary/40"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons - sempre mostrar espaço para manter alinhamento */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevStep}
            disabled={isFirstStep}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isFirstStep
                ? "text-transparent cursor-default"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <button
            onClick={nextStep}
            className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
          >
            {isLastStep ? (
              "Concluir"
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTour } from "@/hooks/useTour";

interface PopoverPosition {
  top: number | "auto";
  left: number | "auto";
  bottom: number | "auto";
  right: number | "auto";
}

const INITIAL_POSITION: PopoverPosition = { top: 0, left: 0, bottom: "auto", right: "auto" };

// Componente da seta (hidden on mobile bottom-sheet mode)
function Arrow({ placement, hidden }: { placement: string; hidden?: boolean }) {
  if (hidden) return null;
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

  const [position, setPosition] = useState<PopoverPosition>(INITIAL_POSITION);
  const [isVisible, setIsVisible] = useState(false);
  const [useMobileBottom, setUseMobileBottom] = useState(false);

  const calculatePosition = useCallback(() => {
    if (!currentStep) return;

    const isMobile = window.innerWidth < 1024;

    // On mobile, when step requires drawer, use bottom-sheet positioning
    if (isMobile && currentStep.requiresDrawer) {
      setUseMobileBottom(true);
      setPosition({ top: "auto", left: 12, bottom: 12, right: 12 });
      return;
    }

    setUseMobileBottom(false);

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

    setPosition({ top, left, bottom: "auto", right: "auto" });
  }, [currentStep]);

  useEffect(() => {
    if (!isTourActive || !currentStep) {
      setIsVisible(false);
      return;
    }

    // Reset visibility on step change for smooth transition
    setIsVisible(false);

    // Aguardar um frame para garantir que o elemento alvo esteja renderizado
    const timer = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, 100);

    // Retry position calculation (e.g. after drawer opens with animation)
    const retryTimers = [
      setTimeout(calculatePosition, 300),
      setTimeout(calculatePosition, 500),
    ];

    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition, true);

    return () => {
      clearTimeout(timer);
      retryTimers.forEach(clearTimeout);
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
    };
  }, [isTourActive, currentStep, calculatePosition]);

  if (!isTourActive || !currentStep) return null;

  return (
    <div
      className={`fixed z-[95] bg-white shadow-2xl transition-all duration-300 ${
        useMobileBottom
          ? "left-3 right-3 rounded-xl"
          : "w-80 rounded-xl"
      } ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      style={{
        top: position.top === "auto" ? undefined : position.top,
        left: useMobileBottom ? undefined : (position.left === "auto" ? undefined : position.left),
        bottom: position.bottom === "auto" ? undefined : position.bottom,
        right: useMobileBottom ? undefined : (position.right === "auto" ? undefined : position.right),
      }}
    >
      {/* Seta apontando para o elemento (hidden in mobile bottom mode) */}
      <Arrow placement={currentStep.placement} hidden={useMobileBottom} />

      {/* Compact layout */}
      <div className="p-3">
        {/* Header + close inline */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-semibold text-gray-900">{currentStep.title}</h3>
          <button
            onClick={skipTour}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-100 flex-shrink-0 -mt-0.5 -mr-1"
            aria-label="Fechar tour"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          {currentStep.content}
        </p>

        {/* Footer: progress + nav in one row */}
        <div className="flex items-center justify-between gap-2">
          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  index === currentStepIndex
                    ? "w-4 bg-primary"
                    : index < currentStepIndex
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            {!isFirstStep && (
              <button
                onClick={prevStep}
                className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex items-center gap-0.5 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors whitespace-nowrap"
            >
              {isLastStep ? "Concluir" : "Próximo"}
              {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

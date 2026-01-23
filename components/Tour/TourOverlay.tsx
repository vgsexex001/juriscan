"use client";

import { useEffect, useState, useCallback } from "react";
import { useTour } from "@/hooks/useTour";

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourOverlay() {
  const { isTourActive, currentStep } = useTour();
  const [spotlightPosition, setSpotlightPosition] =
    useState<SpotlightPosition | null>(null);

  const updateSpotlightPosition = useCallback(() => {
    if (!currentStep) {
      setSpotlightPosition(null);
      return;
    }

    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) {
      setSpotlightPosition(null);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const padding = currentStep.spotlightPadding || 8;

    setSpotlightPosition({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
  }, [currentStep]);

  useEffect(() => {
    if (!isTourActive) {
      setSpotlightPosition(null);
      return;
    }

    updateSpotlightPosition();

    // Atualizar posição em resize e scroll
    window.addEventListener("resize", updateSpotlightPosition);
    window.addEventListener("scroll", updateSpotlightPosition, true);

    return () => {
      window.removeEventListener("resize", updateSpotlightPosition);
      window.removeEventListener("scroll", updateSpotlightPosition, true);
    };
  }, [isTourActive, updateSpotlightPosition]);

  if (!isTourActive || !spotlightPosition) return null;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      {/* SVG overlay com buraco para spotlight */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="spotlight-mask">
            {/* Fundo branco = visível */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Área preta = transparente (o buraco) */}
            <rect
              x={spotlightPosition.left}
              y={spotlightPosition.top}
              width={spotlightPosition.width}
              height={spotlightPosition.height}
              rx="8"
              ry="8"
              fill="black"
            />
          </mask>
        </defs>
        {/* Overlay escuro com máscara */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.5)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Borda do spotlight */}
      <div
        className="absolute rounded-lg border-2 border-primary shadow-lg transition-all duration-300"
        style={{
          top: spotlightPosition.top,
          left: spotlightPosition.left,
          width: spotlightPosition.width,
          height: spotlightPosition.height,
        }}
      />
    </div>
  );
}

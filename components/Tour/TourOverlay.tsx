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
    <>
      {/* Overlay escuro usando divs em vez de SVG para melhor z-index */}
      {/* Top overlay */}
      <div
        className="fixed left-0 right-0 top-0 bg-black/50 z-[90] pointer-events-none"
        style={{ height: spotlightPosition.top }}
      />
      {/* Bottom overlay */}
      <div
        className="fixed left-0 right-0 bottom-0 bg-black/50 z-[90] pointer-events-none"
        style={{ top: spotlightPosition.top + spotlightPosition.height }}
      />
      {/* Left overlay */}
      <div
        className="fixed left-0 bg-black/50 z-[90] pointer-events-none"
        style={{
          top: spotlightPosition.top,
          height: spotlightPosition.height,
          width: spotlightPosition.left,
        }}
      />
      {/* Right overlay */}
      <div
        className="fixed right-0 bg-black/50 z-[90] pointer-events-none"
        style={{
          top: spotlightPosition.top,
          height: spotlightPosition.height,
          left: spotlightPosition.left + spotlightPosition.width,
        }}
      />

      {/* Borda do spotlight */}
      <div
        className="fixed rounded-lg border-2 border-primary shadow-lg transition-all duration-300 z-[91] pointer-events-none"
        style={{
          top: spotlightPosition.top,
          left: spotlightPosition.left,
          width: spotlightPosition.width,
          height: spotlightPosition.height,
        }}
      />
    </>
  );
}

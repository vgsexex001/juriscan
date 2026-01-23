"use client";

import { createContext } from "react";

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right";
  spotlightPadding?: number;
}

export interface TourContextType {
  // Estado
  isWelcomeModalOpen: boolean;
  isTourActive: boolean;
  currentStepIndex: number;
  hasCompletedTour: boolean;

  // Ações
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: () => void;
  resetTour: () => void;

  // Dados
  steps: TourStep[];
  currentStep: TourStep | null;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const TourContext = createContext<TourContextType | null>(null);

"use client";

import { createContext } from "react";

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right";
  spotlightPadding?: number;
  /** Step requires the mobile drawer to be open (sidebar-related steps) */
  requiresDrawer?: boolean;
}

export interface DrawerControl {
  open: () => void;
  close: () => void;
}

export interface TourContextType {
  // Estado
  isTourActive: boolean;
  currentStepIndex: number;
  hasCompletedTour: boolean;

  // Ações
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: () => void;
  resetTour: () => void;

  // Drawer control (for AppShell integration)
  registerDrawerControl: (control: DrawerControl) => void;
  unregisterDrawerControl: () => void;

  // Dados
  steps: TourStep[];
  currentStep: TourStep | null;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const TourContext = createContext<TourContextType | null>(null);

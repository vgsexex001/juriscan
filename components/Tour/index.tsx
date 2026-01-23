"use client";

import { WelcomeModal } from "./WelcomeModal";
import { TourOverlay } from "./TourOverlay";
import { TourPopover } from "./TourPopover";

export function Tour() {
  return (
    <>
      <WelcomeModal />
      <TourOverlay />
      <TourPopover />
    </>
  );
}

export { TourProvider } from "./TourProvider";
export { TourContext } from "./TourContext";
export type { TourStep, TourContextType } from "./TourContext";

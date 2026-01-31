"use client";

import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
}

const sizeClasses = {
  sm: { container: "w-12 h-12", icon: "w-6 h-6", text: "text-xl", subtitle: "text-xs" },
  md: { container: "w-14 h-14", icon: "w-7 h-7", text: "text-2xl", subtitle: "text-sm" },
  lg: { container: "w-16 h-16", icon: "w-9 h-9", text: "text-3xl", subtitle: "text-sm" },
  xl: { container: "w-20 h-20", icon: "w-12 h-12", text: "text-4xl", subtitle: "text-base" },
};

export default function AnimatedLogo({ size = "md", variant = "light" }: AnimatedLogoProps) {
  const [mounted, setMounted] = useState(false);
  const classes = sizeClasses[size];
  const isLight = variant === "light";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl",
          isLight ? "bg-white/10 backdrop-blur-sm" : "bg-blue-100",
          classes.container,
          mounted && "animate-bounce-subtle"
        )}
      >
        <Scale
          className={cn(isLight ? "text-white" : "text-blue-600", classes.icon)}
          strokeWidth={1.5}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-50 blur-xl",
            isLight ? "bg-white/20" : "bg-blue-400/30"
          )}
        />
      </div>

      <h2
        className={cn(
          "mt-4 font-bold tracking-tight",
          classes.text,
          isLight ? "text-white" : "text-gray-900",
          mounted ? "animate-fade-in" : "opacity-0"
        )}
        style={{ animationDelay: "100ms" }}
      >
        Juriscan
      </h2>

      <p
        className={cn(
          classes.subtitle,
          isLight ? "text-blue-200" : "text-gray-500",
          mounted ? "animate-fade-in" : "opacity-0"
        )}
        style={{ animationDelay: "200ms" }}
      >
        Inteligencia Juridica
      </p>
    </div>
  );
}

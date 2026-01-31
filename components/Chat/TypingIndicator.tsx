"use client";

import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

const LOADING_TEXTS = [
  "Analisando sua consulta...",
  "Pesquisando jurisprudência...",
  "Elaborando resposta...",
  "Verificando legislação...",
];

export default function TypingIndicator() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <Scale className="w-4 h-4 text-white" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-primary text-sm font-medium mb-1.5">
          Assistente Jurídico
        </p>
        <div className="bg-gray-100 rounded-xl rounded-tl-sm p-4">
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 animate-pulse">
          {LOADING_TEXTS[textIndex]}
        </p>
      </div>
    </div>
  );
}

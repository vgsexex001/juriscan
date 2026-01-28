"use client";

import { useEffect } from "react";
import { Mic, Square, Pause, Play, X, Check } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { formatAudioDuration, CHAT_ATTACHMENT_LIMITS } from "@/types/chat";

interface ChatAudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function ChatAudioRecorder({
  onRecordingComplete,
  onCancel,
  disabled = false,
}: ChatAudioRecorderProps) {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,
    isSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useAudioRecorder();

  // Auto-stop ao atingir limite
  useEffect(() => {
    if (duration >= CHAT_ATTACHMENT_LIMITS.maxAudioDuration && isRecording) {
      stopRecording();
    }
  }, [duration, isRecording, stopRecording]);

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500">
        Seu navegador não suporta gravação de áudio.
      </div>
    );
  }

  // Estado: não gravando e sem áudio gravado
  if (!isRecording && !audioBlob) {
    return (
      <button
        onClick={startRecording}
        disabled={disabled}
        className={`p-2 rounded-lg transition-colors ${
          disabled
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
        }`}
        aria-label="Iniciar gravação de áudio"
      >
        <Mic className="w-5 h-5" />
      </button>
    );
  }

  // Estado: gravando
  if (isRecording) {
    const progress = (duration / CHAT_ATTACHMENT_LIMITS.maxAudioDuration) * 100;

    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
        {/* Indicador de gravação */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-purple-700">
            {formatAudioDuration(duration)}
          </span>
          <span className="text-xs text-purple-500">
            / {formatAudioDuration(CHAT_ATTACHMENT_LIMITS.maxAudioDuration)}
          </span>
        </div>

        {/* Waveform simplificado */}
        <div className="flex items-center gap-0.5 h-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-purple-400 rounded-full transition-all ${
                isPaused ? "h-2" : "animate-pulse"
              }`}
              style={{
                height: isPaused ? "8px" : `${Math.random() * 16 + 8}px`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>

        {/* Barra de progresso */}
        <div className="w-16 h-1.5 bg-purple-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Botão pausar/continuar */}
        <button
          onClick={isPaused ? resumeRecording : pauseRecording}
          className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-full"
          aria-label={isPaused ? "Continuar gravação" : "Pausar gravação"}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* Botão cancelar */}
        <button
          onClick={() => {
            resetRecording();
            onCancel();
          }}
          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
          aria-label="Cancelar gravação"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Botão parar */}
        <button
          onClick={stopRecording}
          className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
          aria-label="Parar gravação"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Estado: áudio gravado (preview)
  if (audioBlob && audioUrl) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
        {/* Player de áudio */}
        <audio
          src={audioUrl}
          controls
          className="h-8 max-w-[200px]"
          style={{
            filter: "invert(0.3) sepia(1) saturate(5) hue-rotate(240deg)",
          }}
        />

        <span className="text-sm text-purple-700 font-medium">
          {formatAudioDuration(duration)}
        </span>

        {/* Botão descartar */}
        <button
          onClick={() => {
            resetRecording();
            onCancel();
          }}
          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
          aria-label="Descartar áudio"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Botão confirmar */}
        <button
          onClick={() => {
            onRecordingComplete(audioBlob, duration);
            resetRecording();
          }}
          className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
          aria-label="Usar este áudio"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
        <span className="text-sm text-red-600">{error}</span>
        <button
          onClick={resetRecording}
          className="text-red-600 hover:text-red-700 underline text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return null;
}

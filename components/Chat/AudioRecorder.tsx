"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, X, AlertCircle, Send, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { formatAudioDuration, CHAT_ATTACHMENT_LIMITS } from "@/types/chat";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function AudioRecorder({
  onRecordingComplete,
  onCancel,
  disabled = false,
}: AudioRecorderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const hasAutoStartedRef = useRef(false);

  const {
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    error,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  } = useAudioRecorder({});

  // Auto-start recording when component mounts
  useEffect(() => {
    const autoStart = async () => {
      if (hasAutoStartedRef.current) return;

      // Wait for isSupported to be determined
      if (isSupported === false) {
        // Still checking or not supported
        return;
      }

      hasAutoStartedRef.current = true;
      setIsInitializing(true);

      console.log("🎤 Auto-starting recording...");

      try {
        await startRecording();
      } catch (err) {
        console.error("🎤 Failed to start recording:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    autoStart();
  }, [isSupported, startRecording]);

  // Update initializing state when recording starts
  useEffect(() => {
    if (isRecording) {
      setIsInitializing(false);
    }
  }, [isRecording]);

  // Handle stop and confirm
  const handleStopAndConfirm = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // Handle send after recording stopped
  const handleSend = useCallback(() => {
    if (audioBlob && duration > 0) {
      console.log("🎤 Sending audio:", audioBlob.size, "bytes");
      onRecordingComplete(audioBlob, duration);
      resetRecording();
    }
  }, [audioBlob, duration, onRecordingComplete, resetRecording]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    cancelRecording();
    onCancel();
  }, [cancelRecording, onCancel]);

  // Handle re-record
  const handleReRecord = useCallback(async () => {
    resetRecording();
    hasAutoStartedRef.current = false;
    setIsInitializing(true);

    try {
      await startRecording();
    } finally {
      setIsInitializing(false);
    }
  }, [resetRecording, startRecording]);

  // ===== ERROR STATE =====
  if (error) {
    const isPermissionError = error.includes("Permissão") || error.includes("negada") || error.includes("NotAllowedError");

    return (
      <div className="flex flex-col gap-2 px-4 py-3 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-600 font-medium">
              {isPermissionError ? "Permissão de microfone necessária" : "Erro ao gravar áudio"}
            </p>
            {isPermissionError ? (
              <div className="text-xs text-red-500 mt-1 space-y-1">
                <p>Para habilitar o microfone:</p>
                <ol className="list-decimal list-inside ml-1">
                  <li>Clique no ícone de cadeado na barra de endereço</li>
                  <li>Encontre &quot;Microfone&quot; e selecione &quot;Permitir&quot;</li>
                  <li>Recarregue a página (F5)</li>
                </ol>
              </div>
            ) : (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleReRecord}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // ===== NOT SUPPORTED STATE =====
  if (isSupported === false) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-yellow-50 rounded-xl border border-yellow-200">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <span className="text-sm text-yellow-700">
          Gravação de áudio não é suportada neste navegador
        </span>
        <button
          onClick={handleCancel}
          className="ml-auto p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ===== PREVIEW STATE (recording complete) =====
  if (audioBlob && audioUrl && !isRecording) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
        {/* Audio player */}
        <audio src={audioUrl} controls className="h-8 max-w-[200px]" />

        {/* Duration */}
        <span className="text-sm text-purple-700 font-medium">
          {formatAudioDuration(duration)}
        </span>

        {/* Re-record button */}
        <button
          onClick={handleReRecord}
          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
          aria-label="Gravar novamente"
          title="Gravar novamente"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Discard button */}
        <button
          onClick={handleCancel}
          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          aria-label="Descartar áudio"
          title="Descartar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
          aria-label="Enviar áudio"
          title="Enviar"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ===== RECORDING STATE =====
  if (isRecording) {
    const progress = (duration / CHAT_ATTACHMENT_LIMITS.maxAudioDuration) * 100;

    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-red-50 rounded-full border border-red-200">
        {/* Recording indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-red-600 font-medium text-sm">Gravando</span>
        </div>

        {/* Duration */}
        <span className="text-red-600 font-mono font-medium">
          {formatAudioDuration(duration)}
        </span>

        {/* Waveform animation */}
        <div className="flex items-center gap-0.5 h-6 flex-1 justify-center max-w-[100px]">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full animate-pulse"
              style={{
                height: `${8 + Math.random() * 16}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.5s",
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-16 h-1.5 bg-red-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Cancel button */}
        <button
          onClick={handleCancel}
          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
          aria-label="Cancelar gravação"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Stop button */}
        <button
          onClick={handleStopAndConfirm}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          aria-label="Parar gravação"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ===== INITIALIZING STATE =====
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
      <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
      <span className="text-sm text-purple-700">
        {isInitializing ? "Solicitando acesso ao microfone..." : "Preparando gravação..."}
      </span>
      <button
        onClick={handleCancel}
        disabled={disabled}
        className="ml-auto p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
        aria-label="Cancelar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

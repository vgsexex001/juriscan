"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, X, AlertCircle, ChevronLeft } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useMicrophonePermission } from "@/hooks/useMicrophonePermission";
import { WaveformVisualizer } from "./WaveformVisualizer";
import AudioPreview from "./AudioPreview";
import { formatAudioDuration, CHAT_ATTACHMENT_LIMITS } from "@/types/chat";

type RecorderMode = "hold" | "tap";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onCancel: () => void;
  mode?: RecorderMode;
  disabled?: boolean;
}

// Cancel threshold in pixels (drag left to cancel)
const CANCEL_THRESHOLD = 100;

export default function AudioRecorder({
  onRecordingComplete,
  onCancel,
  mode = "hold",
  disabled = false,
}: AudioRecorderProps) {
  const [waveformData, setWaveformData] = useState<Uint8Array | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);

  const startXRef = useRef<number>(0);
  const isHoldingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { permission, error: permissionError, requestPermission } = useMicrophonePermission();

  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error: recorderError,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  } = useAudioRecorder({
    onWaveformData: setWaveformData,
    fftSize: 256,
  });

  // Handle permission check before recording
  const handleStartRecording = useCallback(async () => {
    if (disabled) return;

    if (permission === "denied") {
      setShowPermissionError(true);
      return;
    }

    if (permission === "prompt" || permission === "unsupported") {
      const granted = await requestPermission();
      if (!granted) {
        setShowPermissionError(true);
        return;
      }
    }

    setShowPermissionError(false);
    await startRecording();
  }, [disabled, permission, requestPermission, startRecording]);

  // Hold mode handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (mode !== "hold" || disabled || audioBlob) return;

      e.preventDefault();
      isHoldingRef.current = true;
      startXRef.current = e.clientX;
      setDragOffset(0);
      setIsCancelling(false);

      // Capture pointer for drag events
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      handleStartRecording();
    },
    [mode, disabled, audioBlob, handleStartRecording]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (mode !== "hold" || !isHoldingRef.current || !isRecording) return;

      const deltaX = e.clientX - startXRef.current;
      // Only allow dragging left (negative values)
      const offset = Math.min(0, deltaX);
      setDragOffset(offset);
      setIsCancelling(Math.abs(offset) > CANCEL_THRESHOLD);
    },
    [mode, isRecording]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (mode !== "hold" || !isHoldingRef.current) return;

      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      isHoldingRef.current = false;

      if (isCancelling) {
        cancelRecording();
        onCancel();
      } else if (isRecording) {
        stopRecording();
      }

      setDragOffset(0);
      setIsCancelling(false);
    },
    [mode, isCancelling, isRecording, cancelRecording, stopRecording, onCancel]
  );

  // Tap mode handlers
  const handleTapClick = useCallback(async () => {
    if (mode !== "tap" || disabled) return;

    if (audioBlob) {
      // Already have a recording, do nothing (handled by preview)
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      await handleStartRecording();
    }
  }, [mode, disabled, audioBlob, isRecording, stopRecording, handleStartRecording]);

  // Handle recording complete
  const handleConfirmRecording = useCallback(() => {
    if (audioBlob && duration > 0) {
      onRecordingComplete(audioBlob, duration);
      resetRecording();
    }
  }, [audioBlob, duration, onRecordingComplete, resetRecording]);

  // Handle discard
  const handleDiscard = useCallback(() => {
    resetRecording();
    onCancel();
  }, [resetRecording, onCancel]);

  // Handle re-record
  const handleReRecord = useCallback(async () => {
    resetRecording();
    await handleStartRecording();
  }, [resetRecording, handleStartRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        cancelRecording();
      }
    };
  }, [isRecording, cancelRecording]);

  // Error state
  const error = recorderError || (showPermissionError ? permissionError : null);

  if (error) {
    const isPermissionError = error.includes("Permissão") || error.includes("negada");

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
            onClick={async () => {
              resetRecording();
              setShowPermissionError(false);
              await requestPermission();
            }}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
          <button
            onClick={() => {
              resetRecording();
              setShowPermissionError(false);
              onCancel();
            }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Not supported state
  if (!isSupported && typeof window !== "undefined") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-yellow-50 rounded-xl border border-yellow-200">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <span className="text-sm text-yellow-700">
          Gravação de áudio não é suportada neste navegador
        </span>
        <button
          onClick={onCancel}
          className="ml-auto p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Preview state (recording complete)
  if (audioBlob && audioUrl) {
    return (
      <AudioPreview
        audioUrl={audioUrl}
        duration={duration}
        onConfirm={handleConfirmRecording}
        onDiscard={handleDiscard}
        onReRecord={handleReRecord}
      />
    );
  }

  // Recording state
  if (isRecording) {
    const progress = (duration / CHAT_ATTACHMENT_LIMITS.maxAudioDuration) * 100;
    const cancelProgress = Math.min(100, (Math.abs(dragOffset) / CANCEL_THRESHOLD) * 100);

    return (
      <div
        ref={containerRef}
        className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-full border border-purple-200 select-none touch-none"
        style={{
          transform: mode === "hold" ? `translateX(${dragOffset}px)` : undefined,
          transition: dragOffset === 0 ? "transform 0.2s ease" : undefined,
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Cancel indicator (hold mode) */}
        {mode === "hold" && (
          <div
            className={`flex items-center gap-1 transition-opacity ${
              isCancelling ? "opacity-100" : "opacity-50"
            }`}
          >
            <ChevronLeft
              className={`w-4 h-4 ${isCancelling ? "text-red-500" : "text-gray-400"}`}
            />
            <span
              className={`text-xs ${isCancelling ? "text-red-500 font-medium" : "text-gray-400"}`}
            >
              {isCancelling ? "Solte para cancelar" : "Deslize para cancelar"}
            </span>
          </div>
        )}

        {/* Recording indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 bg-red-500 rounded-full ${
              isPaused ? "" : "animate-pulse"
            }`}
          />
          <span className="text-sm font-medium text-purple-700">
            {formatAudioDuration(duration)}
          </span>
        </div>

        {/* Waveform */}
        <WaveformVisualizer
          data={waveformData}
          isActive={isRecording && !isPaused}
          width={80}
          height={24}
          barWidth={2}
          barGap={1}
          barColor={isCancelling ? "#ef4444" : "#9333ea"}
        />

        {/* Progress bar */}
        <div className="w-12 h-1.5 bg-purple-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isCancelling ? "bg-red-500" : "bg-purple-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Cancel progress (hold mode) */}
        {mode === "hold" && dragOffset !== 0 && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-2">
            <div
              className="h-1 bg-red-400 rounded-full transition-all"
              style={{ width: `${cancelProgress}%` }}
            />
          </div>
        )}

        {/* Stop button (tap mode) */}
        {mode === "tap" && (
          <>
            <button
              onClick={() => {
                cancelRecording();
                onCancel();
              }}
              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              aria-label="Cancelar gravação"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={stopRecording}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
              aria-label="Parar gravação"
            >
              <div className="w-3 h-3 bg-white rounded-sm" />
            </button>
          </>
        )}

        {/* Recording indicator for hold mode */}
        {mode === "hold" && (
          <div className="p-2 bg-red-500 text-white rounded-full animate-pulse">
            <Mic className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  }

  // Idle state - show record button
  if (mode === "tap") {
    return (
      <button
        onClick={handleTapClick}
        disabled={disabled}
        className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
        aria-label="Gravar áudio"
        title="Clique para gravar"
      >
        <Mic className="w-5 h-5" />
      </button>
    );
  }

  // Hold mode idle - larger button with instructions
  return (
    <button
      onPointerDown={handlePointerDown}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors touch-none select-none"
      aria-label="Segurar para gravar áudio"
      title="Segure para gravar"
    >
      <Mic className="w-5 h-5 text-purple-600" />
      <span className="text-sm text-purple-600 font-medium">Segure para gravar</span>
    </button>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CHAT_ATTACHMENT_LIMITS } from "@/types/chat";

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
  isSupported: boolean;
}

interface UseAudioRecorderReturn extends AudioRecorderState {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}

// Obter MIME type suportado pelo navegador
function getSupportedMimeType(): string {
  if (typeof window === "undefined") return "audio/webm";

  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log("🎤 Using MIME type:", type);
      return type;
    }
  }

  console.warn("🎤 No supported MIME type found, defaulting to audio/webm");
  return "audio/webm";
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
    isSupported: false, // Será atualizado no useEffect
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const mimeTypeRef = useRef<string>("audio/webm");

  // Verificar suporte no cliente
  useEffect(() => {
    const checkSupport = () => {
      const hasMediaDevices = !!navigator?.mediaDevices?.getUserMedia;
      const hasMediaRecorder = typeof MediaRecorder !== "undefined";
      const isSupported = hasMediaDevices && hasMediaRecorder;

      console.log("🎤 Audio recording support:", {
        hasMediaDevices,
        hasMediaRecorder,
        isSupported,
      });

      if (isSupported) {
        mimeTypeRef.current = getSupportedMimeType();
      }

      setState((prev) => ({ ...prev, isSupported }));
    };

    checkSupport();
  }, []);

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log("🎤 Stopping recording...");
    stopTimer();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, [stopTimer]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - pausedDurationRef.current * 1000;

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Verificar limite de duração
      if (elapsed >= CHAT_ATTACHMENT_LIMITS.maxAudioDuration) {
        console.log("🎤 Max duration reached, stopping...");
        stopRecording();
        return;
      }

      setState((prev) => ({ ...prev, duration: elapsed }));
    }, 100);
  }, [stopRecording]);

  const startRecording = useCallback(async () => {
    console.log("🎤 Starting recording...");

    if (!state.isSupported) {
      console.error("🎤 Audio recording not supported");
      setState((prev) => ({
        ...prev,
        error: "Gravação de áudio não suportada neste navegador",
      }));
      return;
    }

    try {
      // Resetar estado
      chunksRef.current = [];
      pausedDurationRef.current = 0;

      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }

      // Solicitar permissão do microfone
      console.log("🎤 Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      console.log("🎤 Microphone permission granted, stream:", stream.id);
      streamRef.current = stream;

      // Criar MediaRecorder com MIME type suportado
      const mimeType = mimeTypeRef.current;
      console.log("🎤 Creating MediaRecorder with mimeType:", mimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log("🎤 Data available:", event.data.size, "bytes");
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("🎤 Recording stopped, chunks:", chunksRef.current.length);

        if (chunksRef.current.length === 0) {
          console.error("🎤 No audio data collected!");
          setState((prev) => ({
            ...prev,
            isRecording: false,
            error: "Nenhum áudio foi gravado. Tente novamente.",
          }));
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        console.log("🎤 Audio blob created:", blob.size, "bytes");

        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioBlob: blob,
          audioUrl: url,
        }));

        // Parar stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("🎤 MediaRecorder error:", event);
        stopTimer();
        setState((prev) => ({
          ...prev,
          isRecording: false,
          error: "Erro ao gravar áudio. Tente novamente.",
        }));
      };

      // Iniciar gravação - solicitar dados a cada 1 segundo
      mediaRecorder.start(1000);
      startTimer();

      console.log("🎤 Recording started!");

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
        error: null,
      }));
    } catch (error) {
      console.error("🎤 Error starting recording:", error);

      let errorMessage = "Erro ao iniciar gravação";
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Permissão de microfone negada. Clique no ícone de cadeado na barra de endereço para permitir.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "Nenhum microfone encontrado. Conecte um microfone e tente novamente.";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Microfone está sendo usado por outro aplicativo.";
        } else if (error.name === "OverconstrainedError") {
          errorMessage = "Configuração de microfone não suportada.";
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }

      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [state.isSupported, state.audioUrl, startTimer, stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("🎤 Pausing recording...");
      mediaRecorderRef.current.pause();
      stopTimer();
      pausedDurationRef.current = state.duration;
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [state.duration, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      console.log("🎤 Resuming recording...");
      mediaRecorderRef.current.resume();
      startTimer();
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [startTimer]);

  const resetRecording = useCallback(() => {
    console.log("🎤 Resetting recording...");
    stopTimer();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    chunksRef.current = [];
    pausedDurationRef.current = 0;
    mediaRecorderRef.current = null;

    setState((prev) => ({
      ...prev,
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      error: null,
    }));
  }, [state.audioUrl, stopTimer]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
}

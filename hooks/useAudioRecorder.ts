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

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
    isSupported: typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    };
  }, [state.audioUrl]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - pausedDurationRef.current * 1000;
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Verificar limite de duração
      if (elapsed >= CHAT_ATTACHMENT_LIMITS.maxAudioDuration) {
        stopRecording();
        return;
      }

      setState((prev) => ({ ...prev, duration: elapsed }));
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Resetar estado
      chunksRef.current = [];
      pausedDurationRef.current = 0;

      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }

      // Solicitar permissão do microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Criar MediaRecorder
      // Usar webm para melhor compatibilidade com Whisper
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

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
        console.error("MediaRecorder error:", event);
        setState((prev) => ({
          ...prev,
          isRecording: false,
          error: "Erro ao gravar áudio",
        }));
      };

      // Iniciar gravação
      mediaRecorder.start(1000); // Chunks a cada 1 segundo
      startTimer();

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
      console.error("Error starting recording:", error);

      let errorMessage = "Erro ao iniciar gravação";
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Permissão de microfone negada";
        } else if (error.name === "NotFoundError") {
          errorMessage = "Nenhum microfone encontrado";
        }
      }

      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [state.audioUrl, startTimer]);

  const stopRecording = useCallback(() => {
    stopTimer();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, [stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      stopTimer();
      pausedDurationRef.current = state.duration;
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [state.duration, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      startTimer();
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [startTimer]);

  const resetRecording = useCallback(() => {
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

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      error: null,
      isSupported: true,
    });
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

"use client";

import { useState, useRef } from "react";
import { Play, Pause, Download, ChevronDown, ChevronUp } from "lucide-react";
import type { ChatAttachment } from "@/types/chat";
import { formatAudioDuration } from "@/types/chat";

interface ChatAudioMessageProps {
  attachment: ChatAttachment;
}

export default function ChatAudioMessage({ attachment }: ChatAudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranscription, setShowTranscription] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const duration = attachment.metadata.duration || 0;
  const hasTranscription = !!attachment.metadata.transcription;

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-xs">
      {/* Player de áudio */}
      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
        {/* Botão play/pause */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Waveform / Progress */}
        <div className="flex-1">
          {/* Barra de progresso */}
          <div className="relative h-8 flex items-center">
            {/* Waveform estilizado */}
            <div className="absolute inset-0 flex items-center gap-0.5 px-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-colors"
                  style={{
                    height: `${Math.random() * 16 + 8}px`,
                    backgroundColor:
                      (i / 20) * 100 < progress
                        ? "rgb(147 51 234)" // purple-600
                        : "rgb(216 180 254)", // purple-300
                  }}
                />
              ))}
            </div>

            {/* Input range invisível para seek */}
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Tempo */}
          <div className="flex justify-between text-xs text-purple-600 mt-1">
            <span>{formatAudioDuration(currentTime)}</span>
            <span>{formatAudioDuration(duration)}</span>
          </div>
        </div>

        {/* Download */}
        <a
          href={attachment.url}
          download={attachment.name}
          className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
          title="Baixar áudio"
        >
          <Download className="w-4 h-4" />
        </a>

        {/* Audio element (hidden) */}
        <audio
          ref={audioRef}
          src={attachment.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={() => {
            if (audioRef.current && !attachment.metadata.duration) {
              // Atualizar duração se não estava definida
            }
          }}
        />
      </div>

      {/* Transcrição */}
      {hasTranscription && (
        <div className="mt-2">
          <button
            onClick={() => setShowTranscription(!showTranscription)}
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
          >
            {showTranscription ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>Transcrição</span>
          </button>

          {showTranscription && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                {attachment.metadata.transcription}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { X, Download, Loader2, FileText } from "lucide-react";

interface PDFViewerModalProps {
  blob: Blob;
  filename: string;
  onClose: () => void;
}

export default function PDFViewerModal({ blob, filename, onClose }: PDFViewerModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  // Create blob URL on mount, revoke on unmount
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  // Lock body scroll
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    if (!blobUrl) return;
    setIsDownloading(true);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsDownloading(false);
    setDownloadDone(true);
    setTimeout(() => setDownloadDone(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900 flex flex-col">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 bg-gray-800 flex-shrink-0"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium text-white truncate">
            {filename}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white active:text-white rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* PDF Content */}
      <div className="flex-1 overflow-hidden bg-gray-100">
        {blobUrl ? (
          <iframe
            src={`${blobUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full border-0"
            title="Visualizador de PDF"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        <button
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 font-medium transition-colors"
        >
          <X className="w-5 h-5" />
          <span>Fechar</span>
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading || !blobUrl}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-xl bg-primary text-white hover:bg-primary-hover active:bg-primary-hover disabled:opacity-50 font-medium transition-colors"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Baixando...</span>
            </>
          ) : downloadDone ? (
            <span>Baixado!</span>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Baixar PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

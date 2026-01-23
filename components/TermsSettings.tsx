"use client";

import { useState } from "react";
import {
  AlertCircle,
  FileText,
  Shield,
  Cookie,
  ChevronRight,
  CheckCircle,
  Play,
} from "lucide-react";

interface DocumentLink {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

const documentLinks: DocumentLink[] = [
  {
    id: "terms",
    label: "Termos de Uso da Plataforma",
    icon: FileText,
    href: "/docs/terms",
  },
  {
    id: "privacy",
    label: "Política de Privacidade (LGPD)",
    icon: Shield,
    href: "/docs/privacy",
  },
  {
    id: "cookies",
    label: "Política de Cookies",
    icon: Cookie,
    href: "/docs/cookies",
  },
];

interface TermsSettingsProps {
  acceptedDate?: string;
  onViewDocument?: (documentId: string) => void;
  onRestartTour?: () => void;
}

export default function TermsSettings({
  acceptedDate = "14/01/2026",
  onViewDocument,
  onRestartTour,
}: TermsSettingsProps) {
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestartTour = async () => {
    setIsRestarting(true);
    // Simulate action
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRestarting(false);
    onRestartTour?.();
  };

  const handleViewDocument = (doc: DocumentLink) => {
    onViewDocument?.(doc.id);
    // In a real app, this would navigate to the document
    window.open(doc.href, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Help Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Play className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800">
              Precisa de ajuda?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Reveja o tour guiado da plataforma a qualquer momento.
            </p>
            <button
              onClick={handleRestartTour}
              disabled={isRestarting}
              className="mt-4 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isRestarting ? "Iniciando..." : "Rever tour da plataforma"}
            </button>
          </div>
        </div>
      </div>

      {/* About Analysis Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Sobre as Análises da Juriscan
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Revise as informações importantes sobre a natureza das análises
          preditivas e relatórios gerados pela plataforma
        </p>

        {/* Info Callout */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800">
                Sobre as Análises Preditivas
              </h4>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                As análises apresentadas são baseadas em dados estatísticos,
                jurisprudência e padrões históricos de decisões judiciais. Os
                resultados representam probabilidades e cenários estimados, não
                constituindo garantia de êxito ou previsão absoluta de resultado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Privacy Documents */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-5">
          Termos de Uso e Política de Privacidade
        </h3>

        <div className="divide-y divide-gray-100">
          {documentLinks.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleViewDocument(doc)}
              className="w-full flex items-center justify-between py-4 group hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <doc.icon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {doc.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <span className="text-sm font-medium">Ver documento</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Terms Accepted Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Você aceitou os termos
            </h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Ao utilizar a plataforma, você confirmou compreender que as
              análises representam probabilidades estatísticas e não garantias de
              resultado. Esta concordância foi registrada em{" "}
              <span className="font-medium text-gray-800">{acceptedDate}</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

interface NotificationPreferences {
  analises_concluidas: boolean;
  relatorios_gerados: boolean;
  prazos_processuais: boolean;
  creditos_baixos: boolean;
  novidades_atualizacoes: boolean;
  marketing_promocoes: boolean;
}

interface NotificationItem {
  id: keyof NotificationPreferences;
  title: string;
  description: string;
}

const notificationItems: NotificationItem[] = [
  {
    id: "analises_concluidas",
    title: "Análises concluídas",
    description: "Notificar quando uma análise for concluída",
  },
  {
    id: "relatorios_gerados",
    title: "Relatórios gerados",
    description: "Notificar quando um relatório estiver pronto",
  },
  {
    id: "prazos_processuais",
    title: "Prazos processuais",
    description: "Alertas sobre prazos importantes",
  },
  {
    id: "creditos_baixos",
    title: "Créditos baixos",
    description: "Avisar quando os créditos estiverem acabando",
  },
  {
    id: "novidades_atualizacoes",
    title: "Novidades e atualizações",
    description: "Receber informações sobre novos recursos",
  },
  {
    id: "marketing_promocoes",
    title: "Marketing e promoções",
    description: "Ofertas especiais e conteúdos exclusivos",
  },
];

const defaultPreferences: NotificationPreferences = {
  analises_concluidas: true,
  relatorios_gerados: true,
  prazos_processuais: true,
  creditos_baixos: true,
  novidades_atualizacoes: false,
  marketing_promocoes: false,
};

interface NotificationSettingsProps {
  onSave?: (preferences: NotificationPreferences) => void;
}

export default function NotificationSettings({
  onSave,
}: NotificationSettingsProps) {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/notifications/preferences");
        if (response.ok) {
          const result = await response.json();
          setPreferences(result.data.preferences);
        }
      } catch {
        // Use defaults on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = (id: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erro ao salvar preferências");
      }

      setSuccess(true);
      onSave?.(preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar preferências");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Preferências de Notificação
      </h2>

      {/* Toggle List */}
      <div>
        {notificationItems.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center justify-between py-4 gap-4 ${
              index < notificationItems.length - 1
                ? "border-b border-gray-100"
                : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
            </div>

            {/* Toggle Switch */}
            <button
              role="switch"
              aria-checked={preferences[item.id]}
              aria-label={`Alternar ${item.title}`}
              onClick={() => handleToggle(item.id)}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                preferences[item.id] ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute left-0 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  preferences[item.id] ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Preferências salvas com sucesso!</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-gray-300 rounded-lg text-sm font-medium text-white transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Salvando..." : "Salvar preferências"}
        </button>
      </div>
    </div>
  );
}

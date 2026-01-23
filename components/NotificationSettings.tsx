"use client";

import { useState } from "react";
import { Save } from "lucide-react";

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

  const handleToggle = (id: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSave?.(preferences);
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Preferências de Notificação
      </h2>

      {/* Toggle List */}
      <div className="flex-1 max-w-2xl">
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
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  preferences[item.id] ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 mt-6 border-t border-gray-100 max-w-2xl">
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

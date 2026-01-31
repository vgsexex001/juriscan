"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import SettingsMenu from "@/components/SettingsMenu";
import ProfileSettings from "@/components/ProfileSettings";
import NotificationSettings from "@/components/NotificationSettings";
import SecuritySettings from "@/components/SecuritySettings";
import PlanSettings from "@/components/PlanSettings";
import PrivacySettings from "@/components/PrivacySettings";
import TermsSettings from "@/components/TermsSettings";
import { useTour } from "@/hooks/useTour";
import { useProfile } from "@/hooks/useProfile";

export default function ConfiguracoesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const { resetTour } = useTour();
  const { profile } = useProfile();

  // Format accepted date
  const formatAcceptedDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Data não registrada";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderSettingsContent = () => {
    switch (activeTab) {
      case "perfil":
        return <ProfileSettings />;
      case "notificacoes":
        return <NotificationSettings />;
      case "seguranca":
        return <SecuritySettings />;
      case "plano":
        return <PlanSettings />;
      case "privacidade":
        return <PrivacySettings userEmail={profile?.email} />;
      case "termos":
        return (
          <TermsSettings
            acceptedDate={formatAcceptedDate(profile?.terms_accepted_at)}
            onRestartTour={() => resetTour()}
          />
        );
      default:
        return null;
    }
  };

  if (!mounted) return null;

  return (
    <AppShell>
      <main className="p-4 sm:p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Configurações</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie suas preferências e dados da conta
          </p>
        </div>

        {/* Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Menu */}
          <div className="w-full lg:w-auto flex-shrink-0">
            <SettingsMenu activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          {/* Settings Content */}
          <div className={`flex-1 ${
            activeTab === "termos" || activeTab === "plano"
              ? ""
              : "bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
          }`}>
            {renderSettingsContent()}
          </div>
        </div>
      </main>
    </AppShell>
  );
}

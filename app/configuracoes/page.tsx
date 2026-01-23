"use client";

import { useState, useEffect } from "react";
import { Menu, Scale } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SettingsMenu from "@/components/SettingsMenu";
import ProfileSettings from "@/components/ProfileSettings";
import NotificationSettings from "@/components/NotificationSettings";
import SecuritySettings from "@/components/SecuritySettings";
import PlanSettings from "@/components/PlanSettings";
import PrivacySettings from "@/components/PrivacySettings";
import TermsSettings from "@/components/TermsSettings";

export default function ConfiguracoesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSave = (data: unknown) => {
    console.log("Saving profile data:", data);
    // API call would go here
  };

  const handleCancel = () => {
    console.log("Cancelled changes");
  };

  const renderSettingsContent = () => {
    switch (activeTab) {
      case "perfil":
        return <ProfileSettings onSave={handleSave} onCancel={handleCancel} />;
      case "notificacoes":
        return <NotificationSettings onSave={(prefs) => console.log("Saving notifications:", prefs)} />;
      case "seguranca":
        return (
          <SecuritySettings
            onPasswordChange={(data) => console.log("Password change:", data)}
            onRevokeApiKey={() => console.log("API key revoked")}
            onEndSession={(sessionId) => console.log("Session ended:", sessionId)}
          />
        );
      case "plano":
        return <PlanSettings />;
      case "privacidade":
        return (
          <PrivacySettings
            onToggleChange={(id, value) => console.log("Privacy toggle:", id, value)}
            onRequestExport={() => console.log("Export requested")}
            onDeleteData={() => console.log("Data deleted")}
            onDeleteAccount={() => console.log("Account deleted")}
            userEmail="advogado@email.com"
          />
        );
      case "termos":
        return (
          <TermsSettings
            acceptedDate="14/01/2026"
            onViewDocument={(docId) => console.log("View document:", docId)}
            onRestartTour={() => console.log("Tour restarted")}
          />
        );
      default:
        return null;
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:ml-60 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 ml-2">
            <Scale className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <span className="text-primary text-lg font-semibold">Juriscan</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie suas preferências e dados da conta
            </p>
          </div>

          {/* Settings Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Settings Menu */}
            <div className="lg:block">
              <SettingsMenu activeTab={activeTab} onTabChange={handleTabChange} />
            </div>

            {/* Settings Content */}
            <div className={`flex-1 ${
              activeTab === "termos" || activeTab === "plano"
                ? ""
                : "bg-white rounded-xl border border-gray-200 p-6"
            }`}>
              {renderSettingsContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

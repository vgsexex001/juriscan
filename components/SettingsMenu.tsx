"use client";

import {
  User,
  Bell,
  Shield,
  CreditCard,
  Lock,
  Info,
  LucideIcon,
} from "lucide-react";

interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

const menuItems: MenuItem[] = [
  { id: "perfil", icon: User, label: "Perfil" },
  { id: "notificacoes", icon: Bell, label: "Notificações" },
  { id: "seguranca", icon: Shield, label: "Segurança" },
  { id: "plano", icon: CreditCard, label: "Plano e Créditos" },
  { id: "privacidade", icon: Lock, label: "Dados e Privacidade" },
  { id: "termos", icon: Info, label: "Termos e Disclaimers" },
];

interface SettingsMenuProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function SettingsMenu({
  activeTab,
  onTabChange,
}: SettingsMenuProps) {
  return (
    <nav
      className="w-[220px] bg-white rounded-xl border border-gray-200 p-2 h-fit"
      aria-label="Menu de configurações"
    >
      {menuItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon
              className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500"}`}
            />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

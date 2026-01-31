"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  MessageSquare,
  LayoutDashboard,
  History,
  FileText,
  Settings,
  LogOut,
  Coins,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";

const navItems = [
  { id: "chat-juridico", icon: MessageSquare, label: "Chat Jurídico", href: "/chat", tourId: "menu-chat" },
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", tourId: "menu-dashboard" },
  { id: "historico", icon: History, label: "Histórico", href: "/historico", tourId: "menu-historico" },
  { id: "relatorios", icon: FileText, label: "Relatórios", href: "/relatorios", tourId: "menu-relatorios" },
  { id: "configuracoes", icon: Settings, label: "Configurações", href: "/configuracoes", tourId: "menu-configuracoes" },
];

interface SidebarProps {
  highlightCredits?: boolean;
  highlightNavigation?: boolean;
  highlightMenuItem?: string;
  onItemClick?: () => void;
}

export default function Sidebar({
  highlightCredits = false,
  highlightNavigation = false,
  highlightMenuItem,
  onItemClick,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const { balance, isLoading: isLoadingCredits } = useCredits();

  // Extrair iniciais do nome do usuário
  const getUserInitials = () => {
    const name = user?.user_metadata?.name || user?.email || "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Obter nome de exibição
  const getDisplayName = () => {
    return user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário";
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside data-tour="sidebar" className="fixed left-0 top-0 h-screen w-60 bg-primary flex flex-col z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4">
        <Scale className="w-6 h-6 text-white" strokeWidth={1.5} />
        <span className="text-white text-xl font-semibold">Juriscan</span>
      </div>

      {/* Credits Card */}
      <div
        id="credits-card"
        data-tour="credits"
        className={`mx-4 p-3 bg-white/15 rounded-lg transition-shadow ${
          highlightCredits ? "ring-[3px] ring-blue-500/50 z-50 relative" : ""
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Coins className="w-4 h-4 text-yellow-300" />
          <p className="text-light-blue text-xs">Créditos disponíveis</p>
        </div>
        <p className="text-white text-3xl font-semibold">
          {isLoadingCredits ? "..." : balance}
        </p>
        <Link
          href="/configuracoes?tab=plano"
          className="text-[#93C5FD] text-sm hover:underline mt-2 inline-block"
        >
          Comprar mais →
        </Link>
      </div>

      {/* Navigation */}
      <nav
        id="sidebar-navigation"
        className={`mt-4 flex-1 transition-shadow ${
          highlightNavigation ? "mx-3 rounded-xl ring-[3px] ring-blue-500/50 z-50 relative bg-primary" : ""
        }`}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isHighlighted = highlightMenuItem === item.id;
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`menu-item-${item.id}`}
              data-tour={item.tourId}
              onClick={onItemClick}
              className={`flex items-center gap-3 mx-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-light-blue hover:bg-white/10"
              } ${
                isHighlighted
                  ? "bg-white/20 ring-2 ring-white/30 z-50 relative text-white"
                  : ""
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-sm font-medium">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{getDisplayName()}</p>
            <p className="text-[#93C5FD] text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="flex items-center gap-2 text-light-blue text-sm mt-3 hover:text-white transition-colors w-full px-4 py-3 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>{loading ? "Saindo..." : "Sair"}</span>
        </button>
      </div>
    </aside>
  );
}

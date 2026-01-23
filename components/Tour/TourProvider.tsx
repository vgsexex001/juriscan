"use client";

import { useState, useCallback, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TourContext, TourStep } from "./TourContext";
import { getSupabaseClient } from "@/lib/supabase/client";

const TOUR_STEPS: TourStep[] = [
  {
    id: "sidebar",
    target: '[data-tour="sidebar"]',
    title: "Menu de Navegação",
    content:
      "Use o menu lateral para acessar todas as funcionalidades do Juriscan. Aqui você encontra o Dashboard, Chat Jurídico, Histórico de Análises e mais.",
    placement: "right",
    spotlightPadding: 8,
  },
  {
    id: "credits",
    target: '[data-tour="credits"]',
    title: "Seus Créditos",
    content:
      "Acompanhe seu saldo de créditos aqui. Cada análise ou consulta ao chat consome créditos do seu plano.",
    placement: "right",
    spotlightPadding: 4,
  },
  {
    id: "dashboard",
    target: '[data-tour="menu-dashboard"]',
    title: "Dashboard",
    content:
      "Visualize um resumo das suas atividades, métricas de uso e análises recentes em um só lugar.",
    placement: "right",
    spotlightPadding: 4,
  },
  {
    id: "chat",
    target: '[data-tour="menu-chat"]',
    title: "Chat Jurídico",
    content:
      "Converse com nossa IA especializada em direito brasileiro. Tire dúvidas, peça análises e obtenha orientações jurídicas.",
    placement: "right",
    spotlightPadding: 4,
  },
  {
    id: "historico",
    target: '[data-tour="menu-historico"]',
    title: "Histórico de Análises",
    content:
      "Acesse todas as suas análises anteriores organizadas por data. Nunca perca uma consulta importante.",
    placement: "right",
    spotlightPadding: 4,
  },
  {
    id: "relatorios",
    target: '[data-tour="menu-relatorios"]',
    title: "Relatórios",
    content:
      "Gere relatórios detalhados das suas análises em PDF para compartilhar com clientes ou arquivar.",
    placement: "right",
    spotlightPadding: 4,
  },
  {
    id: "configuracoes",
    target: '[data-tour="menu-configuracoes"]',
    title: "Configurações",
    content:
      "Personalize sua experiência, gerencie seu plano, altere dados do perfil e configure notificações.",
    placement: "right",
    spotlightPadding: 4,
  },
  {
    id: "chat-input",
    target: '[data-tour="chat-input"]',
    title: "Faça sua primeira consulta",
    content:
      'Digite sua dúvida jurídica aqui e pressione Enter ou clique no botão enviar. Exemplo: "Quais são os requisitos para usucapião?"',
    placement: "top",
    spotlightPadding: 8,
  },
];

const STORAGE_KEYS = {
  tourCompleted: "juriscan_tour_completed",
  welcomeShown: "juriscan_welcome_shown",
};

interface TourProviderProps {
  children: ReactNode;
}

// Rotas onde o tour NÃO deve aparecer (páginas de autenticação)
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function TourProvider({ children }: TourProviderProps) {
  const pathname = usePathname();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Verificar autenticação e carregar estado do localStorage
  useEffect(() => {
    const checkAuthAndInitialize = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      const isLoggedIn = !!session?.user;

      const tourCompleted = localStorage.getItem(STORAGE_KEYS.tourCompleted);
      const welcomeShown = localStorage.getItem(STORAGE_KEYS.welcomeShown);

      setHasCompletedTour(tourCompleted === "true");

      // Mostrar welcome modal apenas se:
      // 1. Nunca foi mostrado
      // 2. Usuário está logado
      // 3. Não está em uma rota de autenticação
      const isAuthRoute = AUTH_ROUTES.includes(pathname);
      if (!welcomeShown && isLoggedIn && !isAuthRoute) {
        setIsWelcomeModalOpen(true);
      }

      setIsInitialized(true);
    };

    checkAuthAndInitialize();
  }, [pathname]);

  const openWelcomeModal = useCallback(() => {
    setIsWelcomeModalOpen(true);
  }, []);

  const closeWelcomeModal = useCallback(() => {
    setIsWelcomeModalOpen(false);
    localStorage.setItem(STORAGE_KEYS.welcomeShown, "true");
  }, []);

  const startTour = useCallback(() => {
    setIsWelcomeModalOpen(false);
    localStorage.setItem(STORAGE_KEYS.welcomeShown, "true");
    setCurrentStepIndex(0);
    setIsTourActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    localStorage.setItem(STORAGE_KEYS.tourCompleted, "true");
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTour();
    }
  }, [currentStepIndex, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index);
    }
  }, []);

  const skipTour = useCallback(() => {
    endTour();
  }, [endTour]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.tourCompleted);
    localStorage.removeItem(STORAGE_KEYS.welcomeShown);
    setHasCompletedTour(false);
    setCurrentStepIndex(0);
    setIsWelcomeModalOpen(true);
  }, []);

  const currentStep = isTourActive ? TOUR_STEPS[currentStepIndex] : null;
  const totalSteps = TOUR_STEPS.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Não renderizar até inicializar para evitar flash
  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <TourContext.Provider
      value={{
        isWelcomeModalOpen,
        isTourActive,
        currentStepIndex,
        hasCompletedTour,
        openWelcomeModal,
        closeWelcomeModal,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep,
        skipTour,
        resetTour,
        steps: TOUR_STEPS,
        currentStep,
        totalSteps,
        isFirstStep,
        isLastStep,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

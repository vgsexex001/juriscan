"use client";

import { useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TourContext, TourStep, DrawerControl } from "./TourContext";
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
    requiresDrawer: true,
  },
  {
    id: "credits",
    target: '[data-tour="credits"]',
    title: "Seus Créditos",
    content:
      "Acompanhe seu saldo de créditos aqui. Cada análise ou consulta ao chat consome créditos do seu plano.",
    placement: "right",
    spotlightPadding: 4,
    requiresDrawer: true,
  },
  {
    id: "dashboard",
    target: '[data-tour="menu-dashboard"]',
    title: "Dashboard",
    content:
      "Visualize um resumo das suas atividades, métricas de uso e análises recentes em um só lugar.",
    placement: "right",
    spotlightPadding: 4,
    requiresDrawer: true,
  },
  {
    id: "chat",
    target: '[data-tour="menu-chat"]',
    title: "Chat Jurídico",
    content:
      "Converse com nossa IA especializada em direito brasileiro. Tire dúvidas, peça análises e obtenha orientações jurídicas.",
    placement: "right",
    spotlightPadding: 4,
    requiresDrawer: true,
  },
  {
    id: "historico",
    target: '[data-tour="menu-historico"]',
    title: "Histórico de Análises",
    content:
      "Acesse todas as suas análises anteriores organizadas por data. Nunca perca uma consulta importante.",
    placement: "right",
    spotlightPadding: 4,
    requiresDrawer: true,
  },
  {
    id: "relatorios",
    target: '[data-tour="menu-relatorios"]',
    title: "Relatórios",
    content:
      "Gere relatórios detalhados das suas análises em PDF para compartilhar com clientes ou arquivar.",
    placement: "right",
    spotlightPadding: 4,
    requiresDrawer: true,
  },
  {
    id: "configuracoes",
    target: '[data-tour="menu-configuracoes"]',
    title: "Configurações",
    content:
      "Personalize sua experiência, gerencie seu plano, altere dados do perfil e configure notificações.",
    placement: "right",
    spotlightPadding: 4,
    requiresDrawer: true,
  },
  {
    id: "chat-input",
    target: '[data-tour="chat-input"]',
    title: "Faça sua primeira consulta",
    content:
      'Digite sua dúvida jurídica aqui e pressione Enter ou clique no botão enviar. Exemplo: "Quais são os requisitos para usucapião?"',
    placement: "top",
    spotlightPadding: 8,
    navigateTo: "/chat",
  },
];

const STORAGE_KEYS = {
  tourCompleted: "juriscan_tour_completed",
};

interface TourProviderProps {
  children: ReactNode;
}

// Rotas onde o tour NÃO deve aparecer (páginas de autenticação)
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

// Helper to check if we're on mobile (matches useMediaQuery breakpoint)
function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 1024;
}

export function TourProvider({ children }: TourProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(false); // CORRIGIDO: começa como false
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const drawerControlRef = useRef<DrawerControl | null>(null);

  const registerDrawerControl = useCallback((control: DrawerControl) => {
    drawerControlRef.current = control;
  }, []);

  const unregisterDrawerControl = useCallback(() => {
    drawerControlRef.current = null;
  }, []);

  // Função para verificar se o tour foi completado (com suporte a userId)
  const checkTourCompleted = useCallback((userId: string | null): boolean => {
    if (!userId) return false;

    // Verificar com userId específico
    const userTourCompleted = localStorage.getItem(`${STORAGE_KEYS.tourCompleted}_${userId}`);
    if (userTourCompleted === "true") {
      return true;
    }

    // Fallback: verificar formato antigo e migrar
    const legacyTourCompleted = localStorage.getItem(STORAGE_KEYS.tourCompleted);
    if (legacyTourCompleted === "true") {
      // Migrar para o novo formato
      localStorage.setItem(`${STORAGE_KEYS.tourCompleted}_${userId}`, "true");
      return true;
    }

    return false;
  }, []);

  // Função para verificar se termos foram aceitos
  const checkTermsAccepted = useCallback((userId: string | null): boolean => {
    // Verificar formato com userId
    if (userId) {
      const userTerms = localStorage.getItem(`termsAccepted_${userId}`);
      if (userTerms === "true") return true;
    }

    // Fallback: verificar formato antigo
    const legacyTerms = localStorage.getItem("termsAccepted");
    return legacyTerms === "true";
  }, []);

  // Função para verificar se deve iniciar o tour
  const checkAndStartTour = useCallback((isLoggedIn: boolean, userId: string | null) => {
    const tourCompleted = checkTourCompleted(userId);
    const termsAccepted = checkTermsAccepted(userId);

    setHasCompletedTour(tourCompleted);
    setCurrentUserId(userId);

    // Iniciar tour diretamente se:
    // 1. Tour nunca foi completado
    // 2. Usuário está logado
    // 3. Não está em uma rota de autenticação
    // 4. Termos já foram aceitos (para não conflitar com WelcomeModal)
    // Usar window.location.pathname para evitar closure stale
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
    const isAuthRoute = AUTH_ROUTES.includes(currentPath);
    if (!tourCompleted && isLoggedIn && !isAuthRoute && termsAccepted) {
      setCurrentStepIndex(0);
      setIsTourActive(true);
    }

    setIsInitialized(true);
  }, [pathname, checkTourCompleted, checkTermsAccepted]);

  // Verificar autenticação inicial e escutar mudanças
  useEffect(() => {
    const supabase = getSupabaseClient();
    let isMounted = true;

    // Verificar sessão inicial
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        checkAndStartTour(!!session?.user, session?.user?.id || null);
      }
    };

    checkInitialSession();

    // Escutar mudanças de autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        // Quando usuário faz login, verificar se deve iniciar tour
        if (event === "SIGNED_IN" && session?.user) {
          const userId = session.user.id;
          const tourCompleted = checkTourCompleted(userId);
          const termsAccepted = checkTermsAccepted(userId);
          // Usar window.location.pathname para evitar closure stale
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
          const isAuthRoute = AUTH_ROUTES.includes(currentPath);

          setCurrentUserId(userId);
          setHasCompletedTour(tourCompleted);

          // Só iniciar tour automaticamente se termos já foram aceitos
          // Caso contrário, o WelcomeModal irá iniciar o tour após aceite
          if (!tourCompleted && !isAuthRoute && termsAccepted) {
            setTimeout(() => {
              if (isMounted) {
                setCurrentStepIndex(0);
                setIsTourActive(true);
              }
            }, 500);
          }
        } else if (event === "SIGNED_OUT") {
          setCurrentUserId(null);
          setHasCompletedTour(false);
          setIsTourActive(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, checkAndStartTour, checkTourCompleted, checkTermsAccepted]);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsTourActive(true);
  }, []);

  const endTour = useCallback(() => {
    // Close drawer if it was opened by the tour
    if (isMobileViewport() && drawerControlRef.current) {
      drawerControlRef.current.close();
    }

    setIsTourActive(false);
    setHasCompletedTour(true);

    // Salvar com userId se disponível
    if (currentUserId) {
      localStorage.setItem(`${STORAGE_KEYS.tourCompleted}_${currentUserId}`, "true");
    }
  }, [currentUserId]);

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
    // Remover com userId se disponível
    if (currentUserId) {
      localStorage.removeItem(`${STORAGE_KEYS.tourCompleted}_${currentUserId}`);
    }
    localStorage.removeItem(STORAGE_KEYS.tourCompleted);
    setHasCompletedTour(false);
    setCurrentStepIndex(0);
    setIsTourActive(true);
  }, [currentUserId]);

  // Sync drawer state with current tour step on mobile
  useEffect(() => {
    if (!isTourActive || !drawerControlRef.current) return;
    if (!isMobileViewport()) return;

    const step = TOUR_STEPS[currentStepIndex];
    if (step?.requiresDrawer) {
      drawerControlRef.current.open();
    } else {
      drawerControlRef.current.close();
    }
  }, [isTourActive, currentStepIndex]);

  // Navigate to the required page when a step has navigateTo
  useEffect(() => {
    if (!isTourActive) return;

    const step = TOUR_STEPS[currentStepIndex];
    if (!step?.navigateTo) return;

    // Use window.location.pathname for freshest value
    const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname;
    if (currentPath === step.navigateTo) return;

    router.push(step.navigateTo);
  }, [isTourActive, currentStepIndex, pathname, router]);

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
        isTourActive,
        currentStepIndex,
        hasCompletedTour,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep,
        skipTour,
        resetTour,
        registerDrawerControl,
        unregisterDrawerControl,
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

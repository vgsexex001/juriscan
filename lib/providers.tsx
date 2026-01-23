"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TourProvider } from "@/components/Tour";
import { Tour } from "@/components/Tour";
import WelcomeModal from "@/components/WelcomeModal";
import { getSupabaseClient } from "@/lib/supabase/client";

interface ProvidersProps {
  children: ReactNode;
}

// Rotas onde o modal de termos NÃO deve aparecer (páginas de autenticação)
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/auth/callback"];

// Wrapper que garante aceite de termos em qualquer página autenticada
function TermsGate({ children }: { children: ReactNode }) {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthAndTerms = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
      const termsAccepted = localStorage.getItem("termsAccepted");

      setIsAuthenticated(!!session?.user);

      // Mostrar modal se: logado + não aceitou termos + não em rota de auth
      if (session?.user && !termsAccepted && !isAuthRoute) {
        setShowTermsModal(true);
      } else {
        setShowTermsModal(false);
      }

      setIsChecking(false);
    };

    checkAuthAndTerms();

    // Também escutar mudanças de autenticação
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
        const termsAccepted = localStorage.getItem("termsAccepted");

        setIsAuthenticated(!!session?.user);

        if (event === "SIGNED_IN" && session?.user && !termsAccepted && !isAuthRoute) {
          setShowTermsModal(true);
        } else if (event === "SIGNED_OUT") {
          setShowTermsModal(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  const handleAcceptTerms = () => {
    setShowTermsModal(false);
  };

  // Não renderizar até verificar autenticação
  if (isChecking) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {showTermsModal && isAuthenticated && <WelcomeModal onAccept={handleAcceptTerms} />}
    </>
  );
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TourProvider>
        <TermsGate>
          {children}
        </TermsGate>
        <Tour />
      </TourProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { LoginCredentials, RegisterData } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signIn = async ({ email, password }: LoginCredentials) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    setUser(data.user);
    setLoading(false);
    router.push("/dashboard");
    router.refresh();

    return { error: null };
  };

  const signUp = async ({ email, password, name, oab }: RegisterData) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          oab,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    // If email confirmation is required
    if (data.user && !data.session) {
      setLoading(false);
      return {
        error: null,
        message: "Verifique seu email para confirmar o cadastro.",
      };
    }

    setUser(data.user);
    setLoading(false);
    router.push("/dashboard");
    router.refresh();

    return { error: null };
  };

  const signOut = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    setUser(null);
    setLoading(false);
    router.push("/login");
    router.refresh();

    return { error: null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null, message: "Email de recuperação enviado." };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null, message: "Senha atualizada com sucesso." };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
  };
}

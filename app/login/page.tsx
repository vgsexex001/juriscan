"use client";

import { useState } from "react";
import { Scale, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    const result = await signIn({ email, password });

    if (result.error) {
      // Traduzir mensagens de erro comuns
      if (result.error.includes("Invalid login credentials")) {
        setError("E-mail ou senha incorretos.");
      } else if (result.error.includes("Email not confirmed")) {
        setError("Por favor, confirme seu e-mail antes de fazer login.");
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Hero */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12"
        style={{
          background: "linear-gradient(135deg, #1C398E 0%, #193CB8 50%, #162456 100%)",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo */}
          <Scale className="w-20 h-20 text-white mb-6" strokeWidth={1.5} />

          {/* Brand Name */}
          <h1
            className="text-white font-normal tracking-wide"
            style={{
              fontSize: "48px",
              letterSpacing: "0.35px",
            }}
          >
            Juriscan
          </h1>

          {/* Tagline */}
          <p
            className="text-light-blue mt-4 text-center"
            style={{
              fontSize: "20px",
              lineHeight: "28px",
            }}
          >
            Plataforma de Jurimetria, IA Jurídica e Automação
          </p>

          {/* Features */}
          <ul className="mt-[76px] space-y-4">
            {[
              "Análise preditiva com IA conversacional",
              "Jurimetria avançada por tribunal, juiz e relator",
              "Relatórios automáticos e execução integrada",
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-feature-blue flex-shrink-0" />
                <span
                  className="text-light-blue"
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                  }}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-6 lg:px-11">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div>
            <h2
              className="text-text-dark"
              style={{
                fontSize: "30px",
                lineHeight: "36px",
                letterSpacing: "0.4px",
              }}
            >
              Bem-vindo de volta
            </h2>
            <p
              className="text-text-gray mt-2"
              style={{
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Entre para continuar sua análise
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-text-label"
                style={{
                  fontSize: "14px",
                  lineHeight: "20px",
                }}
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={loading}
                className="mt-1 w-full h-[50px] px-4 border border-border rounded-input text-text-input focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-text-label"
                style={{
                  fontSize: "14px",
                  lineHeight: "20px",
                }}
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="mt-1 w-full h-[50px] px-4 border border-border rounded-input text-text-input focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              />
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between">
              {/* Remember Me */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span
                  className="text-text-gray"
                  style={{
                    fontSize: "14px",
                    lineHeight: "20px",
                  }}
                >
                  Lembrar-me
                </span>
              </label>

              {/* Forgot Password */}
              <Link
                href="/forgot-password"
                className="text-link hover:underline"
                style={{
                  fontSize: "14px",
                  lineHeight: "20px",
                }}
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-button transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Footer */}
          <div
            className="mt-8 text-center"
            style={{
              fontSize: "16px",
              lineHeight: "24px",
            }}
          >
            <span className="text-text-gray">Não tem uma conta? </span>
            <Link href="/register" className="text-link hover:underline">
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

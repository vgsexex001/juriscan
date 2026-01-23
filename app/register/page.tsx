"use client";

import { useState } from "react";
import { Scale, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signUp, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validações
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    const result = await signUp({ email, password, name: fullName });

    if (result.error) {
      // Traduzir mensagens de erro comuns
      if (result.error.includes("already registered")) {
        setError("Este e-mail já está cadastrado.");
      } else if (result.error.includes("invalid email")) {
        setError("E-mail inválido.");
      } else if (result.error.includes("password")) {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError(result.error);
      }
    } else if (result.message) {
      // Email de confirmação enviado
      setSuccess(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Register Form */}
      <div className="w-full lg:w-1/2 bg-white flex justify-center px-6 lg:px-10 pt-[67.5px]">
        <div className="w-full max-w-[448px]">
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
              Criar conta
            </h2>
            <p
              className="text-text-gray mt-2"
              style={{
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Comece sua análise jurídica com IA
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Full Name Field */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-text-label"
                style={{
                  fontSize: "14px",
                  lineHeight: "20px",
                }}
              >
                Nome completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
                disabled={loading || !!success}
                className="mt-1 w-full h-[50px] px-4 border border-border rounded-input text-text-input focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              />
            </div>

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
                disabled={loading || !!success}
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
                disabled={loading || !!success}
                className="mt-1 w-full h-[50px] px-4 border border-border rounded-input text-text-input focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-text-label"
                style={{
                  fontSize: "14px",
                  lineHeight: "20px",
                }}
              >
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading || !!success}
                className="mt-1 w-full h-[50px] px-4 border border-border rounded-input text-text-input focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-button transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          {/* Footer - Login Link */}
          <div
            className="mt-6 text-center"
            style={{
              fontSize: "16px",
              lineHeight: "24px",
            }}
          >
            <span className="text-text-gray">Já tem uma conta? </span>
            <Link href="/login" className="text-link hover:underline">
              Faça login
            </Link>
          </div>

          {/* Terms Text */}
          <p
            className="mt-6 text-center text-text-muted"
            style={{
              fontSize: "12px",
              lineHeight: "16px",
            }}
          >
            Ao criar uma conta, você concorda com nossos{" "}
            <Link href="/terms" className="text-link hover:underline">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link href="/privacy" className="text-link hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Hero */}
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
          <Scale className="w-20 h-20 text-white" strokeWidth={1.5} />

          {/* Brand Name */}
          <h1
            className="text-white font-normal tracking-wide mt-6"
            style={{
              fontSize: "48px",
              lineHeight: "48px",
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
          <ul className="mt-14 space-y-4">
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
    </div>
  );
}

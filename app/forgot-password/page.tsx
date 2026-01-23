"use client";

import { useState } from "react";
import { Scale, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Por favor, informe seu e-mail.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);

    if (result.error) {
      if (result.error.includes("rate limit")) {
        setError("Muitas tentativas. Aguarde alguns minutos.");
      } else {
        setError(result.error);
      }
    } else {
      setSuccess("Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-6 lg:px-11">
        <div className="w-full max-w-[400px]">
          {/* Back Link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-text-gray hover:text-text-dark transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar ao login</span>
          </Link>

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
              Esqueceu a senha?
            </h2>
            <p
              className="text-text-gray mt-2"
              style={{
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Informe seu e-mail para receber instruções
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
                  Enviando...
                </>
              ) : (
                "Enviar instruções"
              )}
            </button>
          </form>
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
        </div>
      </div>
    </div>
  );
}

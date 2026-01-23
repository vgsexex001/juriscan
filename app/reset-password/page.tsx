"use client";

import { useState, useEffect } from "react";
import { Scale, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const router = useRouter();

  // Verificar se há um código de recuperação na URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");

    if (error) {
      setError(errorDescription || "Link de recuperação inválido ou expirado.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !confirmPassword) {
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

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      if (result.error.includes("same as")) {
        setError("A nova senha deve ser diferente da senha atual.");
      } else {
        setError(result.error);
      }
    } else {
      setSuccess("Senha atualizada com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form */}
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
              Redefinir senha
            </h2>
            <p
              className="text-text-gray mt-2"
              style={{
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Digite sua nova senha
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
                Nova senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading || !!success}
                className="mt-1 w-full h-[50px] px-4 bg-white border border-border rounded-input text-text-input placeholder:text-gray-400 focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading || !!success}
                className="mt-1 w-full h-[50px] px-4 bg-white border border-border rounded-input text-text-input placeholder:text-gray-400 focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                  Atualizando...
                </>
              ) : (
                "Atualizar senha"
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

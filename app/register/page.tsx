"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Loader2, AlertCircle, CheckCircle, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthLayout from "@/components/Auth/AuthLayout";
import AuthInput from "@/components/Auth/AuthInput";
import PasswordStrength from "@/components/Auth/PasswordStrength";
import SocialButton from "@/components/Auth/SocialButton";
import { cn } from "@/lib/utils/cn";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { signUp, loading } = useAuth();

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Nome e obrigatorio";
    if (!email) errors.email = "E-mail e obrigatorio";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "E-mail invalido";
    if (!password) errors.password = "Senha e obrigatoria";
    else if (password.length < 6) errors.password = "Minimo 6 caracteres";
    if (password !== confirmPassword) errors.confirmPassword = "As senhas nao coincidem";
    if (!acceptTerms) errors.acceptTerms = "Voce deve aceitar os termos";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validate()) return;

    const result = await signUp({ email, password, name: fullName });

    if (result.error) {
      if (result.error.includes("already registered")) {
        setError("Este e-mail ja esta cadastrado.");
      } else if (result.error.includes("invalid email")) {
        setError("E-mail invalido.");
      } else if (result.error.includes("password")) {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else if (
        result.error.toLowerCase().includes("rate limit") ||
        result.error.toLowerCase().includes("email rate limit") ||
        result.error.includes("over_email_send_rate_limit")
      ) {
        setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        setError(result.error);
      }
    } else if (result.message) {
      setSuccess(result.message);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    console.log("Register com", provider);
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Comece sua analise juridica com IA"
      showBackButton
      onBack={() => router.push("/login")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Desktop title */}
        <div className="hidden lg:block text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
          <p className="mt-2 text-gray-500">Comece sua jornada com analise juridica avancada</p>
        </div>

        {/* General error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Name */}
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <AuthInput
            label="Nome completo"
            type="text"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); clearFieldError("fullName"); }}
            icon={<User className="w-5 h-5" />}
            error={fieldErrors.fullName}
            autoComplete="name"
            disabled={loading || !!success}
          />
        </div>

        {/* Email */}
        <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <AuthInput
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
            icon={<Mail className="w-5 h-5" />}
            error={fieldErrors.email}
            autoComplete="email"
            disabled={loading || !!success}
          />
        </div>

        {/* Password */}
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <AuthInput
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
            icon={<Lock className="w-5 h-5" />}
            error={fieldErrors.password}
            showPasswordToggle
            autoComplete="new-password"
            disabled={loading || !!success}
          />
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password */}
        <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <AuthInput
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
            icon={<Lock className="w-5 h-5" />}
            error={fieldErrors.confirmPassword}
            success={confirmPassword.length > 0 && password === confirmPassword}
            showPasswordToggle
            autoComplete="new-password"
            disabled={loading || !!success}
          />
        </div>

        {/* Terms */}
        <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => { setAcceptTerms(e.target.checked); clearFieldError("acceptTerms"); }}
                className="sr-only"
                disabled={loading || !!success}
              />
              <div
                className={cn(
                  "w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
                  acceptTerms ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white",
                  fieldErrors.acceptTerms && "border-red-500"
                )}
              >
                {acceptTerms && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <span className="text-sm text-gray-600">
              Li e aceito os{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Politica de Privacidade
              </Link>
            </span>
          </label>
          {fieldErrors.acceptTerms && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.acceptTerms}</p>
          )}
        </div>

        {/* Submit */}
        <div className="animate-fade-in-up pt-2" style={{ animationDelay: "350ms" }}>
          <button
            type="submit"
            disabled={loading || !!success}
            className={cn(
              "w-full h-14 rounded-xl font-semibold text-white",
              "bg-gradient-to-r from-blue-600 to-blue-700",
              "hover:from-blue-700 hover:to-blue-800",
              "transition-all duration-200",
              "hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25",
              "active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "flex items-center justify-center gap-2"
            )}
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
        </div>

        {/* Divider */}
        <div className="relative flex items-center gap-4 py-2 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">ou</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <SocialButton provider="google" onClick={() => handleSocialLogin("google")} disabled={loading || !!success} />
          <SocialButton provider="apple" onClick={() => handleSocialLogin("apple")} disabled={loading || !!success} />
        </div>

        {/* Login link */}
        <p className="text-center text-gray-600 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          Ja tem uma conta?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Fazer login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

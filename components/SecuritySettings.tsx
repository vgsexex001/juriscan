"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  AlertTriangle,
  Monitor,
  Smartphone,
  Check,
} from "lucide-react";

interface Session {
  id: string;
  device: string;
  deviceType: "desktop" | "mobile";
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const mockSessions: Session[] = [
  {
    id: "1",
    device: "Chrome - Windows",
    deviceType: "desktop",
    location: "São Paulo, SP",
    lastActive: "Agora",
    isCurrent: true,
  },
  {
    id: "2",
    device: "Safari - iPhone",
    deviceType: "mobile",
    location: "São Paulo, SP",
    lastActive: "Há 2 horas",
    isCurrent: false,
  },
  {
    id: "3",
    device: "Firefox - MacOS",
    deviceType: "desktop",
    location: "Rio de Janeiro, RJ",
    lastActive: "Há 1 dia",
    isCurrent: false,
  },
];

const mockApiKey = "jsk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";

interface SecuritySettingsProps {
  onPasswordChange?: (data: {
    currentPassword: string;
    newPassword: string;
  }) => void;
  onRevokeApiKey?: () => void;
  onEndSession?: (sessionId: string) => void;
}

export default function SecuritySettings({
  onPasswordChange,
  onRevokeApiKey,
  onEndSession,
}: SecuritySettingsProps) {
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // API Key state
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>(mockSessions);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }

    setIsChangingPassword(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onPasswordChange?.({ currentPassword, newPassword });

    // Reset form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsChangingPassword(false);
  };

  const handleCopyApiKey = async () => {
    await navigator.clipboard.writeText(mockApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeApiKey = () => {
    if (
      confirm(
        "Tem certeza que deseja revogar esta chave API? Isso invalidará todas as integrações existentes."
      )
    ) {
      onRevokeApiKey?.();
    }
  };

  const handleEndSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    onEndSession?.(sessionId);
  };

  const maskedApiKey = showApiKey
    ? mockApiKey
    : mockApiKey.slice(0, 8) + "••••••••••••••••••••••••";

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-gray-800">
        Segurança da Conta
      </h2>

      {/* Password Section */}
      <div className="p-5 bg-gray-50 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Senha e Autenticação
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm text-gray-600 mb-1.5"
            >
              Senha atual
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm text-gray-600 mb-1.5"
            >
              Nova senha
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm text-gray-600 mb-1.5"
            >
              Confirmar nova senha
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isChangingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isChangingPassword ? "Atualizando..." : "Atualizar senha"}
          </button>
        </form>
      </div>

      {/* API Key Section */}
      <div className="p-5 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Chave API</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Use esta chave para integrações externas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
          <code className="flex-1 text-sm text-gray-700 font-mono truncate">
            {maskedApiKey}
          </code>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={showApiKey ? "Ocultar chave" : "Mostrar chave"}
            >
              {showApiKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleCopyApiKey}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copiar chave"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleRevokeApiKey}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Revogar chave
        </button>
      </div>

      {/* Sessions Section */}
      <div className="p-5 bg-gray-50 rounded-xl">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-800">
            Sessões Ativas
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Gerencie seus dispositivos conectados
          </p>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {session.deviceType === "desktop" ? (
                    <Monitor className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800">
                      {session.device}
                    </p>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Sessão atual
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => handleEndSession(session.id)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Encerrar
                </button>
              )}
            </div>
          ))}
        </div>

        {sessions.filter((s) => !s.isCurrent).length > 0 && (
          <button
            onClick={() => {
              setSessions((prev) => prev.filter((s) => s.isCurrent));
              sessions
                .filter((s) => !s.isCurrent)
                .forEach((s) => onEndSession?.(s.id));
            }}
            className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Encerrar todas as outras sessões
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Building, Save, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface ProfileFormData {
  name: string;
  oab: string;
  email: string;
  phone: string;
  law_firm: string;
  practice_areas: string;
}

export default function ProfileSettings() {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    oab: "",
    email: "",
    phone: "",
    law_firm: "",
    practice_areas: "",
  });
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        oab: profile.oab || "",
        email: profile.email || "",
        phone: profile.phone || "",
        law_firm: profile.law_firm || "",
        practice_areas: profile.practice_areas?.join(", ") || "",
      });
    }
  }, [profile]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);

    try {
      await updateProfile({
        name: formData.name,
        oab: formData.oab || undefined,
        phone: formData.phone || undefined,
        law_firm: formData.law_firm || undefined,
        practice_areas: formData.practice_areas
          ? formData.practice_areas.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      });
      setSaveMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao salvar perfil",
      });
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        oab: profile.oab || "",
        email: profile.email || "",
        phone: profile.phone || "",
        law_firm: profile.law_firm || "",
        practice_areas: profile.practice_areas?.join(", ") || "",
      });
    }
    setSaveMessage(null);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Informações Pessoais
      </h2>

      {/* Avatar Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-semibold">
          {getInitials(formData.name || "U")}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{formData.name || "Usuário"}</p>
          <p className="text-sm text-gray-500">{formData.email}</p>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            saveMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} aria-label="Formulário de perfil">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nome Completo */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Seu nome completo"
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded-[10px] text-sm text-gray-800 focus:outline-none focus:border-primary"
            />
          </div>

          {/* OAB */}
          <div>
            <label
              htmlFor="oab"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              OAB
            </label>
            <input
              id="oab"
              type="text"
              value={formData.oab}
              onChange={(e) => handleChange("oab", e.target.value)}
              placeholder="UF 000.000"
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded-[10px] text-sm text-gray-800 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-[10px] text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              O e-mail não pode ser alterado
            </p>
          </div>

          {/* Telefone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full h-11 pl-11 pr-4 bg-white border border-gray-200 rounded-[10px] text-sm text-gray-800 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Escritório */}
          <div className="md:col-span-2">
            <label
              htmlFor="law_firm"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Escritório/Empresa
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                id="law_firm"
                type="text"
                value={formData.law_firm}
                onChange={(e) => handleChange("law_firm", e.target.value)}
                placeholder="Nome do escritório"
                className="w-full h-11 pl-11 pr-4 bg-white border border-gray-200 rounded-[10px] text-sm text-gray-800 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Áreas de Atuação */}
          <div className="md:col-span-2">
            <label
              htmlFor="practice_areas"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Áreas de atuação
            </label>
            <input
              id="practice_areas"
              type="text"
              value={formData.practice_areas}
              onChange={(e) => handleChange("practice_areas", e.target.value)}
              placeholder="Ex: Cível, Trabalhista, Tributário"
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded-[10px] text-sm text-gray-800 focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Separe as áreas por vírgula
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-gray-300 rounded-lg text-sm font-medium text-white transition-colors"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isUpdating ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}

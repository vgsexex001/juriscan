"use client";

import { useState } from "react";
import { Mail, Phone, Building, Save } from "lucide-react";

interface ProfileData {
  nomeCompleto: string;
  oab: string;
  email: string;
  telefone: string;
  escritorio: string;
  areasAtuacao: string;
}

interface ProfileSettingsProps {
  initialData?: ProfileData;
  onSave?: (data: ProfileData) => void;
  onCancel?: () => void;
}

const defaultData: ProfileData = {
  nomeCompleto: "Advogado Demo",
  oab: "SP 123.456",
  email: "advogado@email.com",
  telefone: "(11) 99999-9999",
  escritorio: "Silva & Associados Advocacia",
  areasAtuacao: "Cível, Trabalhista, Tributário",
};

export default function ProfileSettings({
  initialData = defaultData,
  onSave,
  onCancel,
}: ProfileSettingsProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSave?.(formData);
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData(initialData);
    onCancel?.();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Informações Pessoais
      </h2>

      {/* Avatar Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-semibold">
          AD
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Alterar foto
          </button>
          <button className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
            Remover
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} aria-label="Formulário de perfil">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nome Completo */}
          <div>
            <label
              htmlFor="nomeCompleto"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nome completo
            </label>
            <input
              id="nomeCompleto"
              type="text"
              value={formData.nomeCompleto}
              onChange={(e) => handleChange("nomeCompleto", e.target.value)}
              placeholder="Seu nome completo"
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded-[10px] text-sm text-gray-800 focus:outline-none focus:border-blue-500"
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
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded-[10px] text-sm text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Email */}
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
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-11 pl-11 pr-4 bg-white border border-gray-200 rounded-[10px] text-sm text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label
              htmlFor="telefone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full h-11 pl-11 pr-4 bg-white border border-gray-200 rounded-[10px] text-sm text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Escritório */}
          <div className="md:col-span-2">
            <label
              htmlFor="escritorio"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Escritório/Empresa
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                id="escritorio"
                type="text"
                value={formData.escritorio}
                onChange={(e) => handleChange("escritorio", e.target.value)}
                placeholder="Nome do escritório"
                className="w-full h-11 pl-11 pr-4 bg-white border border-gray-200 rounded-[10px] text-sm text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Áreas de Atuação */}
          <div className="md:col-span-2">
            <label
              htmlFor="areasAtuacao"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Áreas de atuação
            </label>
            <input
              id="areasAtuacao"
              type="text"
              value={formData.areasAtuacao}
              onChange={(e) => handleChange("areasAtuacao", e.target.value)}
              placeholder="Ex: Cível, Trabalhista, Tributário"
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded-[10px] text-sm text-gray-800 focus:outline-none focus:border-blue-500"
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
            onClick={handleCancel}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-gray-300 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}

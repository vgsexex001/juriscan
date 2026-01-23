import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Juriscan - Plataforma Jurídica Inteligente",
  description: "Plataforma de Jurimetria, IA Jurídica e Automação para Advogados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-inter antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

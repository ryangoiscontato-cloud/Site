import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ultralight — Sistema de Estoque",
  description: "Sistema de controle de estoque Ultralight",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-gray-100">{children}</body>
    </html>
  );
}

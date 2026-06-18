import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "ULTRALIGHT — Gestão de Produção",
  description: "Gestão de Produção · Ultralight",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'ULTRALIGHT',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if (navigator.userAgent.includes('Electron')) document.documentElement.classList.add('electron-app');`,
          }}
        />
      </head>
      <body className="min-h-full bg-gray-100">{children}</body>
    </html>
  );
}

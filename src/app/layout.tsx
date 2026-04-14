import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastClientWrapper } from "@/components/toast-client-wrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Zapfome",
  description:
    "Painel do lojista Zapfome — gerencie pedidos, cardápio e configurações do seu restaurante.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ToastClientWrapper>{children}</ToastClientWrapper>
      </body>
    </html>
  );
}

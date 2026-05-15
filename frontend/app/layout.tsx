import type { Metadata } from "next";
import "./globals.css";
import GoogleProvider from "@/components/GoogleProvider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "FitAI",
  description: "Continue de onde parou no seu treino.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body>
        <GoogleProvider>
          <AuthProvider>{children}</AuthProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}

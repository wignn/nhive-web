import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "NovelHive — Read Novels Online",
  description: "Your premium destination for reading translated novels online. Browse thousands of novels across Fantasy, Action, Romance, Isekai and more.",
  keywords: "novel, web novel, light novel, translated novel, read online, fantasy, isekai",
  openGraph: {
    title: "NovelHive — Read Novels Online",
    description: "Premium novel reading platform",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <ToastProvider>
            <Header />
            {children}
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}

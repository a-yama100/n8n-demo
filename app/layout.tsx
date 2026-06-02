import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://n8n-demo.phaiworks.com"),
  title: "n8n Automation Demo — AI Intake & SEO Content Workflows",
  description:
    "A live, interactive demo of two production-style n8n workflows: an AI agent that classifies inbound enquiries and writes them to a CRM + Slack, and a scheduled SEO content pipeline. Built by an IBM-certified AI engineer.",
  keywords: [
    "n8n",
    "n8n expert",
    "n8n automation",
    "workflow automation",
    "AI agent",
    "Next.js",
    "Supabase",
    "Slack automation",
    "SEO automation",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://n8n-demo.phaiworks.com/" },
  openGraph: {
    type: "website",
    url: "https://n8n-demo.phaiworks.com/",
    siteName: "PH AI Works — n8n Automation Demo",
    title: "n8n Automation Demo — AI Intake & SEO Content Workflows",
    description:
      "Two interactive n8n workflows you can run in the browser: AI enquiry intake (classify → Supabase → Slack) and a scheduled SEO content pipeline.",
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={
          geistSans.variable +
          " " +
          geistMono.variable +
          " antialiased min-h-screen flex flex-col"
        }
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

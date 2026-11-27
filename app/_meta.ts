import type { Metadata } from "next";
import { META, SITE_URL, type Lang } from "@/lib/content";

// ページの題名・説明・正規の URL・言語の対応（hreflang）・SNS の情報
export function pageMetadata(lang: Lang): Metadata {
  const m = META[lang];
  return {
    metadataBase: new URL(SITE_URL),
    title: m.title,
    description: m.description,
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
    alternates: {
      canonical: SITE_URL + m.path,
      languages: { ja: SITE_URL + "/", en: SITE_URL + "/en", "x-default": SITE_URL + "/" },
    },
    openGraph: {
      type: "website",
      url: SITE_URL + m.path,
      siteName: m.siteName,
      locale: lang === "ja" ? "ja_JP" : "en_US",
      title: m.title,
      description: m.ogDescription,
    },
    icons: { icon: "/favicon.svg" },
  };
}

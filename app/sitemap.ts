import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content";

// 検索エンジン向けのページ一覧（/sitemap.xml）。日本語と英語を対にする
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { ja: SITE_URL + "/", en: SITE_URL + "/en", "x-default": SITE_URL + "/" };
  return [
    { url: SITE_URL + "/", lastModified: new Date(), changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: SITE_URL + "/en", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9, alternates: { languages } },
  ];
}

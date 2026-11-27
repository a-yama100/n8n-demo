// Self-contained reproduction of the "AI Writer" + "SEO Meta" nodes in the content
// workflow. In production this is a scheduled n8n run that pulls trend/SERP data,
// asks an LLM to draft an article, then generates SEO metadata and publishes a
// WordPress draft. Here the structured output is produced deterministically from the
// topic so the demo runs instantly with no API key. The pipeline stages (schedule →
// fetch → write → meta → publish → report) mirror the real workflow.
// 日本語のページから呼んだとき（lang = "ja"）は、タイトル・説明・構成・報告を日本語で返す。
// 日本語の記事は語数ではなく文字数で分量を示す（word_count_target は文字数になる）。

import type { Lang } from "./content";

export type SeoInput = {
  topic: string;
  audience?: string;
};

export type SeoResult = {
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: "informational" | "commercial" | "transactional";
  seo_title: string;
  meta_description: string;
  slug: string;
  outline: { h2: string; note: string }[];
  intro_paragraph: string;
  internal_links: string[];
  featured_image_prompt: string;
  word_count_target: number;
  publish: { platform: string; status: string; url: string };
  report: { channels: string[]; summary: string };
};

const STOPWORDS = new Set([
  "the", "a", "an", "for", "and", "or", "to", "of", "in", "on", "with", "your", "you",
  "how", "what", "why", "is", "are", "best", "guide", "using", "use", "vs",
]);

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9ぁ-んァ-ヶ一-龠\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
}

function keywordTokens(topic: string): string[] {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9ぁ-んァ-ヶ一-龠\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

function detectIntent(topic: string): SeoResult["search_intent"] {
  const t = topic.toLowerCase();
  if (/\b(buy|price|pricing|cost|hire|service|agency|tool|software|cheap|best)\b/.test(t))
    return "commercial";
  if (/\b(download|signup|sign up|free trial|demo|template)\b/.test(t))
    return "transactional";
  return "informational";
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
}

export function generateSeoPlan(input: SeoInput, lang: Lang = "en"): SeoResult {
  if (lang === "ja") return generateSeoPlanJa(input);
  const topic = (input.topic || "").trim();
  const audience = (input.audience || "").trim();
  const tokens = keywordTokens(topic);
  const primary_keyword = topic.toLowerCase();

  const head = tokens.slice(0, 3).join(" ") || topic.toLowerCase();
  const secondary_keywords = [
    `${head} guide`,
    `how to ${head}`,
    `${head} best practices`,
    `${head} examples`,
    `${head} for ${audience || "small business"}`,
  ].map((k) => k.replace(/\s+/g, " ").trim());

  const search_intent = detectIntent(topic);

  const titled = topic.replace(/\b\w/g, (c) => c.toUpperCase());
  const seo_title = truncate(
    search_intent === "commercial"
      ? `${titled}: What It Costs and How to Choose (${new Date().getFullYear()})`
      : `${titled}: A Practical Guide for ${audience ? capitalize(audience) : "Teams"}`,
    60
  );

  const meta_description = truncate(
    `A practical, up-to-date look at ${primary_keyword}${
      audience ? ` for ${audience}` : ""
    } — what it is, when it pays off, and the exact steps to get started. Real examples, no fluff.`,
    155
  );

  const slug = slugify(topic) || "untitled-post";

  const outline: SeoResult["outline"] = [
    { h2: `What is ${titled}?`, note: "Plain-language definition + why it matters now" },
    { h2: `When ${titled} is worth it`, note: "Use-cases, ROI signals, who it's not for" },
    { h2: `How it works, step by step`, note: "Concrete walkthrough with a real example" },
    { h2: `Common mistakes to avoid`, note: "Pitfalls pulled from SERP 'People also ask'" },
    { h2: `Tools and next steps`, note: "Comparison + a clear call to action" },
  ];

  const intro_paragraph =
    `If you've been hearing about ${primary_keyword} but aren't sure where it fits, ` +
    `this guide cuts to the point. We'll cover what ${head} actually is, when it's worth ` +
    `the effort${audience ? ` for ${audience}` : ""}, and the exact steps to get a first ` +
    `result — with examples you can copy rather than vague theory.`;

  const internal_links = [
    `/blog/${slugify(head + " explained") || "explainer"}`,
    `/services`,
    `/blog/case-studies`,
  ];

  const featured_image_prompt = `Clean, modern editorial illustration representing "${topic}", flat vector style, brand accent colors, no text`;

  const word_count_target = search_intent === "commercial" ? 1800 : 1400;

  const publish = {
    platform: "WordPress (REST API)",
    status: "draft (awaiting human review)",
    url: `https://example-blog.com/?p=preview#${slug}`,
  };

  const report = {
    channels: ["Email", "LINE"],
    summary:
      `Draft "${truncate(seo_title, 48)}" created in WordPress (${word_count_target}-word target, ` +
      `${outline.length} sections, ${secondary_keywords.length} target keywords). ` +
      `Status: pending review. Intent: ${search_intent}.`,
  };

  return {
    primary_keyword,
    secondary_keywords,
    search_intent,
    seo_title,
    meta_description,
    slug,
    outline,
    intro_paragraph,
    internal_links,
    featured_image_prompt,
    word_count_target,
    publish,
    report,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- 日本語のページ向けの出力 ---
export const INTENT_LABELS_JA: Record<SeoResult["search_intent"], string> = {
  informational: "情報収集",
  commercial: "比較検討",
  transactional: "申し込み",
};

function detectIntentJa(topic: string): SeoResult["search_intent"] {
  if (/(方法|やり方|とは|仕組み)/.test(topic)) return "informational";
  if (/(料金|費用|価格|比較|おすすめ|依頼|代行|ツール|ソフト|サービス|安い)/.test(topic)) return "commercial";
  if (/(無料|ダウンロード|テンプレート|登録|デモ)/.test(topic)) return "transactional";
  return detectIntent(topic);
}

function cut(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

function generateSeoPlanJa(input: SeoInput): SeoResult {
  const topic = (input.topic || "").trim();
  const audience = (input.audience || "").trim();
  const primary_keyword = topic.toLowerCase();

  const secondary_keywords = [
    `${topic} とは`,
    `${topic} やり方`,
    `${topic} 事例`,
    `${topic} 注意点`,
    `${topic} ${audience || "中小企業"}`,
  ];

  const search_intent = detectIntentJa(topic);
  const year = new Date().getFullYear();

  const seo_title = cut(
    search_intent === "commercial"
      ? `${topic}の費用と選び方【${year}年版】`
      : `${topic}の実践ガイド${audience ? `【${audience}向け】` : ""}`,
    40
  );

  const meta_description = cut(
    `${audience ? `${audience}に向けて、` : ""}${topic}の基本や活用の方法、導入の手順を、実例とともに解説します。`,
    120
  );

  const slug = slugify(topic) || "untitled-post";

  const outline: SeoResult["outline"] = [
    { h2: `${topic}とは`, note: "基本的な意味と概要" },
    { h2: `${topic}が役立つ場面`, note: "活用の事例、期待できる効果、向いていないケース" },
    { h2: "導入の手順", note: "実例を使って、手順を一つずつ説明" },
    { h2: "よくある失敗と避け方", note: "読者が持ちやすい疑問と注意点" },
    { h2: "ツールの選び方と導入の進め方", note: "ツールの比較と、導入に向けた具体的な手順" },
  ];

  const intro_paragraph =
    `${topic}について、基本的な内容や具体的な活用の方法を知りたい方も多いのではないでしょうか。` +
    `この記事では、${audience ? `${audience}の方に向けて、` : ""}${topic}の基本と具体的な活用の方法を解説します。` +
    "さらに、具体的な事例を交えながら、実践するための手順を紹介します。";

  const internal_links = [`/blog/${slug}-basics`, `/services`, `/blog/case-studies`];

  const featured_image_prompt = `Clean, modern editorial illustration representing "${topic}", flat vector style, brand accent colors, no text`;

  // 日本語の記事の分量（文字数）
  const word_count_target = search_intent === "commercial" ? 6000 : 5000;

  const publish = {
    platform: "WordPress（REST API）",
    status: "下書き（担当者の確認待ち）",
    url: `https://example-blog.com/?p=preview#${slug}`,
  };

  const report = {
    channels: ["メール", "LINE"],
    summary:
      `WordPress に記事「${cut(seo_title, 30)}」の下書きを作成しました。目標文字数は ${word_count_target.toLocaleString("ja-JP")}字、` +
      `見出しは ${outline.length}件、対象のキーワードは ${secondary_keywords.length}件です。` +
      `担当者の確認を待っています。想定する検索意図は「${INTENT_LABELS_JA[search_intent]}」です。`,
  };

  return {
    primary_keyword,
    secondary_keywords,
    search_intent,
    seo_title,
    meta_description,
    slug,
    outline,
    intro_paragraph,
    internal_links,
    featured_image_prompt,
    word_count_target,
    publish,
    report,
  };
}

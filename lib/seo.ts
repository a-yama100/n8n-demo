// Self-contained reproduction of the "AI Writer" + "SEO Meta" nodes in the content
// workflow. In production this is a scheduled n8n run that pulls trend/SERP data,
// asks an LLM to draft an article, then generates SEO metadata and publishes a
// WordPress draft. Here the structured output is produced deterministically from the
// topic so the demo runs instantly with no API key. The pipeline stages (schedule →
// fetch → write → meta → publish → report) mirror the real workflow.

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

export function generateSeoPlan(input: SeoInput): SeoResult {
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
      ? `${titled}: What It Costs and How to Choose (2026)`
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

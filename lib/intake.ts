// Self-contained reproduction of the "AI Agent" node in the intake workflow.
// In production this step is an LLM (Claude) call inside n8n that classifies the
// message and extracts structured fields. Here the same output shape is produced
// deterministically from keyword signals so the demo runs instantly, with no API
// key and no cost. The routing, CRM record and Slack payload that follow are the
// real n8n logic — only the model call is simulated.
// 日本語のページから呼んだとき（lang = "ja"）は、要約・返信・Slack の文・ラベルを日本語で返す。
// 分類の判定（キーワード）は言語に関係なく同じ。

import type { Lang } from "./content";

export type IntakeInput = {
  name?: string;
  company?: string;
  email?: string;
  message: string;
};

export type IntakeCategory =
  | "sales_lead"
  | "technical_support"
  | "billing"
  | "partnership"
  | "recruiting"
  | "spam_other";

export type IntakeResult = {
  category: IntakeCategory;
  category_label: string;
  priority: "high" | "medium" | "low";
  sentiment: "positive" | "neutral" | "negative";
  language: "en" | "ja";
  summary: string;
  entities: {
    company: string | null;
    budget: string | null;
    timeline: string | null;
    requested_services: string[];
  };
  routing: {
    slack_channel: string;
    crm_stage: string;
    assignee: string;
    sla_hours: number;
  };
  suggested_reply: string;
  crm_record: Record<string, string | number | null>;
  slack_message: string;
};

const CATEGORY_LABELS: Record<IntakeCategory, string> = {
  sales_lead: "Sales lead",
  technical_support: "Technical support",
  billing: "Billing",
  partnership: "Partnership",
  recruiting: "Recruiting",
  spam_other: "Spam / other",
};

const CATEGORY_LABELS_JA: Record<IntakeCategory, string> = {
  sales_lead: "営業の相談",
  technical_support: "技術サポート",
  billing: "請求",
  partnership: "提携",
  recruiting: "採用",
  spam_other: "スパム・その他",
};

const PRIORITY_JA: Record<IntakeResult["priority"], string> = { high: "高", medium: "中", low: "低" };

type Rule = { category: IntakeCategory; keywords: string[] };

// Order matters: the first category to score is used as a tie-breaker priority.
const RULES: Rule[] = [
  { category: "billing", keywords: ["invoice", "payment", "refund", "charge", "billing", "subscription", "receipt", "overcharged", "請求", "支払", "返金", "料金"] },
  { category: "technical_support", keywords: ["error", "bug", "not working", "doesn't work", "broken", "issue", "problem", "crash", "down", "fix", "fails", "failing", "エラー", "不具合", "動かない", "動かず", "止まって", "直して", "表示されない", "障害"] },
  { category: "partnership", keywords: ["partner", "partnership", "collaborate", "collaboration", "reseller", "affiliate", "white label", "提携", "協業", "パートナー", "再販"] },
  { category: "recruiting", keywords: ["job", "position", "hiring", "resume", "cv", "apply", "applicant", "candidate", "vacancy", "採用", "求人", "応募"] },
  { category: "sales_lead", keywords: ["quote", "pricing", "price", "hire", "project", "build", "develop", "automation", "automate", "integration", "need a", "looking for", "budget", "cost", "estimate", "proposal", "依頼", "見積", "自動化", "開発", "予算", "導入", "作りたい"] },
];

const SERVICE_SIGNALS: { label: string; label_ja: string; keywords: string[] }[] = [
  { label: "n8n workflow automation", label_ja: "n8n のワークフロー自動化", keywords: ["n8n", "workflow", "automation", "automate", "zapier", "make.com", "ワークフロー", "自動化"] },
  { label: "AI agent / LLM integration", label_ja: "AI エージェントの組み込み", keywords: ["ai agent", "agent", "llm", "gpt", "claude", "openai", "anthropic", "chatbot", "ai で", "ai が", "エージェント", "チャットボット"] },
  { label: "RAG / knowledge base", label_ja: "RAG（社内文書の検索）", keywords: ["rag", "retrieval", "vector", "pinecone", "embedding", "knowledge base", "ナレッジ", "社内文書"] },
  { label: "Next.js web app", label_ja: "Next.js の Web アプリ", keywords: ["next.js", "nextjs", "react", "web app", "website", "frontend", "dashboard", "サイト", "ウェブアプリ", "ダッシュボード"] },
  { label: "API / system integration", label_ja: "API とシステムの連携", keywords: ["api", "integration", "integrate", "crm", "notion", "slack", "hubspot", "salesforce", "webhook", "連携"] },
  { label: "SEO / content automation", label_ja: "SEO と記事作成の自動化", keywords: ["seo", "content", "blog", "article", "wordpress", "ranking", "ブログ", "記事"] },
];

const HIGH_PRIORITY = ["urgent", "asap", "immediately", "today", "deadline", "critical", "blocker", "production down", "emergency", "至急", "緊急"];
const NEGATIVE = ["angry", "frustrated", "frustrating", "disappointed", "terrible", "unacceptable", "not working", "broken", "refund", "complaint", "worst", "annoyed", "困って", "ひどい", "納得できない", "不満"];
const POSITIVE = ["great", "love", "thanks", "thank you", "excited", "impressed", "interested", "awesome", "amazing", "looking forward", "助かり", "ありがとう", "楽しみ", "興味"];

function includesAny(haystack: string, needles: string[]): string[] {
  return needles.filter((n) => haystack.includes(n));
}

function detectLanguage(text: string): "en" | "ja" {
  // Any Hiragana / Katakana / CJK ideograph → treat as Japanese.
  return /[぀-ヿ㐀-鿿]/.test(text) ? "ja" : "en";
}

function extractBudget(text: string): string | null {
  const usd = text.match(/(?:\$|usd\s?)\s?([0-9][0-9,]*(?:\.[0-9]+)?)\s?(k|m)?/i);
  if (usd) {
    const suffix = usd[2] ? usd[2].toUpperCase() : "";
    return "$" + usd[1].replace(/,$/, "") + suffix;
  }
  const yen = text.match(/([0-9][0-9,]*)\s?(?:万円|円|万)/);
  if (yen) return yen[0];
  const plain = text.match(/\b([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,7})\s?(?:dollars|budget)\b/i);
  if (plain) return "$" + plain[1];
  return null;
}

function extractTimeline(text: string): string | null {
  const m = text.match(
    /\b(this (?:week|month)|next (?:week|month)|by (?:end of )?(?:the )?(?:week|month|q[1-4]|[a-z]+day|[a-z]+ \d{1,2})|within \d+ (?:days?|weeks?|months?)|in \d+ (?:days?|weeks?|months?)|asap|q[1-4]|\d+ ?(?:weeks?|months?))\b/i
  );
  if (m) return m[1];
  if (/(今月|来月|今週|来週|今日中|今年中)/.test(text)) {
    const jm = text.match(/(今月|来月|今週|来週|今日中|今年中)/);
    return jm ? jm[1] : null;
  }
  return null;
}

export function classifyIntake(input: IntakeInput, lang: Lang = "en"): IntakeResult {
  const raw = (input.message || "").trim();
  const text = raw.toLowerCase();
  const language = detectLanguage(raw);

  // --- Category ---
  let category: IntakeCategory = "spam_other";
  let bestHits = 0;
  for (const rule of RULES) {
    const hits = includesAny(text, rule.keywords).length;
    if (hits > bestHits) {
      bestHits = hits;
      category = rule.category;
    }
  }
  // Very short or link-only messages with no business signal → spam/other.
  if (bestHits === 0) {
    category = raw.length < 12 || /https?:\/\/\S+/.test(text) ? "spam_other" : "sales_lead";
  }

  // --- Services ---
  const requested_services = SERVICE_SIGNALS.filter(
    (s) => includesAny(text, s.keywords).length > 0
  ).map((s) => s.label);

  // --- Priority ---
  let priority: IntakeResult["priority"] = "medium";
  if (includesAny(text, HIGH_PRIORITY).length > 0) priority = "high";
  else if (category === "technical_support" || category === "billing") priority = "high";
  else if (category === "spam_other") priority = "low";
  else if (raw.length < 40) priority = "low";

  // --- Sentiment ---
  let sentiment: IntakeResult["sentiment"] = "neutral";
  const neg = includesAny(text, NEGATIVE).length;
  const pos = includesAny(text, POSITIVE).length;
  if (neg > pos) sentiment = "negative";
  else if (pos > neg) sentiment = "positive";

  // --- Entities ---
  const company = input.company?.trim() || null;
  const budget = extractBudget(text);
  const timeline = extractTimeline(raw);

  if (lang === "ja") {
    return buildJapanese(input, { language, category, priority, sentiment, company, budget, timeline, requested_services });
  }

  // --- Summary ---
  const who = input.name?.trim() || (company ? `Someone at ${company}` : "An anonymous visitor");
  const svc =
    requested_services.length > 0
      ? requested_services.slice(0, 2).join(" and ")
      : "their request";
  const summaryByCategory: Record<IntakeCategory, string> = {
    sales_lead: `${who} is asking about ${svc}${budget ? ` (budget ${budget})` : ""}${timeline ? `, timeline ${timeline}` : ""}.`,
    technical_support: `${who} reports a problem and needs support${requested_services.length ? ` with ${svc}` : ""}.`,
    billing: `${who} has a billing question that needs the finance owner.`,
    partnership: `${who} is proposing a partnership or collaboration.`,
    recruiting: `${who} is reaching out about a job or hiring matter.`,
    spam_other: `Low-signal message — likely spam or off-topic.`,
  };
  const summary = summaryByCategory[category];

  // --- Routing ---
  const routingByCategory: Record<IntakeCategory, IntakeResult["routing"]> = {
    sales_lead: { slack_channel: "#sales", crm_stage: "New lead", assignee: "Sales owner", sla_hours: 4 },
    technical_support: { slack_channel: "#support", crm_stage: "Support ticket", assignee: "Support engineer", sla_hours: 2 },
    billing: { slack_channel: "#finance", crm_stage: "Billing query", assignee: "Finance", sla_hours: 8 },
    partnership: { slack_channel: "#partnerships", crm_stage: "Partner inbound", assignee: "Founder", sla_hours: 24 },
    recruiting: { slack_channel: "#hiring", crm_stage: "Candidate", assignee: "HR", sla_hours: 48 },
    spam_other: { slack_channel: "#triage", crm_stage: "Unqualified", assignee: "—", sla_hours: 72 },
  };
  const routing = routingByCategory[category];

  // --- Suggested reply (the AI-drafted acknowledgement) ---
  const firstName = input.name?.trim()?.split(/\s+/)[0] || "there";
  const replyByCategory: Record<IntakeCategory, string> = {
    sales_lead: `Hi ${firstName}, thanks for reaching out about ${svc}. This is well within what we do — I'd love to learn a bit more about your goals${timeline ? ` and your ${timeline} timeline` : ""}. Could you share any docs or examples? I'll come back with an approach and a rough estimate.`,
    technical_support: `Hi ${firstName}, sorry you're hitting this — thanks for flagging it. I've logged it and a support engineer is taking a look now. To speed things up, could you tell us when it started and any error messages you see?`,
    billing: `Hi ${firstName}, thanks for getting in touch about billing. I've routed this to our finance owner and we'll get it sorted. Could you confirm the invoice or order reference so we can pull it up?`,
    partnership: `Hi ${firstName}, appreciate you thinking of us for a partnership. I'd be glad to explore it — could you share a little about what a collaboration would look like on your side?`,
    recruiting: `Hi ${firstName}, thanks for your interest. We've noted your message and will be in touch if there's a fit. Feel free to share a portfolio or CV link.`,
    spam_other: `Thanks for your message. If this is a genuine enquiry, could you add a bit more detail about what you need so we can point you to the right person?`,
  };
  const suggested_reply = replyByCategory[category];

  // --- CRM record (the row inserted into Supabase) ---
  const crm_record: Record<string, string | number | null> = {
    name: input.name?.trim() || null,
    email: input.email?.trim() || null,
    company,
    category,
    priority,
    sentiment,
    stage: routing.crm_stage,
    assignee: routing.assignee,
    requested_services: requested_services.join(", ") || null,
    budget,
    timeline,
    sla_hours: routing.sla_hours,
  };

  // --- Slack message (the payload posted to the channel) ---
  const emoji = priority === "high" ? "🔴" : priority === "medium" ? "🟡" : "⚪";
  const slack_message =
    `${emoji} *${CATEGORY_LABELS[category]}* — ${priority.toUpperCase()} priority\n` +
    `${summary}\n` +
    `• Owner: ${routing.assignee}  • SLA: ${routing.sla_hours}h  • Stage: ${routing.crm_stage}` +
    (input.email ? `\n• Reply to: ${input.email}` : "");

  return {
    category,
    category_label: CATEGORY_LABELS[category],
    priority,
    sentiment,
    language,
    summary,
    entities: { company, budget, timeline, requested_services },
    routing,
    suggested_reply,
    crm_record,
    slack_message,
  };
}

// --- 日本語のページ向けの出力（分類の結果は英語のページと同じ） ---
type Decided = {
  language: IntakeResult["language"];
  category: IntakeCategory;
  priority: IntakeResult["priority"];
  sentiment: IntakeResult["sentiment"];
  company: string | null;
  budget: string | null;
  timeline: string | null;
  requested_services: string[];
};

function buildJapanese(input: IntakeInput, d: Decided): IntakeResult {
  const { language, category, priority, sentiment, company, budget, timeline } = d;
  const services_ja = SERVICE_SIGNALS.filter((s) => d.requested_services.includes(s.label)).map((s) => s.label_ja);
  const name = input.name?.trim();

  const who = name ? `${name} 様` : company ? `${company} のご担当者様` : "お名前の入力がない方";
  const svc = services_ja.length > 0 ? services_ja.slice(0, 2).join("、") : "ご依頼の内容";

  const summaryByCategory: Record<IntakeCategory, string> = {
    sales_lead: `${who}から、${svc}に関する問い合わせがありました${budget ? `（予算 ${budget}）` : ""}。${timeline ? `希望の時期は${timeline}です。` : ""}`,
    technical_support: `${who}から不具合に関する問い合わせがありました${services_ja.length ? `（対象: ${svc}）` : ""}。サポートエンジニアによる確認が必要です。`,
    billing: `${who}から請求に関する問い合わせがありました。経理の担当者による確認が必要です。`,
    partnership: `${who}から、提携や協業の提案がありました。`,
    recruiting: `${who}から、求人や採用に関する問い合わせがありました。`,
    spam_other: "問い合わせの目的を特定できませんでした。スパムや業務に関係のない内容の可能性があります。",
  };
  const summary = summaryByCategory[category];

  const routingByCategory: Record<IntakeCategory, IntakeResult["routing"]> = {
    sales_lead: { slack_channel: "#sales", crm_stage: "新規の見込み客", assignee: "営業担当", sla_hours: 4 },
    technical_support: { slack_channel: "#support", crm_stage: "サポートの依頼", assignee: "サポートエンジニア", sla_hours: 2 },
    billing: { slack_channel: "#finance", crm_stage: "請求の問い合わせ", assignee: "経理", sla_hours: 8 },
    partnership: { slack_channel: "#partnerships", crm_stage: "提携の問い合わせ", assignee: "代表", sla_hours: 24 },
    recruiting: { slack_channel: "#hiring", crm_stage: "応募者", assignee: "人事", sla_hours: 48 },
    spam_other: { slack_channel: "#triage", crm_stage: "対象外", assignee: "—", sla_hours: 72 },
  };
  const routing = routingByCategory[category];

  const dear = name ? `${name} 様` : "お客様";
  const replyByCategory: Record<IntakeCategory, string> = {
    sales_lead: `${dear}\n\n${svc}についてお問い合わせいただき、ありがとうございます。弊社が得意とする分野です。ご要望や実現したいこと${timeline ? `や、${timeline}からというご希望の時期` : ""}について、もう少し詳しくお聞かせください。関連する資料や参考の事例がございましたら、お送りいただけますと幸いです。開発の進め方と概算のお見積もりを、あらためてご案内いたします。`,
    technical_support: `${dear}\n\nご不便をおかけして申し訳ありません。ご連絡いただき、ありがとうございます。お問い合わせを受け付けました。サポートエンジニアが内容を確認いたします。早期の解決のため、不具合が起きた時刻と、表示されているエラーメッセージをお知らせいただけますでしょうか。`,
    billing: `${dear}\n\n請求の件でご連絡いただき、ありがとうございます。経理の担当者に引き継ぎ、内容を確認いたします。該当する請求書番号か注文番号をお知らせいただけますでしょうか。`,
    partnership: `${dear}\n\n提携のご提案をいただき、ありがとうございます。ご提案の内容を検討させていただきます。貴社が想定されている提携の内容について、もう少し詳しくお聞かせいただけますでしょうか。`,
    recruiting: `${dear}\n\nご関心をお寄せいただき、ありがとうございます。内容を確認し、条件が合う場合はあらためてご連絡いたします。ポートフォリオや職務経歴書のリンクがございましたら、お送りください。`,
    spam_other: "ご連絡いただき、ありがとうございます。お問い合わせの内容を確認できなかったため、ご用件をもう少し詳しくお知らせください。",
  };
  const suggested_reply = replyByCategory[category];

  // Supabase の列の名前と、分類・優先度・感情のコードは英語のページと同じ
  const crm_record: Record<string, string | number | null> = {
    name: name || null,
    email: input.email?.trim() || null,
    company,
    category,
    priority,
    sentiment,
    stage: routing.crm_stage,
    assignee: routing.assignee,
    requested_services: services_ja.join("、") || null,
    budget,
    timeline,
    sla_hours: routing.sla_hours,
  };

  const emoji = priority === "high" ? "🔴" : priority === "medium" ? "🟡" : "⚪";
  const slack_message =
    `${emoji} *${CATEGORY_LABELS_JA[category]}* — 優先度: ${PRIORITY_JA[priority]}\n` +
    `${summary}\n` +
    `• 担当: ${routing.assignee}  • 対応期限: ${routing.sla_hours}時間  • ステータス: ${routing.crm_stage}` +
    (input.email ? `\n• 返信先: ${input.email}` : "");

  return {
    category,
    category_label: CATEGORY_LABELS_JA[category],
    priority,
    sentiment,
    language,
    summary,
    entities: { company, budget, timeline, requested_services: services_ja },
    routing,
    suggested_reply,
    crm_record,
    slack_message,
  };
}

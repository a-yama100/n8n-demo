// 日本語（/）と英語（/en）の文の置き場所。ページの題名・説明・h1 はここにまとめる。
export type Lang = "ja" | "en";

export const SITE_URL = "https://n8n-demo.phaiworks.com";

export function asLang(v: unknown): Lang {
  return v === "ja" ? "ja" : "en";
}

// h1（ページの見出し）。仮の案。差し替えるときはここだけを直す
export const H1: Record<Lang, string> = {
  ja: "n8n 業務自動化デモ",
  en: "n8n Automation Demo",
};

export const META: Record<Lang, { title: string; description: string; ogDescription: string; siteName: string; path: string }> = {
  ja: {
    title: "n8n 業務自動化デモ | AI による問い合わせの振り分けと SEO 記事作成",
    description:
      "n8n による業務自動化の仕組みを、ブラウザで試せるデモです。AI による問い合わせの分類と振り分け（CRM への登録・Slack への通知）と、SEO 記事を毎日作成する流れの2つを再現しています。IBM 認定の AI エンジニアが開発しました。",
    ogDescription:
      "n8n による業務自動化の流れを、ブラウザで再現したデモです。AI による問い合わせの分類と振り分け、SEO 記事の定期作成を試せます。",
    siteName: "PH AI Works — n8n 業務自動化デモ",
    path: "/",
  },
  en: {
    title: "n8n Automation Demo — AI Intake & SEO Content Workflows",
    description:
      "A live, interactive demo of two production-style n8n workflows: an AI agent that classifies inbound enquiries and writes them to a CRM + Slack, and a scheduled SEO content pipeline. Built by an IBM-certified AI engineer.",
    ogDescription:
      "Two interactive n8n workflows you can run in the browser: AI enquiry intake (classify → Supabase → Slack) and a scheduled SEO content pipeline.",
    siteName: "PH AI Works — n8n Automation Demo",
    path: "/en",
  },
};

export const HEADER: Record<Lang, { home: string; badge: string; toggle: string; toggleHref: string }> = {
  ja: { home: "https://www.phaiworks.com", badge: "n8n 自動化デモ", toggle: "English", toggleHref: "/en" },
  en: { home: "https://www.phaiworks.com/en", badge: "n8n Automation Demo", toggle: "日本語", toggleHref: "/" },
};

export const TABS: Record<Lang, { intake: string; seo: string }> = {
  ja: { intake: "AI による問い合わせの振り分け", seo: "SEO 記事作成の自動化" },
  en: { intake: "AI Intake Automation", seo: "SEO Content Automation" },
};

// 2つのデモに共通の文
export const RUN_UI: Record<
  Lang,
  {
    running: string;
    run: string;
    orExample: string;
    canvas: string;
    idle: string;
    done: string;
    step: (n: number, total: number) => string;
    networkError: string;
    genericError: string;
  }
> = {
  ja: {
    running: "ワークフローを実行中…",
    run: "▶ ワークフローを実行",
    orExample: "サンプルから選ぶ:",
    canvas: "ワークフローの実行状況",
    idle: "待機中",
    done: "✓ 実行完了（全6ノード）",
    step: (n, total) => `実行中…（全${total}ノードのうち${n}番目）`,
    networkError: "通信エラーが発生しました。",
    genericError: "エラーが発生しました。",
  },
  en: {
    running: "Running workflow…",
    run: "▶ Run workflow",
    orExample: "or try an example:",
    canvas: "Workflow canvas",
    idle: "idle",
    done: "✓ executed · 6 nodes",
    step: (n) => `running… node ${n}/6`,
    networkError: "Network error.",
    genericError: "Something went wrong.",
  },
};

// API の誤りの文
export const API_ERRORS: Record<
  Lang,
  {
    tooMany: string;
    invalid: string;
    emptyMessage: string;
    longMessage: (max: number) => string;
    emptyTopic: string;
    longTopic: (max: number) => string;
  }
> = {
  ja: {
    tooMany: "短時間にリクエストが集中しています。少し時間をおいて、もう一度お試しください。",
    invalid: "リクエストの形式が正しくありません。",
    emptyMessage: "問い合わせの内容を入力してください。",
    longMessage: (max) => `メッセージが長すぎます（${max}文字まで）。`,
    emptyTopic: "記事のテーマかキーワードを入力してください。",
    longTopic: (max) => `テーマが長すぎます（${max}文字まで）。`,
  },
  en: {
    tooMany: "Too many requests. Please slow down and try again shortly.",
    invalid: "Invalid request.",
    emptyMessage: "Please enter a message to process.",
    longMessage: (max) => `Message too long (max ${max} characters).`,
    emptyTopic: "Please enter a topic or keyword.",
    longTopic: (max) => `Topic too long (max ${max} characters).`,
  },
};

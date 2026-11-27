// Static definitions of the two n8n workflows the demo reproduces. These drive the
// visual canvas (positions + connectors) and the step-by-step execution animation.
// Coordinates are in canvas px; the canvas component scrolls horizontally on mobile.

export type NodeKind =
  | "trigger"
  | "ai"
  | "logic"
  | "db"
  | "comms"
  | "mail"
  | "http"
  | "seo"
  | "cms"
  | "report";

export type WorkflowNode = {
  id: string;
  title: string;
  subtitle: string;
  /** 日本語のページで使うノードの名前（無ければ title をそのまま使う。n8n のノード名は英語のまま） */
  title_ja?: string;
  /** 日本語のページで使う補足 */
  subtitle_ja: string;
  icon: string;
  kind: NodeKind;
  x: number;
  y: number;
};

export type WorkflowEdge = { from: string; to: string; label?: string };

export type Workflow = {
  width: number;
  height: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  /** Node ids in execution order — drives the run animation. */
  sequence: string[];
};

export const KIND_ACCENT: Record<NodeKind, string> = {
  trigger: "#2563eb",
  ai: "#7c3aed",
  logic: "#0ea5e9",
  db: "#16a34a",
  comms: "#6366f1",
  mail: "#0d9488",
  http: "#0891b2",
  seo: "#f59e0b",
  cms: "#21759b",
  report: "#0d9488",
};

export const INTAKE_WORKFLOW: Workflow = {
  width: 720,
  height: 280,
  nodes: [
    { id: "webhook", title: "Webhook", subtitle: "Form submission", subtitle_ja: "フォームの送信", icon: "🔗", kind: "trigger", x: 16, y: 108 },
    { id: "ai", title: "AI Agent", subtitle: "Classify + extract", subtitle_ja: "分類と情報の抽出", icon: "🤖", kind: "ai", x: 188, y: 108 },
    { id: "router", title: "Switch", subtitle: "Route by category", subtitle_ja: "分類ごとに振り分け", icon: "🔀", kind: "logic", x: 360, y: 108 },
    { id: "supabase", title: "Supabase", subtitle: "Insert CRM lead", subtitle_ja: "CRM に問い合わせを登録", icon: "🗄️", kind: "db", x: 552, y: 24 },
    { id: "slack", title: "Slack", subtitle: "Notify channel", subtitle_ja: "チャンネルに通知", icon: "💬", kind: "comms", x: 552, y: 108 },
    { id: "gmail", title: "Gmail", subtitle: "Auto-acknowledge", subtitle_ja: "受付メールの下書き", icon: "✉️", kind: "mail", x: 552, y: 192 },
  ],
  edges: [
    { from: "webhook", to: "ai" },
    { from: "ai", to: "router" },
    { from: "router", to: "supabase" },
    { from: "router", to: "slack" },
    { from: "router", to: "gmail" },
  ],
  sequence: ["webhook", "ai", "router", "supabase", "slack", "gmail"],
};

export const SEO_WORKFLOW: Workflow = {
  width: 980,
  height: 200,
  nodes: [
    { id: "schedule", title: "Schedule", subtitle: "Daily 06:00", subtitle_ja: "毎日 06:00（想定）", icon: "⏰", kind: "trigger", x: 16, y: 70 },
    { id: "fetch", title: "HTTP Request", subtitle: "Fetch trends / SERP", subtitle_ja: "検索の傾向と結果を取得", icon: "🌐", kind: "http", x: 178, y: 70 },
    { id: "writer", title: "AI Writer", subtitle: "Draft article", subtitle_ja: "構成案と導入文", icon: "🤖", kind: "ai", x: 340, y: 70 },
    { id: "meta", title: "SEO Meta", subtitle: "Title + schema", subtitle_ja: "タイトルとメタ情報", icon: "🏷️", kind: "seo", x: 502, y: 70 },
    { id: "wordpress", title: "WordPress", subtitle: "Create post (draft)", subtitle_ja: "下書きを作成", icon: "📝", kind: "cms", x: 664, y: 70 },
    { id: "report", title: "Email + LINE", subtitle: "Send report", title_ja: "メール + LINE", subtitle_ja: "担当者に通知", icon: "📧", kind: "report", x: 826, y: 70 },
  ],
  edges: [
    { from: "schedule", to: "fetch" },
    { from: "fetch", to: "writer" },
    { from: "writer", to: "meta" },
    { from: "meta", to: "wordpress" },
    { from: "wordpress", to: "report" },
  ],
  sequence: ["schedule", "fetch", "writer", "meta", "wordpress", "report"],
};

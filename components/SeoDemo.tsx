"use client";

import { useState } from "react";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { SEO_WORKFLOW } from "@/lib/workflows";
import { INTENT_LABELS_JA, type SeoResult } from "@/lib/seo";
import { RUN_UI, type Lang } from "@/lib/content";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const EXAMPLES_EN: { topic: string; audience: string }[] = [
  { topic: "n8n workflow automation for small business", audience: "operations teams" },
  { topic: "AI customer support chatbot", audience: "SaaS founders" },
  { topic: "how to reduce cloud costs", audience: "CTOs" },
  { topic: "best CRM for freelancers", audience: "solo consultants" },
];

const EXAMPLES_JA: { topic: string; audience: string }[] = [
  { topic: "n8n を使った中小企業の業務自動化", audience: "業務の担当者" },
  { topic: "AI を使ったカスタマーサポート用チャットボット", audience: "SaaS の創業者" },
  { topic: "クラウドの利用料を減らす方法", audience: "CTO" },
  { topic: "フリーランス向けのおすすめ CRM", audience: "個人で活動するコンサルタント" },
];

const TEXT = {
  ja: {
    topic: "記事のテーマ・キーワード",
    topicPlaceholder: "記事のテーマかキーワード…",
    audience: "読者層（任意）",
    empty: "記事のテーマかキーワードを入力するか、サンプルを選んでからワークフローを実行してください。",
    meta: "🏷️ SEO Meta · SEO の設定案",
    title: "タイトル",
    metaDescription: "メタディスクリプション",
    slug: "スラッグ:",
    intent: "検索意図:",
    intentValue: (i: SeoResult["search_intent"]) => INTENT_LABELS_JA[i],
    target: "目標文字数:",
    targetValue: (n: number) => `${n.toLocaleString("ja-JP")}文字`,
    keywords: "キーワード:",
    writer: "🤖 AI Writer · 記事の構成案",
    wordpress: "📝 WordPress · 下書きの内容",
    platform: "投稿先:",
    status: "状態:",
    preview: "プレビュー:",
    internal: "内部リンクの候補:",
    report: "📧 報告 · ",
  },
  en: {
    topic: "Topic or target keyword",
    topicPlaceholder: "Topic or target keyword…",
    audience: "Target audience (optional)",
    empty: "Enter a topic or keyword (or pick an example) to run the workflow.",
    meta: "🏷️ SEO Meta · generated",
    title: "Title",
    metaDescription: "Meta description",
    slug: "Slug:",
    intent: "Intent:",
    intentValue: (i: SeoResult["search_intent"]): string => i,
    target: "Word target:",
    targetValue: (n: number) => String(n),
    keywords: "Keywords:",
    writer: "🤖 AI Writer · draft outline",
    wordpress: "📝 WordPress · draft created",
    platform: "Platform:",
    status: "Status:",
    preview: "Preview:",
    internal: "Internal links suggested:",
    report: "📧 Report · ",
  },
};

export function SeoDemo({ lang }: { lang: Lang }) {
  const tx = TEXT[lang];
  const ui = RUN_UI[lang];
  const EXAMPLES = lang === "ja" ? EXAMPLES_JA : EXAMPLES_EN;
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SeoResult | null>(null);

  async function run() {
    if (running) return;
    const t = topic.trim();
    if (!t) {
      setError(tx.empty);
      return;
    }
    setRunning(true);
    setError("");
    setResult(null);
    setStep(-1);

    const pending = fetch(`/api/seo?lang=${lang}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: t, audience }),
    })
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .catch(() => ({ ok: false, data: { error: ui.networkError } }));

    const seq = SEO_WORKFLOW.sequence;
    for (let i = 0; i < seq.length; i++) {
      setStep(i);
      await sleep(i === 0 ? 350 : 520);
    }

    const { ok, data } = await pending;
    if (!ok) {
      setError(data.error || ui.genericError);
      setStep(-1);
      setRunning(false);
      return;
    }
    setStep(seq.length);
    setResult(data.result as SeoResult);
    setRunning(false);
  }

  return (
    <div>
      {lang === "ja" ? (
        <p className="text-sm text-slate-600">
          {"実際のシステムでは、"}
          <strong>Schedule</strong>
          {" で決めた時刻に、毎日処理を始めます。"}
          <strong>HTTP Request</strong>
          {" で検索の傾向と検索結果を取得し、"}
          <strong>AI Writer</strong>
          {" が記事の構成案と導入文を作ります。"}
          <strong>SEO Meta</strong>
          {" では、タイトル、メタディスクリプション、スラッグなどを作ります。そのあと記事を "}
          <strong>WordPress</strong>
          {" に下書きとして保存し、"}
          <strong>メールと LINE</strong>
          {" で担当者に知らせます。記事は、担当者が内容を確認してから公開します。このデモでは、これらの処理の結果を画面で再現しています。"}
        </p>
      ) : (
        <p className="text-sm text-slate-600">
          A <strong>Schedule</strong> trigger runs every day. n8n uses an{" "}
          <strong>HTTP Request</strong> to collect trend and search-result data, and an{" "}
          <strong>AI Writer</strong> drafts the article. An <strong>SEO Meta</strong> step
          creates the title, URL slug and structured data. The post is then saved as a{" "}
          <strong>WordPress</strong> draft, and a summary goes out by{" "}
          <strong>Email + LINE</strong> so a person can review it before publishing.
        </p>
      )}

      {/* Form */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <input aria-label={tx.topic} name="topic" autoComplete="off"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={160}
            placeholder={tx.topicPlaceholder}
            onKeyDown={(e) => e.key === "Enter" && run()}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
          />
          <input aria-label={tx.audience} name="audience" autoComplete="off"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            maxLength={80}
            placeholder={tx.audience}
            onKeyDown={(e) => e.key === "Enter" && run()}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={run}
            disabled={running}
            className="rounded-lg bg-n8n px-5 py-2.5 text-sm font-medium text-white hover:bg-n8n-dark disabled:opacity-50 transition-colors"
          >
            {running ? ui.running : ui.run}
          </button>
          <span className="text-xs text-slate-400">{ui.orExample}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.topic}
              onClick={() => {
                setTopic(ex.topic);
                setAudience(ex.audience);
                setResult(null);
                setStep(-1);
                setError("");
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {ex.topic}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Canvas */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">{ui.canvas}</h3>
          <span className="text-xs text-slate-400">
            {step < 0
              ? ui.idle
              : result
              ? ui.done
              : ui.step(Math.min(step + 1, SEO_WORKFLOW.sequence.length), 6)}
          </span>
        </div>
        <WorkflowCanvas workflow={SEO_WORKFLOW} activeStep={step} lang={lang} />
      </div>

      {/* Results */}
      {result && <SeoResults result={result} tx={TEXT[lang]} />}
    </div>
  );
}

function SeoResults({ result, tx }: { result: SeoResult; tx: (typeof TEXT)["en"] }) {
  return (
    <div className="mt-6 space-y-4">
      {/* SEO meta */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
          {tx.meta}
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div>
            <span className="text-slate-400">{tx.title}</span>
            <p className="font-medium text-slate-800">{result.seo_title}</p>
          </div>
          <div>
            <span className="text-slate-400">{tx.metaDescription}</span>
            <p className="text-slate-700">{result.meta_description}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-slate-700">
            <span>
              <span className="text-slate-400">{tx.slug}</span>{" "}
              <code className="font-mono text-xs">/{result.slug}</code>
            </span>
            <span>
              <span className="text-slate-400">{tx.intent}</span> {tx.intentValue(result.search_intent)}
            </span>
            <span>
              <span className="text-slate-400">{tx.target}</span>{" "}
              {tx.targetValue(result.word_count_target)}
            </span>
          </div>
          <div className="pt-1">
            <span className="text-slate-400">{tx.keywords}</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                {result.primary_keyword}
              </span>
              {result.secondary_keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* AI Writer draft */}
        <div className="rounded-xl border border-violet-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
            {tx.writer}
          </div>
          <p className="mt-3 text-sm italic leading-relaxed text-slate-600">
            {result.intro_paragraph}
          </p>
          <ol className="mt-3 space-y-1.5 text-sm text-slate-700">
            {result.outline.map((s, i) => (
              <li key={s.h2}>
                <span className="font-medium text-slate-800">
                  {i + 1}. {s.h2}
                </span>
                <span className="block text-xs text-slate-400">{s.note}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* WordPress + report */}
        <div className="space-y-4">
          <div className="rounded-xl border border-sky-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-700">
              {tx.wordpress}
            </div>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              <li>
                <span className="text-slate-400">{tx.platform}</span>{" "}
                {result.publish.platform}
              </li>
              <li>
                <span className="text-slate-400">{tx.status}</span> {result.publish.status}
              </li>
              <li className="truncate">
                <span className="text-slate-400">{tx.preview}</span>{" "}
                <code className="font-mono text-xs">{result.publish.url}</code>
              </li>
            </ul>
            <div className="mt-3 text-xs text-slate-500">
              {tx.internal}{" "}
              {result.internal_links.map((l) => (
                <code key={l} className="font-mono text-[11px] text-slate-600 break-all">
                  {l}{" "}
                </code>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-teal-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
              {tx.report}{result.report.channels.join(" + ")}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {result.report.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

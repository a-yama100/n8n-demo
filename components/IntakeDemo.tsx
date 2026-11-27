"use client";

import { useState } from "react";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { INTAKE_WORKFLOW } from "@/lib/workflows";
import type { IntakeResult } from "@/lib/intake";
import { RUN_UI, type Lang } from "@/lib/content";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Example = {
  label: string;
  name: string;
  company: string;
  email: string;
  message: string;
};

const EXAMPLES_EN: Example[] = [
  {
    label: "🟢 Hot lead (n8n project)",
    name: "Maria Santos",
    company: "Cebu Logistics Co.",
    email: "maria@cebulogistics.example",
    message:
      "Hi! We get dozens of enquiries a day through our website and they all land in one inbox. We'd like an n8n workflow that classifies each submission with AI and pushes qualified leads into our CRM, with a Slack ping to the sales team. Budget is around $4,000 and we'd love to start next month.",
  },
  {
    label: "🔴 Angry support ticket",
    name: "Tom",
    company: "",
    email: "tom@shop.example",
    message:
      "URGENT — our checkout has been completely broken since this morning and customers can't pay. This is unacceptable, we're losing sales. Fix it ASAP!",
  },
  {
    label: "💳 Billing question",
    name: "Aiko",
    company: "",
    email: "aiko@example.com",
    message:
      "I think I was charged twice for my subscription this month. Could you check and refund the extra charge? My invoice reference is INV-2231.",
  },
  {
    label: "🤝 Partnership",
    name: "David Lin",
    company: "CloudPay",
    email: "david@cloudpay.example",
    message:
      "We're a fintech SaaS and would love to explore a reseller partnership for your AI automation services. Who's the right person to talk to?",
  },
  {
    label: "🗑️ Spam",
    name: "",
    company: "",
    email: "",
    message: "check this out http://promo.example/win",
  },
];

// 日本語のページの例（人名・会社名・メールアドレス・金額は英語の例と同じ）
const EXAMPLES_JA: Example[] = [
  {
    label: "🟢 自動化の開発の相談",
    name: "Maria Santos",
    company: "Cebu Logistics Co.",
    email: "maria@cebulogistics.example",
    message:
      "はじめまして。当社のサイトには毎日数十件の問い合わせがあり、すべて同じ受信トレイに届きます。n8n のワークフローで、届いた問い合わせを AI で分類し、有望な見込み客を CRM に登録して、営業チームに Slack で知らせる仕組みを作りたいと考えています。予算は $4,000 程度で、来月から開発を始めたいと考えています。",
  },
  {
    label: "🔴 緊急の不具合の対応依頼",
    name: "Tom",
    company: "",
    email: "tom@shop.example",
    message:
      "至急対応してください。今朝から決済の画面がまったく動かず、お客様が支払いを完了できない状態です。売上にも影響が出ていて、とても困っています。すぐに直してください！",
  },
  {
    label: "💳 請求の問い合わせ",
    name: "Aiko",
    company: "",
    email: "aiko@example.com",
    message:
      "今月分のサブスクリプションの料金が二重に請求されているようです。ご確認のうえ、重複して支払った分を返金していただけますか。請求書番号は INV-2231 です。",
  },
  {
    label: "🤝 提携の提案",
    name: "David Lin",
    company: "CloudPay",
    email: "david@cloudpay.example",
    message:
      "当社はフィンテックの SaaS 企業です。貴社の AI 自動化サービスを当社でも販売できるよう、販売パートナーとしての提携を検討しています。どなたにご相談すればよいでしょうか。",
  },
  {
    label: "🗑️ スパム",
    name: "",
    company: "",
    email: "",
    message: "今すぐチェック http://promo.example/win",
  },
];

const TEXT = {
  ja: {
    name: "お名前（任意）",
    company: "会社名（任意）",
    email: "メールアドレス（任意）",
    messageLabel: "お客様からの問い合わせ",
    messagePlaceholder: "お客様からの問い合わせの内容を入力してください…",
    empty: "問い合わせの内容を入力するか、サンプルを選んでからワークフローを実行してください。",
  },
  en: {
    name: "Name (optional)",
    company: "Company (optional)",
    email: "Email (optional)",
    messageLabel: "Customer enquiry",
    messagePlaceholder: "Paste a customer enquiry here…",
    empty: "Enter a message (or pick an example) to run the workflow.",
  },
} as const;

export function IntakeDemo({ lang }: { lang: Lang }) {
  const t = TEXT[lang];
  const ui = RUN_UI[lang];
  const EXAMPLES = lang === "ja" ? EXAMPLES_JA : EXAMPLES_EN;
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState("");
  const [result, setResult] = useState<IntakeResult | null>(null);

  function fillExample(ex: Example) {
    setName(ex.name);
    setCompany(ex.company);
    setEmail(ex.email);
    setMessage(ex.message);
    setResult(null);
    setStep(-1);
    setError("");
  }

  async function run() {
    if (running) return;
    const msg = message.trim();
    if (!msg) {
      setError(t.empty);
      return;
    }
    setRunning(true);
    setError("");
    setResult(null);
    setStep(-1);

    const pending = fetch(`/api/intake?lang=${lang}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, company, email, message: msg }),
    })
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .catch(() => ({ ok: false, data: { error: ui.networkError } }));

    const seq = INTAKE_WORKFLOW.sequence;
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
    setResult(data.result as IntakeResult);
    setRunning(false);
  }

  return (
    <div>
      {lang === "ja" ? (
        <p className="text-sm text-slate-600">
          {"実際のシステムでは、サイトの問い合わせフォームからの送信を "}
          <strong>Webhook</strong>
          {" で受け付けます。"}
          <strong>AI Agent</strong>
          {" が問い合わせを分類し、対応に必要な情報を取り出します。続いて "}
          <strong>Switch</strong>
          {" が分類ごとに振り分け、"}
          <strong>Supabase</strong>
          {" への登録、"}
          <strong>Slack</strong>
          {" での通知、"}
          <strong>Gmail</strong>
          {" での受付メールの下書きの作成を行います。"}
        </p>
      ) : (
        <p className="text-sm text-slate-600">
          A website contact form acts as the <strong>Webhook trigger</strong>. n8n sends
          the message to an <strong>AI Agent</strong>, which sorts it and pulls out the
          key details. A <strong>Switch</strong> then routes it by category: the lead is
          saved to <strong>Supabase</strong>, the team gets an alert in{" "}
          <strong>Slack</strong>, and the sender receives an automatic reply by{" "}
          <strong>Gmail</strong>.
        </p>
      )}

      {/* Form */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <input aria-label={t.name} name="name" autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            placeholder={t.name}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
          />
          <input aria-label={t.company} name="company" autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            maxLength={120}
            placeholder={t.company}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
          />
          <input aria-label={t.email} name="email" autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={160}
            placeholder={t.email}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
          />
        </div>
        <textarea aria-label={t.messageLabel} name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1200}
          rows={4}
          placeholder={t.messagePlaceholder}
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-n8n"
        />
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
              key={ex.label}
              onClick={() => fillExample(ex)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {ex.label}
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
          <h3 className="text-sm font-semibold text-slate-700">
            {ui.canvas}
          </h3>
          <span className="text-xs text-slate-400">
            {step < 0
              ? ui.idle
              : result
              ? ui.done
              : ui.step(Math.min(step + 1, INTAKE_WORKFLOW.sequence.length), 6)}
          </span>
        </div>
        <WorkflowCanvas workflow={INTAKE_WORKFLOW} activeStep={step} lang={lang} />
      </div>

      {/* Results */}
      {result && <IntakeResults result={result} lang={lang} />}
    </div>
  );
}

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium " + tone}>
      {children}
    </span>
  );
}

const RESULT_TEXT = {
  ja: {
    agent: "🤖 AI Agent · 問い合わせの分析結果",
    priority: (p: IntakeResult["priority"]) => `優先度: ${({ high: "高", medium: "中", low: "低" } as const)[p]}`,
    sentiment: (s: IntakeResult["sentiment"]) => `感情の判定: ${({ positive: "肯定的", neutral: "中立", negative: "否定的" } as const)[s]}`,
    language: (l: string) => `言語: ${l}`,
    extracted: "抽出した情報",
    services: "サービス:",
    budget: "予算:",
    timeline: "時期:",
    company: "会社:",
    routing: "振り分け",
    slack: "Slack:",
    crmStage: "CRM のステータス:",
    assignee: "担当:",
    sla: "対応期限:",
    hours: (h: number) => `${h}時間`,
    supabaseBefore: "🗄️ Supabase · ",
    supabaseAfter: " テーブルに1件を登録",
    slackPosted: (c: string) => `💬 Slack · ${c} への通知`,
    gmail: "✉️ Gmail · 受付メールの下書き",
    join: "、",
  },
  en: {
    agent: "🤖 AI Agent · structured output",
    priority: (p: IntakeResult["priority"]) => `priority: ${p}`,
    sentiment: (s: IntakeResult["sentiment"]) => `sentiment: ${s}`,
    language: (l: string) => `lang: ${l}`,
    extracted: "Extracted",
    services: "Services:",
    budget: "Budget:",
    timeline: "Timeline:",
    company: "Company:",
    routing: "Routing decision",
    slack: "Slack:",
    crmStage: "CRM stage:",
    assignee: "Assignee:",
    sla: "SLA:",
    hours: (h: number) => `${h}h`,
    supabaseBefore: "🗄️ Supabase · row inserted into ",
    supabaseAfter: "",
    slackPosted: (c: string) => `💬 Slack · posted to ${c}`,
    gmail: "✉️ Gmail · AI-drafted auto-acknowledgement",
    join: ", ",
  },
};

function IntakeResults({ result, lang }: { result: IntakeResult; lang: Lang }) {
  const r = RESULT_TEXT[lang];
  const priorityTone =
    result.priority === "high"
      ? "bg-red-100 text-red-700"
      : result.priority === "medium"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600";
  const sentimentTone =
    result.sentiment === "negative"
      ? "bg-red-100 text-red-700"
      : result.sentiment === "positive"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="mt-6 space-y-4">
      {/* AI Agent output */}
      <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
          {r.agent}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="bg-violet-100 text-violet-700">{result.category_label}</Badge>
          <Badge tone={priorityTone}>{r.priority(result.priority)}</Badge>
          <Badge tone={sentimentTone}>{r.sentiment(result.sentiment)}</Badge>
          <Badge tone="bg-slate-100 text-slate-600">{r.language(result.language)}</Badge>
        </div>
        <p className="mt-3 text-sm text-slate-700">{result.summary}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-slate-500">{r.extracted}</div>
            <ul className="mt-1 space-y-1 text-sm text-slate-700">
              <li>
                <span className="text-slate-400">{r.services}</span>{" "}
                {result.entities.requested_services.length
                  ? result.entities.requested_services.join(r.join)
                  : "—"}
              </li>
              <li>
                <span className="text-slate-400">{r.budget}</span>{" "}
                {result.entities.budget ?? "—"}
              </li>
              <li>
                <span className="text-slate-400">{r.timeline}</span>{" "}
                {result.entities.timeline ?? "—"}
              </li>
              <li>
                <span className="text-slate-400">{r.company}</span>{" "}
                {result.entities.company ?? "—"}
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">{r.routing}</div>
            <ul className="mt-1 space-y-1 text-sm text-slate-700">
              <li>
                <span className="text-slate-400">{r.slack}</span>{" "}
                {result.routing.slack_channel}
              </li>
              <li>
                <span className="text-slate-400">{r.crmStage}</span>{" "}
                {result.routing.crm_stage}
              </li>
              <li>
                <span className="text-slate-400">{r.assignee}</span>{" "}
                {result.routing.assignee}
              </li>
              <li>
                <span className="text-slate-400">{r.sla}</span> {r.hours(result.routing.sla_hours)}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Supabase row */}
        <div className="rounded-xl border border-emerald-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {r.supabaseBefore}<code className="font-mono">leads</code>{r.supabaseAfter}
          </div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
            {JSON.stringify(result.crm_record, null, 2)}
          </pre>
        </div>

        {/* Slack message */}
        <div className="rounded-xl border border-indigo-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            {r.slackPosted(result.routing.slack_channel)}
          </div>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-sm leading-relaxed text-slate-700">
            {result.slack_message}
          </pre>
        </div>
      </div>

      {/* Suggested reply */}
      <div className="rounded-xl border border-teal-200 bg-white p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
          {r.gmail}
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {result.suggested_reply}
        </p>
      </div>
    </div>
  );
}

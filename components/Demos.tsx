"use client";

import { useState } from "react";
import { IntakeDemo } from "./IntakeDemo";
import { SeoDemo } from "./SeoDemo";
import { TABS as TAB_LABELS, type Lang } from "@/lib/content";

const TABS = [{ id: "intake" }, { id: "seo" }] as const;

type TabId = (typeof TABS)[number]["id"];

export function Demos({ lang }: { lang: Lang }) {
  const [tab, setTab] = useState<TabId>("intake");

  return (
    <div>
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors " +
              (tab === t.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700")
            }
          >
            {TAB_LABELS[lang][t.id]}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "intake" ? <IntakeDemo lang={lang} /> : <SeoDemo lang={lang} />}
      </div>
    </div>
  );
}

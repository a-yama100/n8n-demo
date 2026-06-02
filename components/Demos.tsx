"use client";

import { useState } from "react";
import { IntakeDemo } from "./IntakeDemo";
import { SeoDemo } from "./SeoDemo";

const TABS = [
  { id: "intake", label: "AI Intake Automation" },
  { id: "seo", label: "SEO Content Automation" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Demos() {
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
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">{tab === "intake" ? <IntakeDemo /> : <SeoDemo />}</div>
    </div>
  );
}

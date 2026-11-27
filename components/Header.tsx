import { HEADER, type Lang } from "@/lib/content";

export function Header({ lang }: { lang: Lang }) {
  const t = HEADER[lang];
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <a
            href={t.home}
            className="shrink-0 font-bold text-slate-900 hover:text-n8n transition-colors"
          >
            PH AI Works
          </a>
          <span className="truncate text-xs font-semibold uppercase tracking-wide text-n8n bg-blue-50 border border-blue-200 rounded px-2 py-0.5">
            {t.badge}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href={t.home}
            className="hidden sm:inline text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            phaiworks.com
          </a>
          <a
            href={t.toggleHref}
            hrefLang={lang === "ja" ? "en" : "ja"}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-n8n hover:text-n8n transition-colors"
          >
            {t.toggle}
          </a>
        </div>
      </div>
    </header>
  );
}

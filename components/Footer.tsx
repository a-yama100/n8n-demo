import { HEADER, type Lang } from "@/lib/content";

export function Footer({ lang }: { lang: Lang }) {
  const year = new Date().getFullYear();
  const ja = lang === "ja";
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center space-y-3">
        {ja ? (
          <>
            <p className="text-slate-500 text-sm font-medium">
              n8n による業務自動化の流れを、ブラウザで再現したデモです。n8n、AI のモデル、外部のサービスは使っていません。API キーは不要で、費用もかかりません。
            </p>
            <p className="text-slate-400 text-xs max-w-2xl mx-auto">
              このサイトは PH AI Works が独自に開発したデモで、n8n GmbH との提携関係はなく、同社の推奨や後援も受けていません。「n8n」は n8n GmbH の商標で、このサイトでは想定する自動化の仕組みを説明するためにのみ記載しています。
            </p>
            <p className="text-slate-400 text-sm">
              {"n8n と AI の開発デモ（制作: "}
              <a href={HEADER.ja.home} className="hover:text-slate-700 underline">
                PH AI Works
              </a>
              {"） · "}
              {year}
            </p>
          </>
        ) : (
          <>
            <p className="text-slate-500 text-sm font-medium">
              A standalone demo of n8n automation workflows. The AI step uses fixed rules:
              no live AI calls, no API keys, no cost.
            </p>
            <p className="text-slate-400 text-xs max-w-2xl mx-auto">
              Not affiliated with, endorsed by, or sponsored by n8n GmbH.
              &ldquo;n8n&rdquo; is a trademark of n8n GmbH; it is referenced here only to
              describe the automation tooling used. This is an independent demonstration.
            </p>
            <p className="text-slate-400 text-sm">
              An n8n + AI engineering demo by{" "}
              <a
                href="https://www.phaiworks.com/en"
                className="hover:text-slate-700 underline"
              >
                PH AI Works
              </a>{" "}
              · {year}
            </p>
          </>
        )}
      </div>
    </footer>
  );
}

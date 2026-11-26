// 経歴の経過年数を現在の年から計算する（PHAIWorks-web の lib/profileYears.ts と同じ基準年）。
// 基準年は owner.json（DB keyword_ledger の owner_profile。`kwl.py owner show`）に準拠: IT歴 1990〜。
// 静的に書き出すページでは、ビルドした年で確定する（次のデプロイで更新される）。
const IT_START_YEAR = 1990;

export const itYears = (): number => new Date().getFullYear() - IT_START_YEAR;

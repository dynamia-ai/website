# Localized redesign

The redesigned website is served at `/zh`, `/en` and `/de`. All language links use the existing next-intl routing helpers. The English and German pages use the original international Dynamia logo assets.

`dictionary/redesign/locales/{en,de}.json` contains text translations, locale asset substitutions and the international company introduction. The generator writes server-rendered fragments and copies the catalogs to `public/redesign/locales/`. `localization.js` translates visible text and accessibility labels only; route identifiers, HTML structure, code examples and filter values remain unchanged. Code examples and source architecture illustrations retain their original content.

Main navigation, homepage, product descriptions, forms, FAQs, company introductions, case titles and key results have editorial translations. Existing English article translations were reused where source document structures matched. Remaining historical long-form material has an initial machine translation and needs language and technical review before public release.

International company pages omit the interview, team and timeline. Chinese pages retain them. Updates belong in the catalogs, followed by `npm run redesign:pages` and `npm run build`.

The preview remains a local website; existing demo forms validate locally and do not create sales bookings or send lead data.

## Live community metrics

GitHub stars are read from the official repository API. Container image pulls use Docker Hub `projecthami/hami`, the repository linked in HAMi’s official README. Pulls are cumulative across repository tags, not unique users or downloads within a rolling time window. `/api/community/hami` validates the upstream repository and count, caches successful results for 60 seconds, and returns an explicitly stale snapshot during transient failures. The page refreshes once per minute while visible and on tab return. Display values are floored to integer K; the tooltip keeps the full count and sync time. No static 644K fallback is shown. LFX’s supplied 365-day link is not the source of this cumulative Docker Hub metric.

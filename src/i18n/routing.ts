import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "de"],
  defaultLocale: "en",
  localeDetection: true,
  localePrefix: "as-needed",
});

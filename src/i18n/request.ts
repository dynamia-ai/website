import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

async function loadMessages(locale: string, defaultLocale: string) {
  try {
    return (await import(`../../dictionary/${locale}.json`)).default;
  } catch {
    if (locale !== defaultLocale) {
      return loadMessages(defaultLocale, defaultLocale);
    }
    return {};
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale, routing.defaultLocale),
  };
});

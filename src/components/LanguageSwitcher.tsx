"use client";

import { Check, Globe2 } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("locales");

  const switchTo = (next: string) => {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
    router.replace(pathname, { locale: next });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="language-trigger h-9 gap-1 px-2 focus-visible:border-transparent focus-visible:ring-0"
        >
          <Globe2 className="language-globe size-4 shrink-0" aria-hidden="true" strokeWidth={1.6} />
          <span>{t(locale)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="language-menu min-w-[8.5rem] rounded-lg border-0 bg-white p-1 shadow-lg ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10"
      >
        {routing.locales.map((loc) => {
          const isActive = loc === locale;

          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => switchTo(loc)}
              className={cn(
                "language-menu-item justify-between gap-3 rounded-md px-2.5 py-2",
                "focus:bg-gray-100 dark:focus:bg-gray-800",
                !isActive && "text-muted-foreground"
              )}
            >
              <span className={cn("truncate", isActive && "font-medium text-primary")}>
                {t(loc)}
              </span>
              <Check
                className={cn("size-4 shrink-0 text-primary", !isActive && "invisible")}
                aria-hidden="true"
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

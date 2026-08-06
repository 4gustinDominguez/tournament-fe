"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/navigation";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg border border-white/10">
      <Link
        href={pathname}
        locale="es"
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${
          locale === "es"
            ? "bg-brand-500 text-white shadow-glow"
            : "text-night-100 hover:text-white hover:bg-white/10"
        }`}
      >
        ES
      </Link>
      <Link
        href={pathname}
        locale="en"
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${
          locale === "en"
            ? "bg-brand-500 text-white shadow-glow"
            : "text-night-100 hover:text-white hover:bg-white/10"
        }`}
      >
        EN
      </Link>
    </div>
  );
}

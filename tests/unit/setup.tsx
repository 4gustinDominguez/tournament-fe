import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("next-intl", () => ({
  useLocale: () => "es",
  useTranslations: (namespace: string) => {
    const translate = (key: string) => `${namespace}.${key}`;
    return Object.assign(translate, { rich: translate });
  },
}));

vi.mock("@/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    locale?: string;
  }) => {
    const normalized = props.locale ? `/${props.locale}${href}` : href;
    const { locale: _locale, ...rest } = props;
    return (
      <a href={normalized} {...rest}>
        {children}
      </a>
    );
  },
  redirect: () => {},
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import LocaleSwitcher from "@/components/LocaleSwitcher";

describe("LocaleSwitcher", () => {
  it("renders the ES and EN links", () => {
    render(<LocaleSwitcher />);
    expect(screen.getByText("ES")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("marks the current locale as active", () => {
    render(<LocaleSwitcher />);
    expect(screen.getByText("ES")).toHaveClass("bg-brand-500");
    expect(screen.getByText("EN")).not.toHaveClass("bg-brand-500");
  });

  it("links each option to the current pathname with its locale prefix", () => {
    render(<LocaleSwitcher />);
    expect(screen.getByText("ES")).toHaveAttribute("href", "/es/");
    expect(screen.getByText("EN")).toHaveAttribute("href", "/en/");
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Breadcrumb from "@/components/Breadcrumb";

describe("Breadcrumb", () => {
  it("renders Home as the first item linking to /", () => {
    render(<Breadcrumb items={[]} />);
    expect(screen.getByText("Home")).toHaveAttribute("href", "/");
  });

  it("renders each item", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Mis Torneos", href: "/manage/my-tournaments" },
          { label: "Torneo 1", href: "/manage/my-tournaments/1", active: true },
        ]}
      />,
    );
    expect(screen.getByText("Mis Torneos")).toBeInTheDocument();
    expect(screen.getByText("Torneo 1")).toBeInTheDocument();
  });

  it("links non-active items to their href", () => {
    render(
      <Breadcrumb items={[{ label: "Equipos", href: "/manage/teams" }]} />,
    );
    expect(screen.getByText("Equipos")).toHaveAttribute(
      "href",
      "/manage/teams",
    );
  });

  it("renders the active item as a span, not a link", () => {
    render(
      <Breadcrumb
        items={[{ label: "Actual", href: "/manage/actual", active: true }]}
      />,
    );
    const active = screen.getByText("Actual");
    expect(active.tagName).toBe("SPAN");
    expect(active).not.toHaveAttribute("href");
  });
});

import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("returns an empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("joins truthy class names", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, "b", undefined, null, "c")).toBe("a b c");
  });

  it("accepts conditional objects (clsx syntax)", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("lets tailwind-merge deduplicate conflicting classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("merges arrays", () => {
    expect(cn(["a", "b"], ["c"])).toBe("a b c");
  });
});

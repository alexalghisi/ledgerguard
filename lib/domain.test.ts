import { describe, expect, it } from "vitest";
import { applyRules, budgetRemaining, fingerprint } from "./domain";

describe("fingerprint", () => {
  it("collapses payee whitespace", () => {
    expect(fingerprint("2026-08-01", -1299, "Cafe  Nero")).toBe(
      fingerprint("2026-08-01", -1299, "cafe nero"),
    );
  });
});

describe("applyRules", () => {
  it("matches contains", () => {
    expect(applyRules("STARBUCKS 102", [{ payee_contains: "starbucks", category: "coffee" }])).toBe("coffee");
  });
});

describe("budgetRemaining", () => {
  it("can go negative", () => {
    expect(budgetRemaining(1000, 1200)).toBe(-200);
  });
});

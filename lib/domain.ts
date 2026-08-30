export function normalizePayee(payee: string): string {
  return payee.trim().toLowerCase().replace(/\s+/g, " ");
}

export function fingerprint(postedOn: string, amountCents: number, payee: string): string {
  return `${postedOn}|${amountCents}|${normalizePayee(payee)}`;
}

export function applyRules(
  payee: string,
  rules: { payee_contains: string; category: string }[],
  fallback = "uncategorized",
): string {
  const needle = normalizePayee(payee);
  const hit = rules.find((rule) => needle.includes(rule.payee_contains.toLowerCase()));
  return hit?.category ?? fallback;
}

export function budgetRemaining(limitCents: number, spentCents: number): number {
  return limitCents - spentCents;
}

export function parseCsv(text: string): { date: string; payee: string; amount: string }[] {
  return text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, payee, amount] = line.split(",").map((part) => part.trim());
      return { date, payee, amount };
    })
    .filter((row) => row.date && row.payee && row.amount);
}

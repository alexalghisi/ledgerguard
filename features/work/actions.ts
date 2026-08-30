"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { applyRules, fingerprint, parseCsv } from "@/lib/domain";
import { newId } from "@/lib/utils";

export async function importCsvAction(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const account = await db.query<{ id: string }>(
    "select id from accounts where organization_id = $1 limit 1",
    [user.organizationId],
  );
  const rules = await db.query<{ payee_contains: string; category: string }>(
    "select payee_contains, category from category_rules where organization_id = $1",
    [user.organizationId],
  );
  const rows = parseCsv(String(formData.get("csv") ?? ""));
  let inserted = 0;
  let duplicates = 0;
  for (const row of rows) {
    const amountCents = Math.round(Number(row.amount) * 100);
    const fp = fingerprint(row.date, amountCents, row.payee);
    const category = applyRules(row.payee, rules.rows);
    try {
      await db.query(
        `insert into transactions (id, organization_id, account_id, posted_on, payee, amount_cents, category, fingerprint)
         values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newId(), user.organizationId, account.rows[0].id, row.date, row.payee, amountCents, category, fp],
      );
      inserted += 1;
    } catch {
      duplicates += 1;
    }
  }
  revalidatePath("/app");
  return { inserted, duplicates };
}

export async function addRuleAction(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  await db.query(
    "insert into category_rules (id, organization_id, payee_contains, category) values ($1, $2, $3, $4)",
    [newId(), user.organizationId, String(formData.get("contains") ?? "").trim(), String(formData.get("category") ?? "").trim()],
  );
  revalidatePath("/app/rules");
}

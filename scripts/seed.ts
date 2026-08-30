import { PGlite } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "../lib/db/schema-sql";
import { hashPassword } from "../lib/auth/password";

const email = "demo@ledgerguard.dev";
const orgId = "org_demo";
const userId = "user_demo";

async function main() {
  mkdirSync(path.join(process.cwd(), ".data"), { recursive: true });
  const db = new PGlite(path.join(process.cwd(), ".data", "pglite"));
  await db.waitReady;
  await db.exec(SCHEMA_SQL);
  const passwordHash = await hashPassword("DemoPass123!");
  await db.query("insert into users (id, email, password_hash) values ($1, $2, $3) on conflict (email) do nothing", [userId, email, passwordHash]);
  await db.query("insert into profiles (user_id, display_name) values ($1, $2) on conflict (user_id) do nothing", [userId, "Alex Demo"]);
  await db.query("insert into organizations (id, name, slug) values ($1, $2, $3) on conflict (id) do nothing", [orgId, "Northshore Household", "ledgerguard"]);
  await db.query("insert into organization_members (id, organization_id, user_id, role) values ($1, $2, $3, $4) on conflict do nothing", ["mem_1", orgId, userId, "owner"]);

  const accountId = "acc_checking";
  await db.query("insert into accounts (id, organization_id, name) values ($1, $2, $3)", [accountId, orgId, "Checking"]);
  await db.query("insert into category_rules (id, organization_id, payee_contains, category) values ($1, $2, $3, $4)", ["r1", orgId, "starbucks", "coffee"]);
  await db.query("insert into category_rules (id, organization_id, payee_contains, category) values ($1, $2, $3, $4)", ["r2", orgId, "metro", "transit"]);
  const rows = [
    ["tx1", "2026-08-02", "Starbucks 11", -450, "coffee"],
    ["tx2", "2026-08-03", "Metro Q", -290, "transit"],
    ["tx3", "2026-08-04", "Payroll", 240000, "income"],
  ];
  for (const [id, date, payee, cents, category] of rows) {
    const fp = `${date}|${cents}|${String(payee).toLowerCase()}`;
    await db.query(
      "insert into transactions (id, organization_id, account_id, posted_on, payee, amount_cents, category, fingerprint) values ($1,$2,$3,$4,$5,$6,$7,$8)",
      [id, orgId, accountId, date, payee, cents, category, fp],
    );
  }
  await db.query("insert into budgets (id, organization_id, category, month, limit_cents) values ($1,$2,$3,$4,$5)", ["b1", orgId, "coffee", "2026-08", 4000]);
  await db.query("insert into budgets (id, organization_id, category, month, limit_cents) values ($1,$2,$3,$4,$5)", ["b2", orgId, "transit", "2026-08", 6000]);
  console.log("Seeded LedgerGuard");
}

main();

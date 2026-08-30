import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { budgetRemaining } from "@/lib/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BooksPage() {
  const user = await requireUser();
  const db = await getDb();
  const spent = await db.query<{ category: string; spent: number }>(
    `select category, coalesce(sum(-amount_cents), 0)::int as spent
       from transactions
      where organization_id = $1 and amount_cents < 0
      group by category`,
    [user.organizationId],
  );
  const budgets = await db.query<{ category: string; limit_cents: number }>(
    "select category, limit_cents from budgets where organization_id = $1",
    [user.organizationId],
  );
  const txs = await db.query<{ posted_on: string; payee: string; amount_cents: number; category: string }>(
    "select posted_on, payee, amount_cents, category from transactions where organization_id = $1 order by posted_on desc",
    [user.organizationId],
  );
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Books</h1>
      <p className="text-sm text-muted-foreground">Fictional household. Not advice. Not a bank connection.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {budgets.rows.map((budget) => {
          const used = spent.rows.find((row) => row.category === budget.category)?.spent ?? 0;
          return (
            <Card key={budget.category}>
              <CardHeader><CardTitle>{budget.category}</CardTitle></CardHeader>
              <CardContent className="text-sm">
                Remaining {budgetRemaining(budget.limit_cents, used)} cents vs {budget.limit_cents} limit
              </CardContent>
            </Card>
          );
        })}
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-muted-foreground"><th>Date</th><th>Payee</th><th>Category</th><th>Cents</th></tr></thead>
        <tbody>
          {txs.rows.map((tx, i) => (
            <tr key={i} className="border-t border-border">
              <td className="py-2">{String(tx.posted_on).slice(0, 10)}</td>
              <td>{tx.payee}</td>
              <td>{tx.category}</td>
              <td>{tx.amount_cents}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

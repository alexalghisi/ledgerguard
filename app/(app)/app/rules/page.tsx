import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { addRuleAction } from "@/features/work/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function RulesPage() {
  const user = await requireUser();
  const db = await getDb();
  const rules = await db.query<{ payee_contains: string; category: string }>(
    "select payee_contains, category from category_rules where organization_id = $1",
    [user.organizationId],
  );
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Category rules</h1>
      <ul className="text-sm">
        {rules.rows.map((rule) => (
          <li key={rule.payee_contains}>If payee contains <strong>{rule.payee_contains}</strong> → {rule.category}</li>
        ))}
      </ul>
      <form action={addRuleAction} className="max-w-md space-y-3">
        <div className="space-y-1.5"><Label htmlFor="contains">Payee contains</Label><Input id="contains" name="contains" required /></div>
        <div className="space-y-1.5"><Label htmlFor="category">Category</Label><Input id="category" name="category" required /></div>
        <Button type="submit">Add rule</Button>
      </form>
    </div>
  );
}

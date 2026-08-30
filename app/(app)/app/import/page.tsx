"use client";

import { useState } from "react";
import { importCsvAction } from "@/features/work/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ImportPage() {
  const [result, setResult] = useState<string | null>(null);
  return (
    <form
      className="max-w-xl space-y-4"
      action={async (formData) => {
        const out = await importCsvAction(formData);
        setResult(`Inserted ${out.inserted}, skipped ${out.duplicates} duplicates.`);
      }}
    >
      <h1 className="text-2xl font-semibold">Import CSV</h1>
      <p className="text-sm text-muted-foreground">Header required: date,payee,amount (amount in dollars, negatives are spend).</p>
      <Label htmlFor="csv">CSV</Label>
      <textarea id="csv" name="csv" rows={8} className="w-full rounded-md border border-input bg-card p-3 text-sm" defaultValue={"date,payee,amount\n2026-08-20,Starbucks,-4.50\n2026-08-21,Metro,-2.90"} />
      {result ? <p className="text-sm">{result}</p> : null}
      <Button type="submit">Import</Button>
    </form>
  );
}

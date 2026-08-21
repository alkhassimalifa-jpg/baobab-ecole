"use client";

import { useActionState, useState } from "react";
import { recordPaymentAction, type RecordPaymentState } from "@/lib/actions/record-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: RecordPaymentState = {};

type Student = { id: string; name: string; matricule: string; className: string };
type FeeType = { id: string; name: string; amount: number };

type PaymentFormProps = {
  feeTypes: FeeType[];
  students: Student[];
};

export function PaymentForm({ feeTypes, students }: PaymentFormProps) {
  const [state, formAction, isPending] = useActionState(recordPaymentAction, initialState);
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = query.length > 0
    ? students.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.matricule.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  if (state.success) {
    return (
      <div className="bg-success-bg border border-success rounded-md p-4">
        <p className="text-sm font-semibold text-success">
          Paiement enregistre. Recu : {state.receiptNumber}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <div className="relative">
        <Label htmlFor="studentSearch">Eleve</Label>
        <input type="hidden" name="studentId" value={selectedStudent?.id ?? ""} />
        <Input
          id="studentSearch"
          placeholder="Taper un nom ou un matricule..."
          value={selectedStudent ? `${selectedStudent.name} (${selectedStudent.matricule})` : query}
          onChange={(e) => {
            setSelectedStudent(null);
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          autoComplete="off"
        />
        {showSuggestions && filtered.length > 0 ? (
          <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-56 overflow-y-auto">
            {filtered.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => {
                  setSelectedStudent(s);
                  setQuery("");
                  setShowSuggestions(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-bark-100 border-b border-border last:border-b-0"
              >
                <span className="font-semibold text-foreground">{s.name}</span>
                <span className="text-foreground-muted"> - {s.className} ({s.matricule})</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <Label htmlFor="feeTypeId">Type de frais</Label>
        <select
          id="feeTypeId"
          name="feeTypeId"
          required
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
        >
          <option value="">Selectionner un type de frais</option>
          {feeTypes.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="amount">Montant recu (FCFA)</Label>
        <Input id="amount" name="amount" type="number" required />
      </div>

      <div>
        <Label htmlFor="mode">Mode de paiement</Label>
        <select
          id="mode"
          name="mode"
          required
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
        >
          <option value="CASH">Espece</option>
          <option value="MOBILE_MONEY">Mobile Money</option>
          <option value="CHECK">Cheque</option>
          <option value="BANK_TRANSFER">Virement</option>
        </select>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger bg-danger-bg rounded-md px-3 py-2">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending || !selectedStudent}>
        {isPending ? "Enregistrement..." : "Enregistrer le paiement"}
      </Button>
    </form>
  );
}
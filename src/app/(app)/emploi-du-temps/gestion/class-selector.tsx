"use client";

type ClassSelectorProps = {
  classes: { id: string; name: string }[];
  selectedClassId?: string;
};

export function ClassSelector({ classes, selectedClassId }: ClassSelectorProps) {
  return (
    <form method="get" className="mb-6">
      <select
        name="classId"
        defaultValue={selectedClassId ?? ""}
        className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
        onChange={(e) => e.currentTarget.form?.submit()}
      >
        <option value="">Choisir une classe</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </form>
  );
}
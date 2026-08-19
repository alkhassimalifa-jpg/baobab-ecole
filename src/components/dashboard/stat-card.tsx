type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-bark-100 rounded-md p-3 text-center flex-1">
      <div className="font-display text-xl font-semibold text-bark-700">{value}</div>
      <div className="text-[10px] text-foreground-muted uppercase tracking-wide mt-0.5">
        {label}
      </div>
    </div>
  );
}
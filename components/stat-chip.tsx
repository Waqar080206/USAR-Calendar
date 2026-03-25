interface StatChipProps {
  label: string;
  value: string | number;
}

export function StatChip({ label, value }: StatChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm">
      <span className="text-xs font-medium text-slate-600">{label}:</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

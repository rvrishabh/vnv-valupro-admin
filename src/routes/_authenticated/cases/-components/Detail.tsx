interface DetailProps {
  label: string;
  value?: string | null;
}

export function Detail({ label, value }: DetailProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}
